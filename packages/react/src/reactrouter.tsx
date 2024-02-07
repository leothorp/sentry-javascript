import {
  WINDOW,
  browserTracingIntegration,
  startBrowserTracingNavigationSpan,
  startBrowserTracingPageLoadSpan,
} from '@sentry/browser';
import {
  SEMANTIC_ATTRIBUTE_SENTRY_OP,
  SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN,
  SEMANTIC_ATTRIBUTE_SENTRY_SOURCE,
  getActiveSpan,
  getRootSpan,
  spanToJSON,
} from '@sentry/core';
import type { Integration, Span, StartSpanOptions, Transaction, TransactionSource } from '@sentry/types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import * as React from 'react';

import type { Action, Location, ReactRouterInstrumentation } from './types';

// We need to disable eslint no-explict-any because any is required for the
// react-router typings.
type Match = { path: string; url: string; params: Record<string, any>; isExact: boolean }; // eslint-disable-line @typescript-eslint/no-explicit-any

export type RouterHistory = {
  location?: Location;
  listen?(cb: (location: Location, action: Action) => void): void;
} & Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export type RouteConfig = {
  [propName: string]: unknown;
  path?: string | string[];
  exact?: boolean;
  component?: JSX.Element;
  routes?: RouteConfig[];
};

export type MatchPath = (pathname: string, props: string | string[] | any, parent?: Match | null) => Match | null; // eslint-disable-line @typescript-eslint/no-explicit-any

interface ReactRouterOptions {
  history: RouterHistory;
  routes?: RouteConfig[];
  matchPath?: MatchPath;
}

let activeTransaction: Transaction | undefined;

/**
 * A browser tracing integration that uses React Router v4 to instrument navigations.
 * Expects `history` (and optionally `routes` and `matchPath`) to be passed as options.
 */
export function reactRouterV4BrowserTracingIntegration(
  options: Parameters<typeof browserTracingIntegration>[0] & ReactRouterOptions,
): Integration {
  const integration = browserTracingIntegration({
    ...options,
    instrumentPageLoad: false,
    instrumentNavigation: false,
  });

  const { history, routes, matchPath, instrumentPageLoad = true, instrumentNavigation = true } = options;

  return {
    ...integration,
    afterAllSetup(client) {
      integration.afterAllSetup(client);

      const startPageloadCallback = (startSpanOptions: StartSpanOptions): undefined => {
        startBrowserTracingPageLoadSpan(client, startSpanOptions);
        return undefined;
      };

      const startNavigationCallback = (startSpanOptions: StartSpanOptions): undefined => {
        startBrowserTracingNavigationSpan(client, startSpanOptions);
        return undefined;
      };

      const instrumentation = createReactRouterInstrumentation(history, 'reactrouter_v4', routes, matchPath);

      // Now instrument page load & navigation with correct settings
      instrumentation(startPageloadCallback, instrumentPageLoad, false);
      instrumentation(startNavigationCallback, false, instrumentNavigation);
    },
  };
}

/**
 * A browser tracing integration that uses React Router v5 to instrument navigations.
 * Expects `history` (and optionally `routes` and `matchPath`) to be passed as options.
 */
export function reactRouterV5BrowserTracingIntegration(
  options: Parameters<typeof browserTracingIntegration>[0] & ReactRouterOptions,
): Integration {
  const integration = browserTracingIntegration({
    ...options,
    instrumentPageLoad: false,
    instrumentNavigation: false,
  });

  const { history, routes, matchPath } = options;

  return {
    ...integration,
    afterAllSetup(client) {
      integration.afterAllSetup(client);

      const startPageloadCallback = (startSpanOptions: StartSpanOptions): undefined => {
        startBrowserTracingPageLoadSpan(client, startSpanOptions);
        return undefined;
      };

      const startNavigationCallback = (startSpanOptions: StartSpanOptions): undefined => {
        startBrowserTracingNavigationSpan(client, startSpanOptions);
        return undefined;
      };

      const instrumentation = createReactRouterInstrumentation(history, 'reactrouter_v5', routes, matchPath);

      // Now instrument page load & navigation with correct settings
      instrumentation(startPageloadCallback, options.instrumentPageLoad, false);
      instrumentation(startNavigationCallback, false, options.instrumentNavigation);
    },
  };
}

