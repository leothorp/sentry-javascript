export type {
  Breadcrumb,
  BreadcrumbHint,
  Request,
  SdkInfo,
  Event,
  EventHint,
  Exception,
  SeverityLevel,
  StackFrame,
  Stacktrace,
  Thread,
  Transaction,
  User,
  Session,
} from '@sentry/types';

export type { BrowserOptions } from './client';

// eslint-disable-next-line deprecation/deprecation
export type { ReportDialogOptions } from './helpers';

export {
  // eslint-disable-next-line deprecation/deprecation
  addGlobalEventProcessor,
  addEventProcessor,
  addBreadcrumb,
  addIntegration,
  captureException,
  captureEvent,
  captureMessage,
  close,
  createTransport,
  flush,
  getHubFromCarrier,
  // eslint-disable-next-line deprecation/deprecation
  getCurrentHub,
  getClient,
  isInitialized,
  getCurrentScope,
  Hub,
  // eslint-disable-next-line deprecation/deprecation
  lastEventId,
  // eslint-disable-next-line deprecation/deprecation
  // eslint-disable-next-line deprecation/deprecation
  makeMain,
  setCurrentClient,
  Scope,
  // eslint-disable-next-line deprecation/deprecation
  startTransaction,
  getActiveSpan,
  startSpan,
  startInactiveSpan,
  startSpanManual,
  continueTrace,
  SDK_VERSION,
  setContext,
  setExtra,
  setExtras,
  setTag,
  setTags,
  setUser,
  withScope,
  withIsolationScope,
  // eslint-disable-next-line deprecation/deprecation
  FunctionToString,
  // eslint-disable-next-line deprecation/deprecation
  InboundFilters,
  metrics,
  functionToStringIntegration,
  inboundFiltersIntegration,
  parameterize,
} from '@sentry/core';

export { WINDOW } from './helpers';
export { BrowserClient } from './client';
export { makeFetchTransport, makeXHRTransport } from './transports';
export {
  defaultStackParser,
  defaultStackLineParsers,
  chromeStackLineParser,
  geckoStackLineParser,
  opera10StackLineParser,
  opera11StackLineParser,
  winjsStackLineParser,
} from './stack-parsers';
export { eventFromException, eventFromMessage, exceptionFromError } from './eventbuilder';
export { createUserFeedbackEnvelope } from './userfeedback';
export {
  // eslint-disable-next-line deprecation/deprecation
  defaultIntegrations,
  getDefaultIntegrations,
  forceLoad,
  init,
  onLoad,
  showReportDialog,
  captureUserFeedback,
  // eslint-disable-next-line deprecation/deprecation
  wrap,
} from './sdk';

export { breadcrumbsIntegration } from './integrations/breadcrumbs';
export { dedupeIntegration } from './integrations/dedupe';
export { globalHandlersIntegration } from './integrations/globalhandlers';
export { httpContextIntegration } from './integrations/httpcontext';
export { linkedErrorsIntegration } from './integrations/linkederrors';
export { browserApiErrorsIntegration } from './integrations/trycatch';

// eslint-disable-next-line deprecation/deprecation
export { TryCatch, Breadcrumbs, LinkedErrors, HttpContext, Dedupe } from './integrations';
