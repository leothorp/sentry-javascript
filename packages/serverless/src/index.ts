// https://medium.com/unsplash/named-namespace-imports-7345212bbffb
import * as AWSLambda from './awslambda';
import * as GCPFunction from './gcpfunction';
export { AWSLambda, GCPFunction };

// eslint-disable-next-line deprecation/deprecation
export { AWSServices, awsServicesIntegration } from './awsservices';

// TODO(v8): We have to explicitly export these because of the namespace exports
// above. This is because just doing `export * from '@sentry/node'` will not
// work with Node native esm while we also have namespace exports in a package.
// What we should do is get rid of the namespace exports.
export {
  Hub,
  SDK_VERSION,
  Scope,
  addBreadcrumb,
  // eslint-disable-next-line deprecation/deprecation
  addGlobalEventProcessor,
  addEventProcessor,
  addIntegration,
  autoDiscoverNodePerformanceMonitoringIntegrations,
  captureEvent,
  captureException,
  captureMessage,
  captureCheckIn,
  withMonitor,
  createTransport,
  // eslint-disable-next-line deprecation/deprecation
  getActiveTransaction,
  // eslint-disable-next-line deprecation/deprecation
  getCurrentHub,
  getClient,
  isInitialized,
  getCurrentScope,
  getGlobalScope,
  getIsolationScope,
  getHubFromCarrier,
  getSpanStatusFromHttpCode,
  setHttpStatus,
  // eslint-disable-next-line deprecation/deprecation
  makeMain,
  setCurrentClient,
  setContext,
  setExtra,
  setExtras,
  setTag,
  setTags,
  setUser,
  // eslint-disable-next-line deprecation/deprecation
  startTransaction,
  withScope,
  withIsolationScope,
  NodeClient,
  makeNodeTransport,
  close,
  // eslint-disable-next-line deprecation/deprecation
  defaultIntegrations,
  getDefaultIntegrations,
  defaultStackParser,
  flush,
  getSentryRelease,
  init,
  // eslint-disable-next-line deprecation/deprecation
  lastEventId,
  DEFAULT_USER_INCLUDES,
  addRequestDataToEvent,
  extractRequestData,
  Handlers,
  // eslint-disable-next-line deprecation/deprecation
  Integrations,
  setMeasurement,
  getActiveSpan,
  startSpan,
  // eslint-disable-next-line deprecation/deprecation
  startActiveSpan,
  startInactiveSpan,
  startSpanManual,
  continueTrace,
  parameterize,
  requestDataIntegration,
  linkedErrorsIntegration,
  inboundFiltersIntegration,
  functionToStringIntegration,
  // eslint-disable-next-line deprecation/deprecation
  getModuleFromFilename,
  createGetModuleFromFilename,
  metrics,
  // eslint-disable-next-line deprecation/deprecation
  extractTraceparentData,
  runWithAsyncContext,
  consoleIntegration,
  onUncaughtExceptionIntegration,
  onUnhandledRejectionIntegration,
  modulesIntegration,
  contextLinesIntegration,
  nodeContextIntegration,
  localVariablesIntegration,
  anrIntegration,
  hapiIntegration,
  httpIntegration,
  nativeNodeFetchintegration,
  spotlightIntegration,
} from '@sentry/node';