function createReactRouterInstrumentation(
  history: RouterHistory,
  instrumentationName: string,
  allRoutes: RouteConfig[] = [],
  matchPath?: MatchPath,
): ReactRouterInstrumentation {
  function getInitPathName(): string | undefined {
    if (history && history.location) {
      return history.location.pathname;
    }

    if (WINDOW && WINDOW.location) {
      return WINDOW.location.pathname;
    }

    return undefined;
  }

  /**
   * Normalizes a transaction name. Returns the new name as well as the
   * source of the transaction.
   *
   * @param pathname The initial pathname we normalize
   */
  function normalizeTransactionName(pathname: string): [string, TransactionSource] {
    if (allRoutes.length === 0 || !matchPath) {
      return [pathname, 'url'];
    }

    const branches = matchRoutes(allRoutes, pathname, matchPath);
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let x = 0; x < branches.length; x++) {
      if (branches[x].match.isExact) {
        return [branches[x].match.path, 'route'];
      }
    }

    return [pathname, 'url'];
  }

  return (customStartTransaction, startTransactionOnPageLoad = true, startTransactionOnLocationChange = true): void => {
    const initPathName = getInitPathName();

    if (startTransactionOnPageLoad && initPathName) {
      const [name, source] = normalizeTransactionName(initPathName);
      activeTransaction = customStartTransaction({
        name,
        attributes: {
          [SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'pageload',
          [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: `auto.pageload.react.${instrumentationName}`,
          [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: source,
        },
      });
    }

    if (startTransactionOnLocationChange && history.listen) {
      history.listen((location, action) => {
        if (action && (action === 'PUSH' || action === 'POP')) {
          if (activeTransaction) {
            activeTransaction.end();
          }

          const [name, source] = normalizeTransactionName(location.pathname);
          activeTransaction = customStartTransaction({
            name,
            attributes: {
              [SEMANTIC_ATTRIBUTE_SENTRY_OP]: 'navigation',
              [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: `auto.navigation.react.${instrumentationName}`,
              [SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: source,
            },
          });
        }
      });
    }
  };
}

/**
 * Matches a set of routes to a pathname
 * Based on implementation from
 */
function matchRoutes(
  routes: RouteConfig[],
  pathname: string,
  matchPath: MatchPath,
  branch: Array<{ route: RouteConfig; match: Match }> = [],
): Array<{ route: RouteConfig; match: Match }> {
  routes.some(route => {
    const match = route.path
      ? matchPath(pathname, route)
      : branch.length
        ? branch[branch.length - 1].match // use parent match
        : computeRootMatch(pathname); // use default "root" match

    if (match) {
      branch.push({ route, match });

      if (route.routes) {
        matchRoutes(route.routes, pathname, matchPath, branch);
      }
    }

    return !!match;
  });

  return branch;
}

function computeRootMatch(pathname: string): Match {
  return { path: '/', url: '/', params: {}, isExact: pathname === '/' };
}

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
export function withSentryRouting<P extends Record<string, any>, R extends React.ComponentType<P>>(Route: R): R {
  const componentDisplayName = (Route as any).displayName || (Route as any).name;

  const activeRootSpan = getActiveRootSpan();

  const WrappedRoute: React.FC<P> = (props: P) => {
    if (activeRootSpan && props && props.computedMatch && props.computedMatch.isExact) {
      activeRootSpan.updateName(props.computedMatch.path);
      activeRootSpan.setAttribute(SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, 'route');
    }

    // @ts-expect-error Setting more specific React Component typing for `R` generic above
    // will break advanced type inference done by react router params:
    // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/13dc4235c069e25fe7ee16e11f529d909f9f3ff8/types/react-router/index.d.ts#L154-L164
    return <Route {...props} />;
  };

  WrappedRoute.displayName = `sentryRoute(${componentDisplayName})`;
  hoistNonReactStatics(WrappedRoute, Route);
  // @ts-expect-error Setting more specific React Component typing for `R` generic above
  // will break advanced type inference done by react router params:
  // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/13dc4235c069e25fe7ee16e11f529d909f9f3ff8/types/react-router/index.d.ts#L154-L164
  return WrappedRoute;
}
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */

function getActiveRootSpan(): Span | undefined {
  // Legacy behavior for "old" react router instrumentation
  if (activeTransaction) {
    return activeTransaction;
  }

  const span = getActiveSpan();
  const rootSpan = span ? getRootSpan(span) : undefined;

  if (!rootSpan) {
    return undefined;
  }

  const op = spanToJSON(rootSpan).op;

  // Only use this root span if it is a pageload or navigation span
  return op === 'navigation' || op === 'pageload' ? rootSpan : undefined;
}
