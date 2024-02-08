import type { Hub } from '@sentry/core';
import { functionToStringIntegration, inboundFiltersIntegration } from '@sentry/core';
import {
  captureSession,
  getClient,
  getCurrentHub,
  getIntegrationsToSetup,
  getReportDialogEndpoint,
  initAndBind,
  startSession,
} from '@sentry/core';
import type { Integration, Options, UserFeedback } from '@sentry/types';
import {
  addHistoryInstrumentationHandler,
  logger,
  stackParserFromStackParserOptions,
  supportsFetch,
} from '@sentry/utils';

import type { BrowserClientOptions, BrowserOptions } from './client';
import { BrowserClient } from './client';
import { DEBUG_BUILD } from './debug-build';
import type { ReportDialogOptions } from './helpers';
import { WINDOW, wrap as internalWrap } from './helpers';
import { breadcrumbsIntegration } from './integrations/breadcrumbs';
import { dedupeIntegration } from './integrations/dedupe';
import { globalHandlersIntegration } from './integrations/globalhandlers';
import { httpContextIntegration } from './integrations/httpcontext';
import { linkedErrorsIntegration } from './integrations/linkederrors';
import { browserApiErrorsIntegration } from './integrations/trycatch';
import { defaultStackParser } from './stack-parsers';
import { makeFetchTransport, makeXHRTransport } from './transports';

/** @deprecated Use `getDefaultIntegrations(options)` instead. */
export const defaultIntegrations = [
  inboundFiltersIntegration(),
  functionToStringIntegration(),
  browserApiErrorsIntegration(),
  breadcrumbsIntegration(),
  globalHandlersIntegration(),
  linkedErrorsIntegration(),
  dedupeIntegration(),
  httpContextIntegration(),
];

/** Get the default integrations for the browser SDK. */
export function getDefaultIntegrations(_options: Options): Integration[] {
  // We return a copy of the defaultIntegrations here to avoid mutating this
  return [
    // eslint-disable-next-line deprecation/deprecation
    ...defaultIntegrations,
  ];
}

/**
 * A magic string that build tooling can leverage in order to inject a release value into the SDK.
 */
declare const __SENTRY_RELEASE__: string | undefined;

/**
 * The Sentry Browser SDK Client.
 *
 * To use this SDK, call the {@link init} function as early as possible when
 * loading the web page. To set context information or send manual events, use
 * the provided methods.
 *
 * @example
 *
 * ```
 *
 * import { init } from '@sentry/browser';
 *
 * init({
 *   dsn: '__DSN__',
 *   // ...
 * });
 * ```
 *
 * @example
 * ```
 *
 * import { addBreadcrumb } from '@sentry/browser';
 * addBreadcrumb({
 *   message: 'My Breadcrumb',
 *   // ...
 * });
 * ```
 *
 * @example
 *
 * ```
 *
 * import * as Sentry from '@sentry/browser';
 * Sentry.captureMessage('Hello, world!');
 * Sentry.captureException(new Error('Good bye'));
 * Sentry.captureEvent({
 *   message: 'Manual',
 *   stacktrace: [
 *     // ...
 *   ],
 * });
 * ```
 *
 * @see {@link BrowserOptions} for documentation on configuration options.
 */
export function init(options: BrowserOptions = {}): void {
  if (options.defaultIntegrations === undefined) {
    options.defaultIntegrations = getDefaultIntegrations(options);
  }
  if (options.release === undefined) {
    // This allows build tooling to find-and-replace __SENTRY_RELEASE__ to inject a release value
    if (typeof __SENTRY_RELEASE__ === 'string') {
      options.release = __SENTRY_RELEASE__;
    }

    // This supports the variable that sentry-webpack-plugin injects
    if (WINDOW.SENTRY_RELEASE && WINDOW.SENTRY_RELEASE.id) {
      options.release = WINDOW.SENTRY_RELEASE.id;
    }
  }
  if (options.autoSessionTracking === undefined) {
    options.autoSessionTracking = true;
  }
  if (options.sendClientReports === undefined) {
    options.sendClientReports = true;
  }

  const clientOptions: BrowserClientOptions = {
    ...options,
    stackParser: stackParserFromStackParserOptions(options.stackParser || defaultStackParser),
    integrations: getIntegrationsToSetup(options),
    transport: options.transport || (supportsFetch() ? makeFetchTransport : makeXHRTransport),
  };

  initAndBind(BrowserClient, clientOptions);

  if (options.autoSessionTracking) {
    startSessionTracking();
  }
}

