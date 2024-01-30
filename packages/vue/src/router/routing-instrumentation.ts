import { WINDOW } from '@sentry/browser';
import { SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, captureException, spanToJSON } from '@sentry/core';
import type { Transaction, TransactionContext, TransactionSource } from '@sentry/types';

import { getActiveTransaction } from '../tracing';
import { DEFAULT_VUE_ROUTER_TAGS } from './constants';
import type { VueRouter } from './types';

export interface VueRouterInstrumentationOptions {
  /**
   * What to use for route labels.
   * By default, we use route.name (if set) and else the path.
   *
   * Default: 'name'
   */
  routeLabel: 'name' | 'path';
}

export type VueRouterInstrumentation = <T extends Transaction>(
  startTransaction: (context: TransactionContext) => T | undefined,
  startTransactionOnPageLoad?: boolean,
  startTransactionOnLocationChange?: boolean,
) => void;

/**
 * Creates routing instrumentation for Vue Router v2, v3 and v4
 *
 * You can optionally pass in an options object with the available option:
 * * `routeLabel`: Set this to `route` to opt-out of using `route.name` for transaction names.
 *
 * @param router The Vue Router instance that is used
 */
export function vueRouterInstrumentation(
  router: VueRouter,
  options: Partial<VueRouterInstrumentationOptions> = {},
): VueRouterInstrumentation {
  return (
    startTransaction: (context: TransactionContext) => Transaction | undefined,
    startTransactionOnPageLoad: boolean = true,
    startTransactionOnLocationChange: boolean = true,
  ) => {
    // We have to start the pageload transaction as early as possible (before the router's `beforeEach` hook
    // is called) to not miss child spans of the pageload.
    // We check that window & window.location exists in order to not run this code in SSR environments.
    if (startTransactionOnPageLoad && WINDOW && WINDOW.location) {
      startTransaction({
        name: WINDOW.location.pathname,
        op: 'pageload',
        origin: 'auto.pageload.vue',
        tags: DEFAULT_VUE_ROUTER_TAGS,
        data: {
          [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: 'url',
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

      const data: Record<string, unknown> = {
        params: to.params,
        query: to.query,
      };

      // Determine a name for the routing transaction and where that name came from
      let transactionName: string = to.path;
      let transactionSource: TransactionSource = 'url';
      if (to.name && options.routeLabel !== 'path') {
        transactionName = to.name.toString();
        transactionSource = 'custom';
      } else if (to.matched[0] && to.matched[0].path) {
        transactionName = to.matched[0].path;
        transactionSource = 'route';
      }

      if (startTransactionOnPageLoad && isPageLoadNavigation) {
        // eslint-disable-next-line deprecation/deprecation
        const pageloadTransaction = getActiveTransaction();
        if (pageloadTransaction) {
          const attributes = spanToJSON(pageloadTransaction).data || {};
          if (attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] !== 'custom') {
            pageloadTransaction.updateName(transactionName);
            pageloadTransaction.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, transactionSource);
          }
          // TODO: We need to flatten these to make them attributes
          // eslint-disable-next-line deprecation/deprecation
          pageloadTransaction.setData('params', data.params);
          // eslint-disable-next-line deprecation/deprecation
          pageloadTransaction.setData('query', data.query);
        }
      }

      if (startTransactionOnLocationChange && !isPageLoadNavigation) {
        data[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE] = transactionSource;
        startTransaction({
          name: transactionName,
          op: 'navigation',
          origin: 'auto.navigation.vue',
          tags: DEFAULT_VUE_ROUTER_TAGS,
          data,
        });
      }

      // Vue Router 4 no longer exposes the `next` function, so we need to
      // check if it's available before calling it.
      // `next` needs to be called in Vue Router 3 so that the hook is resolved.
      if (next) {
        next();
      }
    });
  };
}
