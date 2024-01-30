import { WINDOW, startBrowserTracingNavigationSpan, startBrowserTracingPageLoadSpan } from '@sentry/browser';
import {
  SEMANTIC_ATTRIBUTE_SENTRY_OP,
  SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN,
  SEMANTIC_ATTRIBUTE_SENTRY_SOURCE,
  captureException,
  defineIntegration,
  getActiveSpan,
  getRootSpan,
  spanToJSON,
} from '@sentry/core';
import type { IntegrationFn, TransactionSource } from '@sentry/types';
import { DEFAULT_VUE_ROUTER_TAGS } from './constants';
import type { VueRouterInstrumentationOptions } from './routing-instrumentation';

import type { VueRouter } from './types';

interface VueRouterIntegrationOptions extends Partial<VueRouterInstrumentationOptions> {
  /**
   * The Vue Router instance that is used
   */
  router: VueRouter;
}
const INTEGRATION_NAME = 'VueRouter';

const _vueRouterIntegration = (({ router, routeLabel }: VueRouterIntegrationOptions) => {
  return {
    name: INTEGRATION_NAME,
    // TODO v8: Remove this
    setupOnce() {}, // eslint-disable-line @typescript-eslint/no-empty-function
    setup(client) {
      // We have to start the pageload transaction as early as possible (before the router's `beforeEach` hook
      // is called) to not miss child spans of the pageload.
      // We check that window & window.location exists in order to not run this code in SSR environments.
      if (WINDOW && WINDOW.location) {
        startBrowserTracingPageLoadSpan(client, {
          name: WINDOW.location.pathname,
          data: {
            [SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'pageload',
            [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'url',
            [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.pageload.vue',
          },
        });
      }

      router.onError(error => captureException(error, { mechanism: { handled: false } }));

      router.beforeEach((to, from, next) => {
        // According to docs we could use `from === VueRouter.START_LOCATION` but I couldnt get it working for Vue 2
        // https://router.vuejs.org/api/#router-start-location
        // https://next.router.vuejs.org/api/#start-location

        // from.name:
        // - Vue 2: null
        // - Vue 3: undefined
        // hence only '==' instead of '===', because `undefined == null` evaluates to `true`
        const isPageLoadNavigation = from.name == null && from.matched.length === 0;

        const attributes: Record<string, unknown> = DEFAULT_VUE_ROUTER_TAGS;
        try {
          for (const [key, value] of Object.entries(to.params)) {
            attributes[`vue.router.param.${key}`] = value;
          }
          for (const [key, value] of Object.entries(to.query)) {
            attributes[`vue.router.query.${key}`] = value;
          }
        } catch (_oO) {} // eslint-disable-line no-empty

        // Determine a name for the routing transaction and where that name came from
        let transactionName: string = to.path;
        let transactionSource: TransactionSource = 'url';
        if (to.name && routeLabel !== 'path') {
          transactionName = to.name.toString();
          transactionSource = 'custom';
        } else if (to.matched[0] && to.matched[0].path) {
          transactionName = to.matched[0].path;
          transactionSource = 'route';
        }

        if (isPageLoadNavigation) {
          // eslint-disable-next-line deprecation/deprecation
          const rootSpan = getRootSpan(getActiveSpan());
          if (rootSpan) {
            const attributes = spanToJSON(rootSpan).data || {};
            if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] !== 'custom') {
              rootSpan.updateName(transactionName);
              rootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, transactionSource);
            }
            rootSpan.setAttributes(attributes);
          }
        } else {
          startBrowserTracingNavigationSpan(client, {
            name: transactionName,
            attributes: {
              ...attributes,
              [SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'navigation',
              [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: 'auto.navigation.vue',
              [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: transactionSource,
            },
          });
        }
        // Vue Router 4 no longer exposes the `next` function, so we need to
        // check if it's available before calling it.
        // `next` needs to be called in Vue Router 3 so that the hook is resolved.
        if (next) {
          next();
        }
      });
    },
  };
}) satisfies IntegrationFn;

export const vueRouterIntegration = defineIntegration(_vueRouterIntegration);