type NewReportDialogOptions = ReportDialogOptions & { eventId: string }; // eslint-disable-line

interface ShowReportDialogFunction {
  /**
   * Present the user with a report dialog.
   *
   * @param options Everything is optional, we try to fetch all info need from the global scope.
   */
  (options: NewReportDialogOptions): void;

  /**
   * Present the user with a report dialog.
   *
   * @param options Everything is optional, we try to fetch all info need from the global scope.
   *
   * @deprecated Please always pass an `options` argument with `eventId`. The `hub` argument will not be used in the next version of the SDK.
   */
  // eslint-disable-next-line deprecation/deprecation
  (options?: ReportDialogOptions, hub?: Hub): void;
}

export const showReportDialog: ShowReportDialogFunction = (
  // eslint-disable-next-line deprecation/deprecation
  options: ReportDialogOptions = {},
  // eslint-disable-next-line deprecation/deprecation
  hub: Hub = getCurrentHub(),
) => {
  // doesn't work without a document (React Native)
  if (!WINDOW.document) {
    DEBUG_BUILD && logger.error('Global document not defined in showReportDialog call');
    return;
  }

  // eslint-disable-next-line deprecation/deprecation
  const { client, scope } = hub.getStackTop();
  const dsn = options.dsn || (client && client.getDsn());
  if (!dsn) {
    DEBUG_BUILD && logger.error('DSN not configured for showReportDialog call');
    return;
  }

  if (scope) {
    options.user = {
      ...scope.getUser(),
      ...options.user,
    };
  }

  // TODO(v8): Remove this entire if statement. `eventId` will be a required option.
  // eslint-disable-next-line deprecation/deprecation
  if (!options.eventId) {
    // eslint-disable-next-line deprecation/deprecation
    options.eventId = hub.lastEventId();
  }

  const script = WINDOW.document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = getReportDialogEndpoint(dsn, options);

  if (options.onLoad) {
    script.onload = options.onLoad;
  }

  const { onClose } = options;
  if (onClose) {
    const reportDialogClosedMessageHandler = (event: MessageEvent): void => {
      if (event.data === '__sentry_reportdialog_closed__') {
        try {
          onClose();
        } finally {
          WINDOW.removeEventListener('message', reportDialogClosedMessageHandler);
        }
      }
    };
    WINDOW.addEventListener('message', reportDialogClosedMessageHandler);
  }

  const injectionPoint = WINDOW.document.head || WINDOW.document.body;
  if (injectionPoint) {
    injectionPoint.appendChild(script);
  } else {
    DEBUG_BUILD && logger.error('Not injecting report dialog. No injection point found in HTML');
  }
};

/**
 * This function is here to be API compatible with the loader.
 * @hidden
 */
export function forceLoad(): void {
  // Noop
}

/**
 * This function is here to be API compatible with the loader.
 * @hidden
 */
export function onLoad(callback: () => void): void {
  callback();
}

/**
 * Wrap code within a try/catch block so the SDK is able to capture errors.
 *
 * @deprecated This function will be removed in v8.
 * It is not part of Sentry's official API and it's easily replaceable by using a try/catch block
 * and calling Sentry.captureException.
 *
 * @param fn A function to wrap.
 *
 * @returns The result of wrapped function call.
 */
// TODO(v8): Remove this function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function wrap(fn: (...args: any) => any): any {
  return internalWrap(fn)();
}

/**
 * Enable automatic Session Tracking for the initial page load.
 */
function startSessionTracking(): void {
  if (typeof WINDOW.document === 'undefined') {
    DEBUG_BUILD && logger.warn('Session tracking in non-browser environment with @sentry/browser is not supported.');
    return;
  }

  // The session duration for browser sessions does not track a meaningful
  // concept that can be used as a metric.
  // Automatically captured sessions are akin to page views, and thus we
  // discard their duration.
  startSession({ ignoreDuration: true });
  captureSession();

  // We want to create a session for every navigation as well
  addHistoryInstrumentationHandler(({ from, to }) => {
    // Don't create an additional session for the initial route or if the location did not change
    if (from !== undefined && from !== to) {
      startSession({ ignoreDuration: true });
      captureSession();
    }
  });
}

/**
 * Captures user feedback and sends it to Sentry.
 */
export function captureUserFeedback(feedback: UserFeedback): void {
  const client = getClient<BrowserClient>();
  if (client) {
    client.captureUserFeedback(feedback);
  }
}
