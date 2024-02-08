# Upgrading from 7.x to 8.x

## Removal of Severity Enum

In v7 we deprecated the `Severity` enum in favor of using the `SeverityLevel` type. In v8 we removed the `Severity`
enum. If you were using the `Severity` enum, you should replace it with the `SeverityLevel` type. See
[below](#severity-severitylevel-and-severitylevels) for code snippet examples

## Removal of the `Offline` integration

The `Offline` integration has been removed in favor of the offline transport wrapper:
http://docs.sentry.io/platforms/javascript/configuration/transports/#offline-caching

## Removal of `Sentry.configureScope`.

The top level `Sentry.configureScope` function has been removed. Instead, you should use the `Sentry.getCurrentScope()` to access and mutate the current scope.

## Other changes

- Remove `spanStatusfromHttpCode` in favour of `getSpanStatusFromHttpCode` (#10361)

# Deprecations in 7.x

You can use the **Experimental** [@sentry/migr8](https://www.npmjs.com/package/@sentry/migr8) to automatically update
your SDK usage and fix most deprecations. This requires Node 18+.

```bash
npx @sentry/migr8@latest
```

This will let you select which updates to run, and automatically update your code. Make sure to still review all code
changes!

## Depreacted `BrowserTracing` integration

The `BrowserTracing` integration, together with the custom routing instrumentations passed to it, are deprecated in v8.
Instead, you should use `Sentry.browserTracingIntegration()`.

Package-specific browser tracing integrations are available directly. In most cases, there is a single integration
provided for each package, which will make sure to set up performance tracing correctly for the given SDK. For react, we
provide multiple integrations to cover different router integrations:

### `@sentry/browser`, `@sentry/svelte`, `@sentry/gatsby`

```js
import * as Sentry from '@sentry/browser';

Sentry.init({
  integrations: [Sentry.browserTracingIntegration()],
});
```

### `@sentry/react`

```js
import * as Sentry from '@sentry/react';

Sentry.init({
  integrations: [
    // No react router
    Sentry.browserTracingIntegration(),
    // OR, if you are using react router, instead use one of the following:
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
      stripBasename,
    }),
    Sentry.reactRouterV5BrowserTracingIntegration({
      history,
    }),
    Sentry.reactRouterV4BrowserTracingIntegration({
      history,
    }),
    Sentry.reactRouterV3BrowserTracingIntegration({
      history,
      routes,
      match,
    }),
  ],
});
```

### `@sentry/vue`

```js
import * as Sentry from '@sentry/vue';

Sentry.init({
  integrations: [
    Sentry.browserTracingIntegration({
      // pass router in, if applicable
      router,
    }),
  ],
});
```

### `@sentry/angular` & `@sentry/angular-ivy`

```js
import * as Sentry from '@sentry/angular';

Sentry.init({
  integrations: [Sentry.browserTracingIntegration()],
});

// You still need to add the Trace Service like before!
```

### `@sentry/remix`

```js
import * as Sentry from '@sentry/remix';

Sentry.init({
  integrations: [
    Sentry.browserTracingIntegration({
      useEffect,
      useLocation,
      useMatches,
    }),
  ],
});
```

### `@sentry/nextjs`, `@sentry/astro`, `@sentry/sveltekit`

Browser tracing is automatically set up for you in these packages. If you need to customize the options, you can do it
like this:

```js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  integrations: [
    Sentry.browserTracingIntegration({
      // add custom options here
    }),
  ],
});
```

### `@sentry/ember`

Browser tracing is automatically set up for you. You can configure it as before through configuration.

## Deprecated `transactionContext` passed to `tracesSampler`

Instead of an `transactionContext` being passed to the `tracesSampler` callback, the callback will directly receive
`name` and `attributes` going forward. You can use these to make your sampling decisions, while `transactionContext`
will be removed in v8. Note that the `attributes` are only the attributes at span creation time, and some attributes may
only be set later during the span lifecycle (and thus not be available during sampling).

## Deprecate using `getClient()` to check if the SDK was initialized

In v8, `getClient()` will stop returning `undefined` if `Sentry.init()` was not called. For cases where this may be used
to check if Sentry was actually initialized, using `getClient()` will thus not work anymore. Instead, you should use the
new `Sentry.isInitialized()` utility to check this.

## Deprecate `getCurrentHub()`

In v8, you will no longer have a Hub, only Scopes as a concept. This also means that `getCurrentHub()` will eventually
be removed.

Instead of `getCurrentHub()`, use the respective replacement API directly - see [Deprecate Hub](#deprecate-hub) for
details.

## Deprecate class-based integrations

In v7, integrations are classes and can be added as e.g. `integrations: [new Sentry.Integrations.ContextLines()]`. In
v8, integrations will not be classes anymore, but instead functions. Both the use as a class, as well as accessing
integrations from the `Integrations.XXX` hash, is deprecated in favor of using the new functional integrations

- for example, `new Integrations.LinkedErrors()` becomes `linkedErrorsIntegration()`.

The following list shows how integrations should be migrated:

| Old                          | New                                 | Packages                                                                                                |
| ---------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `new BrowserTracing()`       | `browserTracingIntegration()`       | `@sentry/browser`                                                                                       |
| `new InboundFilters()`       | `inboundFiltersIntegration()`       | `@sentry/core`, `@sentry/browser`, `@sentry/node`, `@sentry/deno`, `@sentry/bun`, `@sentry/vercel-edge` |
| `new FunctionToString()`     | `functionToStringIntegration()`     | `@sentry/core`, `@sentry/browser`, `@sentry/node`, `@sentry/deno`, `@sentry/bun`, `@sentry/vercel-edge` |
| `new LinkedErrors()`         | `linkedErrorsIntegration()`         | `@sentry/core`, `@sentry/browser`, `@sentry/node`, `@sentry/deno`, `@sentry/bun`, `@sentry/vercel-edge` |
| `new ModuleMetadata()`       | `moduleMetadataIntegration()`       | `@sentry/core`, `@sentry/browser`                                                                       |
| `new RequestData()`          | `requestDataIntegration()`          | `@sentry/core`, `@sentry/node`, `@sentry/deno`, `@sentry/bun`, `@sentry/vercel-edge`                    |
| `new Wasm() `                | `wasmIntegration()`                 | `@sentry/wasm`                                                                                          |
| `new Replay()`               | `replayIntegration()`               | `@sentry/browser`                                                                                       |
| `new ReplayCanvas()`         | `replayCanvasIntegration()`         | `@sentry/browser`                                                                                       |
| `new Feedback()`             | `feedbackIntegration()`             | `@sentry/browser`                                                                                       |
| `new CaptureConsole()`       | `captureConsoleIntegration()`       | `@sentry/integrations`                                                                                  |
| `new Debug()`                | `debugIntegration()`                | `@sentry/integrations`                                                                                  |
| `new Dedupe()`               | `dedupeIntegration()`               | `@sentry/browser`, `@sentry/integrations`, `@sentry/deno`                                               |
| `new ExtraErrorData()`       | `extraErrorDataIntegration()`       | `@sentry/integrations`                                                                                  |
| `new ReportingObserver()`    | `reportingObserverIntegration()`    | `@sentry/integrations`                                                                                  |
| `new RewriteFrames()`        | `rewriteFramesIntegration()`        | `@sentry/integrations`                                                                                  |
| `new SessionTiming()`        | `sessionTimingIntegration()`        | `@sentry/integrations`                                                                                  |
| `new HttpClient()`           | `httpClientIntegration()`           | `@sentry/integrations`                                                                                  |
| `new ContextLines()`         | `contextLinesIntegration()`         | `@sentry/integrations`, `@sentry/node`, `@sentry/deno`, `@sentry/bun`                                   |
| `new Breadcrumbs()`          | `breadcrumbsIntegration()`          | `@sentry/browser`, `@sentry/deno`                                                                       |
| `new GlobalHandlers()`       | `globalHandlersIntegration()`       | `@sentry/browser` , `@sentry/deno`                                                                      |
| `new HttpContext()`          | `httpContextIntegration()`          | `@sentry/browser`                                                                                       |
| `new TryCatch()`             | `browserApiErrorsIntegration()`     | `@sentry/browser`, `@sentry/deno`                                                                       |
| `new VueIntegration()`       | `vueIntegration()`                  | `@sentry/vue`                                                                                           |
| `new DenoContext()`          | `denoContextIntegration()`          | `@sentry/deno`                                                                                          |
| `new DenoCron()`             | `denoCronIntegration()`             | `@sentry/deno`                                                                                          |
| `new NormalizePaths()`       | `normalizePathsIntegration()`       | `@sentry/deno`                                                                                          |
| `new Console()`              | `consoleIntegration()`              | `@sentry/node`                                                                                          |
| `new Context()`              | `nodeContextIntegration()`          | `@sentry/node`                                                                                          |
| `new Modules()`              | `modulesIntegration()`              | `@sentry/node`                                                                                          |
| `new OnUncaughtException()`  | `onUncaughtExceptionIntegration()`  | `@sentry/node`                                                                                          |
| `new OnUnhandledRejection()` | `onUnhandledRejectionIntegration()` | `@sentry/node`                                                                                          |
| `new LocalVariables()`       | `localVariablesIntegration()`       | `@sentry/node`                                                                                          |
| `new Spotlight()`            | `spotlightIntegration()`            | `@sentry/node`                                                                                          |
| `new Anr()`                  | `anrIntegration()`                  | `@sentry/node`                                                                                          |
| `new Hapi()`                 | `hapiIntegration()`                 | `@sentry/node`                                                                                          |
| `new Undici()`               | `nativeNodeFetchIntegration()`      | `@sentry/node`                                                                                          |
| `new Http()`                 | `httpIntegration()`                 | `@sentry/node`                                                                                          |

## Deprecate `hub.bindClient()` and `makeMain()`

Instead, either directly use `initAndBind()`, or the new APIs `setCurrentClient()` and `client.init()`. See
[Initializing the SDK in v8](./docs/v8-initializing.md) for more details.

## Deprecate `Transaction` integration

This pluggable integration from `@sentry/integrations` will be removed in v8. It was already undocumented and is not
necessary for the SDK to work as expected.

## Changed integration interface

In v8, integrations passed to a client will have an optional `setupOnce()` hook. Currently, this hook is always present,
but in v8 you will not be able to rely on this always existing anymore - any integration _may_ have a `setup` and/or a
`setupOnce` hook. Additionally, `setupOnce()` will not receive any arguments anymore.

This should not affect most people, but in the case that you are manually calling `integration.setupOnce()` right now,
make sure to guard it's existence properly.

## Deprecate `getIntegration()` and `getIntegrationById()`

This deprecates `getIntegration()` on both the hub & the client, as well as `getIntegrationById()` on the baseclient.
Instead, use `getIntegrationByName()`. You can optionally pass an integration generic to make it easier to work with
typescript:

```ts
const replay = getClient().getIntegrationByName<Replay>('Replay');
```

## Deprecate `Hub`

The `Hub` has been a very important part of the Sentry SDK API up until now. Hubs were the SDK's "unit of concurrency"
to keep track of data across threads and to scope data to certain parts of your code. Because it is overly complicated
and confusing to power users, it is going to be replaced by a set of new APIs: the "new Scope API".

`Scope`s have existed before in the SDK but we are now expanding on them because we have found them powerful enough to
fully cover the `Hub` API.

If you are using the `Hub` right now, see the following table on how to migrate to the new API:

| Old `Hub` API          | New `Scope` API                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `new Hub()`            | `withScope()`, `withIsolationScope()` or `new Scope()`                               |
| hub.isOlderThan()      | REMOVED - Was used to compare `Hub` instances, which are gonna be removed            |
| hub.bindClient()       | A combination of `scope.setClient()` and `client.init()`                             |
| hub.pushScope()        | `Sentry.withScope()`                                                                 |
| hub.popScope()         | `Sentry.withScope()`                                                                 |
| hub.withScope()        | `Sentry.withScope()`                                                                 |
| getClient()            | `Sentry.getClient()`                                                                 |
| getScope()             | `Sentry.getCurrentScope()` to get the currently active scope                         |
| getIsolationScope()    | `Sentry.getIsolationScope()`                                                         |
| getStack()             | REMOVED - The stack used to hold scopes. Scopes are used directly now                |
| getStackTop()          | REMOVED - The stack used to hold scopes. Scopes are used directly now                |
| captureException()     | `Sentry.captureException()`                                                          |
| captureMessage()       | `Sentry.captureMessage()`                                                            |
| captureEvent()         | `Sentry.captureEvent()`                                                              |
| lastEventId()          | REMOVED - Use event processors or beforeSend instead                                 |
| addBreadcrumb()        | `Sentry.addBreadcrumb()`                                                             |
| setUser()              | `Sentry.setUser()`                                                                   |
| setTags()              | `Sentry.setTags()`                                                                   |
| setExtras()            | `Sentry.setExtras()`                                                                 |
| setTag()               | `Sentry.setTag()`                                                                    |
| setExtra()             | `Sentry.setExtra()`                                                                  |
| setContext()           | `Sentry.setContext()`                                                                |
| configureScope()       | REMOVED - Scopes are now the unit of concurrency                                     |
| run()                  | `Sentry.withScope()` or `Sentry.withIsolationScope()`                                |
| getIntegration()       | `client.getIntegration()`                                                            |
| startTransaction()     | `Sentry.startSpan()`, `Sentry.startInactiveSpan()` or `Sentry.startSpanManual()`     |
| traceHeaders()         | REMOVED - The closest equivalent is now `spanToTraceHeader(getActiveSpan())`         |
| captureSession()       | `Sentry.captureSession()`                                                            |
| startSession()         | `Sentry.startSession()`                                                              |
| endSession()           | `Sentry.endSession()`                                                                |
| shouldSendDefaultPii() | REMOVED - The closest equivalent is `Sentry.getClient().getOptions().sendDefaultPii` |

## Deprecate `client.setupIntegrations()`

Instead, use the new `client.init()` method. You should probably not use this directly and instead use `Sentry.init()`,
which calls this under the hood. But if you have a special use case that requires that, you can call `client.init()`
instead now.

## Deprecate `scope.getSpan()` and `scope.setSpan()`

Instead, you can get the currently active span via `Sentry.getActiveSpan()`. Setting a span on the scope happens
automatically when you use the new performance APIs `startSpan()` and `startSpanManual()`.

## Deprecate `scope.setTransactionName()`

Instead, either set this as attributes or tags, or use an event processor to set `event.transaction`.

## Deprecate `scope.getTransaction()` and `getActiveTransaction()`

Instead, you should not rely on the active transaction, but just use `startSpan()` APIs, which handle this for you.

## Deprecate arguments for `startSpan()` APIs

In v8, the API to start a new span will be reduced from the currently available options. Going forward, only these
argument will be passable to `startSpan()`, `startSpanManual()` and `startInactiveSpan()`:

- `name`
- `attributes`
- `origin`
- `op`
- `startTime`
- `scope`

## Deprecate `startTransaction()` & `span.startChild()`

In v8, the old performance API `startTransaction()` (and `hub.startTransaction()`), as well as `span.startChild()`, will
be removed. Instead, use the new performance APIs:

- `startSpan()`
- `startSpanManual()`
- `startInactiveSpan()`

You can [read more about the new performance APIs here](./docs/v8-new-performance-apis.md).

## Deprecate variations of `Sentry.continueTrace()`

The version of `Sentry.continueTrace()` which does not take a callback argument will be removed in favor of the version
that does. Additionally, the callback argument will not receive an argument with the next major version.

Use `Sentry.continueTrace()` as follows:

```ts
app.get('/your-route', req => {
  Sentry.withIsolationScope(isolationScope => {
    Sentry.continueTrace(
      {
        sentryTrace: req.headers.get('sentry-trace'),
        baggage: req.headers.get('baggage'),
      },
      () => {
        // All events recorded in this callback will be associated with the incoming trace. For example:
        Sentry.startSpan({ name: '/my-route' }, async () => {
          await doExpensiveWork();
        });
      },
    );
  });
});
```

## Deprecate `Sentry.lastEventId()` and `hub.lastEventId()`

`Sentry.lastEventId()` sometimes causes race conditions, so we are deprecating it in favour of the `beforeSend`
callback.

```js
// Before

Sentry.init({
  beforeSend(event, hint) {
    const lastCapturedEventId = Sentry.lastEventId();

    // Do something with `lastCapturedEventId` here

    return event;
  },
});

// After
Sentry.init({
  beforeSend(event, hint) {
    const lastCapturedEventId = event.event_id;

    // Do something with `lastCapturedEventId` here

    return event;
  },
});
```

## Deprecated fields on `Span` and `Transaction`

In v8, the Span class is heavily reworked. The following properties & methods are thus deprecated:

- `span.toContext()`: Access the fields directly instead.
- `span.updateWithContext(newSpanContext)`: Update the fields directly instead.
- `span.setName(newName)`: Use `span.updateName(newName)` instead.
- `span.toTraceparent()`: use `spanToTraceHeader(span)` util instead.
- `span.getTraceContext()`: Use `spanToTraceContext(span)` utility function instead.
- `span.sampled`: Use `span.isRecording()` instead.
- `span.spanId`: Use `span.spanContext().spanId` instead.
- `span.parentSpanId`: Use `spanToJSON(span).parent_span_id` instead.
- `span.traceId`: Use `span.spanContext().traceId` instead.
- `span.name`: Use `spanToJSON(span).description` instead.
- `span.description`: Use `spanToJSON(span).description` instead.
- `span.getDynamicSamplingContext`: Use `getDynamicSamplingContextFromSpan` utility function instead.
- `span.tags`: Set tags on the surrounding scope instead, or use attributes.
- `span.data`: Use `spanToJSON(span).data` instead.
- `span.setTag()`: Use `span.setAttribute()` instead or set tags on the surrounding scope.
- `span.setData()`: Use `span.setAttribute()` instead.
- `span.instrumenter` This field was removed and will be replaced internally.
- `span.transaction`: Use `getRootSpan` utility function instead.
- `span.spanRecorder`: Span recording will be handled internally by the SDK.
- `span.status`: Use `.setStatus` to set or update and `spanToJSON()` to read the span status.
- `span.op`: Use `startSpan` functions to set, `setAttribute()` to update and `spanToJSON` to read the span operation.
- `span.isSuccess`: Use `spanToJSON(span).status === 'ok'` instead.
- `transaction.setMetadata()`: Use attributes instead, or set data on the scope.
- `transaction.metadata`: Use attributes instead, or set data on the scope.
- `transaction.setContext()`: Set context on the surrounding scope instead.
- `transaction.setMeasurement()`: Use `Sentry.setMeasurement()` instead. In v8, setting measurements will be limited to
  the currently active root span.
- `transaction.setName()`: Set the name with `.updateName()` and the source with `.setAttribute()` instead.
- `span.startTimestamp`: use `spanToJSON(span).start_timestamp` instead. You cannot update this anymore in v8.
- `span.endTimestamp`: use `spanToJSON(span).timestamp` instead. You cannot update this anymore in v8. You can pass a
  custom end timestamp to `span.end(endTimestamp)`.

## Deprecate `pushScope` & `popScope` in favor of `withScope`

Instead of manually pushing/popping a scope, you should use `Sentry.withScope(callback: (scope: Scope))` instead.

## Deprecate `configureScope` in favor of using `getCurrentScope()`

Instead of updating the scope in a callback via `configureScope()`, you should access it via `getCurrentScope()` and
configure it directly:

```js
Sentry.getCurrentScope().setTag('xx', 'yy');
```

## Deprecate `addGlobalEventProcessor` in favor of `addEventProcessor`

Instead of using `addGlobalEventProcessor`, you should use `addEventProcessor` which does not add the event processor
globally, but to the current client.

For the vast majority of cases, the behavior of these should be the same. Only in the case where you have multiple
clients will this differ - but you'll likely want to add event processors per-client then anyhow, not globally.

In v8, we will remove the global event processors overall, as that allows us to avoid keeping global state that is not
necessary.

## Deprecate `extractTraceParentData` export from `@sentry/core` & downstream packages

Instead, import this directly from `@sentry/utils`.

Generally, in most cases you should probably use `continueTrace` instead, which abstracts this away from you and handles
scope propagation for you.

## Deprecate `lastEventId()`

Instead, if you need the ID of a recently captured event, we recommend using `beforeSend` instead:

```ts
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: '__DSN__',
  beforeSend(event, hint) {
    const lastCapturedEventId = event.event_id;

    // Do something with `lastCapturedEventId` here

    return event;
  },
});
```

## Deprecate `timestampWithMs` export - #7878

The `timestampWithMs` util is deprecated in favor of using `timestampInSeconds`.

## `addTracingExtensions` replaces `addExtensionMethods` (since 7.46.0)

Since the deprecation of `@sentry/tracing`, tracing extensions are now added by calling `addTracingExtensions` which is
exported from all framework SDKs.

```js
// Before
import * as Sentry from '@sentry/browser';
import { addExtensionMethods } from '@sentry/tracing';

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
});

addExtensionMethods();

// After
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
});

Sentry.addTracingExtensions();
```

## Remove requirement for `@sentry/tracing` package (since 7.46.0)

With `7.46.0` you no longer require the `@sentry/tracing` package to use tracing and performance monitoring with the
Sentry JavaScript SDKs. The `@sentry/tracing` package will be removed in a future major release, but can still be used
in the meantime.

#### Browser:

```js
// Before
import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
  integrations: [new BrowserTracing()],
});

// After
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
  integrations: [new Sentry.BrowserTracing()],
});
```

#### Node:

```js
// Before
const Sentry = require('@sentry/node');
require('@sentry/tracing');

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
});

// After
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: '__DSN__',
  tracesSampleRate: 1.0,
  integrations: [
    // Automatically instrument Node.js libraries and frameworks
    ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
  ],
});
```

**Note:** If you imported `stripUrlQueryAndFragment` from `@sentry/tracing`, you'll need to import it from
`@sentry/utils`, once you remove `@sentry/tracing`.

## Replay options changed (since 7.35.0) - #6645

Some options for replay have been deprecated in favor of new APIs. See
[Replay Migration docs](./packages/replay/MIGRATION.md#upgrading-replay-from-7340-to-7350) for details.

## Renaming of Next.js wrapper methods (since 7.31.0) - #6790

We updated the names of the functions to wrap data fetchers and API routes to better reflect what they are doing. The
old methods can still be used but are deprecated and will be removed in the next major update of the SDK.

Following function names were updated:

- `withSentryAPI` was renamed to `wrapApiHandlerWithSentry`
- `withSentryGetServerSideProps` was renamed to `wrapGetServerSidePropsWithSentry`
- `withSentryGetStaticProps` was renamed to `wrapGetStaticPropsWithSentry`
- `withSentryServerSideGetInitialProps` was renamed to `wrapGetInitialPropsWithSentry`
- `withSentryServerSideAppGetInitialProps` was renamed to `wrapAppGetInitialPropsWithSentry`
- `withSentryServerSideDocumentGetInitialProps` was renamed to `wrapDocumentGetInitialPropsWithSentry`
- `withSentryServerSideErrorGetInitialProps` was renamed to `wrapErrorGetInitialPropsWithSentry`

## Deprecated `tracingOrigins` (since 7.19.0) - #6176

The `tracingOrigins` option is deprecated in favor of using `shouldCreateSpanForRequest` and `tracePropagationTargets`.

## Deprecate `componentTrackingPreprocessor` in Svelte SDK (since 7.16.0) - #5936

This release adds the `withSentryConfig` feature to the Svelte SDK. It replaces the now deprecated Svelte
`componentTrackingPreprocessor` which will be removed in the next major release.

## Deprecate `getGlobalObject` in `@sentry/utils` (since 7.16.0) - #5949

This is no longer used.

## Deprecate @sentry/hub (since 7.15.0) - #5823

This release deprecates `@sentry/hub` and all of it's exports. All of the `@sentry/hub` exports have moved to
`@sentry/core`. `@sentry/hub` will be removed in the next major release.

# Upgrading Sentry Replay (beta, 7.24.0)

For details on upgrading Replay in its beta phase, please view the
[dedicated Replay MIGRATION docs](./packages/replay/MIGRATION.md).

# Upgrading from 6.x to 7.x

The main goal of version 7 is to reduce bundle size. This version is breaking because we removed deprecated APIs,
upgraded our build tooling, and restructured npm package contents. Below we will outline all the breaking changes you
should consider when upgrading.

**TL;DR** If you only use basic features of Sentry, or you simply copy & pasted the setup examples from our docs, here's
what changed for you:

- If you installed additional Sentry packages, such as`@sentry/tracing` alongside your Sentry SDK (e.g. `@sentry/react`
  or `@sentry/node`), make sure to upgrade all of them to version 7.
- Our CDN bundles are now ES6 - you will need to [reconfigure your script tags](#renaming-of-cdn-bundles) if you want to
  keep supporting ES5 and IE11 on the new SDK version.
- Distributed CommonJS files will be ES6. Use a transpiler if you need to support old node versions.
- We bumped the TypeScript version we generate our types with to 3.8.3. Please check if your TypeScript projects using
  TypeScript version 3.7 or lower still compile. Otherwise, upgrade your TypeScript version.
- `whitelistUrls` and `blacklistUrls` have been renamed to `allowUrls` and `denyUrls` in the `Sentry.init()` options.
- The `UserAgent` integration is now called `HttpContext`.
- If you are using Performance Monitoring and with tracing enabled, you might have to
  [make adjustments to your server's CORS settings](#propagation-of-baggage-header)

## Dropping Support for Node.js v6

Node.js version 6 has reached end of life in April 2019. For Sentry JavaScript SDK version 7, we will no longer be
supporting version 6 of Node.js.

As far as SDK development goes, dropping support means no longer running integration tests for Node.js version 6, and
also no longer handling edge cases specific to version 6. Running the new SDK version on Node.js v6 is therefore highly
discouraged.

## Removal of `@sentry/minimal`

The `@sentry/minimal` package was deleted and it's functionality was moved to `@sentry/hub`. All exports from
`@sentry/minimal` should be available in `@sentry/hub` other than `_callOnClient` function which was removed.

```ts
// New in v7:
import { addBreadcrumb, captureException, configureScope, setTag } from '@sentry/hub';

// Before:
import { addBreadcrumb, captureException, configureScope, setTag } from '@sentry/minimal';
```

## Explicit Client Options

In v7, we've updated the `Client` to have options separate from the options passed into `Sentry.init`. This means that
constructing a client now requires 3 options: `integrations`, `transport` and `stackParser`. These can be customized as
you see fit.

```ts
import { BrowserClient, defaultStackParser, defaultIntegrations, makeFetchTransport } from '@sentry/browser';

// New in v7:
const client = new BrowserClient({
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  integrations: defaultIntegrations,
});

// Before:
const client = new BrowserClient();
```

Since you now explicitly pass in the dependencies of the client, you can also tree-shake out dependencies that you do
not use this way. For example, you can tree-shake out the SDK's default integrations and only use the ones that you want
like so:

```ts
import {
  BrowserClient,
  Breadcrumbs,
  Dedupe,
  defaultStackParser,
  GlobalHandlers,
  Integrations,
  makeFetchTransport,
  LinkedErrors,
} from '@sentry/browser';

// New in v7:
const client = new BrowserClient({
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  integrations: [new Breadcrumbs(), new GlobalHandlers(), new LinkedErrors(), new Dedupe()],
});
```

## Removal Of Old Platform Integrations From `@sentry/integrations` Package

The following classes will be removed from the `@sentry/integrations` package and can no longer be used:

- `Angular`
- `Ember`
- `Vue`

These classes have been superseded and were moved into their own packages, `@sentry/angular`, `@sentry/ember`, and
`@sentry/vue` in a previous version. Refer to those packages if you want to integrate Sentry into your Angular, Ember,
or Vue application.

## Moving To ES6 For CommonJS Files

From version 7 onwards, the CommonJS files in Sentry JavaScript SDK packages will use ES6.

If you need to support Internet Explorer 11 or old Node.js versions, we recommend using a preprocessing tool like
[Babel](https://babeljs.io/) to convert Sentry packages to ES5.

## Renaming Of CDN Bundles

CDN bundles will be ES6 by default. Files that followed the naming scheme `bundle.es6.min.js` were renamed to
`bundle.min.js` and any bundles using ES5 (files without `.es6`) turned into `bundle.es5.min.js`.

See our [docs on CDN bundles](https://docs.sentry.io/platforms/javascript/install/cdn/) for more information.

## Restructuring Of Package Content

Up until v6.x, we have published our packages on npm with the following structure:

- `build` folder contained CDN bundles
- `dist` folder contained CommonJS files and TypeScript declarations
- `esm` folder contained ESM files and TypeScript declarations

Moving forward the JavaScript SDK packages will generally have the following structure:

- `cjs` folder contains CommonJS files
- `esm` folder contains ESM files
- `types` folder contains TypeScript declarations

**CDN bundles of version 7 or higher will no longer be distributed through our npm package.** This means that most
third-party CDNs like [unpkg](https://unpkg.com/) or [jsDelivr](https://www.jsdelivr.com/) will also not provide them.

If you depend on any specific files in a Sentry JavaScript npm package, you will most likely need to update their
references. For example, imports on `@sentry/browser/dist/client` will become `@sentry/browser/cjs/client`. However,
directly importing from specific files is discouraged.

## Removing the `API` class from `@sentry/core`

The internal `API` class was removed in favor of using client options explicitly.

```js
// New in v7:
import {
  initAPIDetails,
  getEnvelopeEndpointWithUrlEncodedAuth,
  getStoreEndpointWithUrlEncodedAuth,
} from '@sentry/core';

const client = getCurrentHub().getClient();
const dsn = client.getDsn();
const options = client.getOptions();
const envelopeEndpoint = getEnvelopeEndpointWithUrlEncodedAuth(dsn, options.tunnel);

// Before:
import { API } from '@sentry/core';

const api = new API(dsn, metadata, tunnel);
const dsn = api.getDsn();
const storeEndpoint = api.getStoreEndpointWithUrlEncodedAuth();
const envelopeEndpoint = api.getEnvelopeEndpointWithUrlEncodedAuth();
```

## Transport Changes

The `Transport` API was simplified and some functionality (e.g. APIDetails and client reports) was refactored and moved
to the Client. To send data to Sentry, we switched from the previously used
[Store endpoint](https://develop.sentry.dev/sdk/store/) to the
[Envelopes endpoint](https://develop.sentry.dev/sdk/envelopes/).

This example shows the new v7 and the v6 Transport API:

```js
// New in v7:
export interface Transport {
  /* Sends an envelope to the Envelope endpoint in Sentry */
  send(request: Envelope): PromiseLike<void>;
  /* Waits for all events to be sent or the timeout to expire, whichever comes first */
  flush(timeout?: number): PromiseLike<boolean>;
}

// Before:
export interface Transport {
  /* Sends the event to the Store endpoint in Sentry */
  sendEvent(event: Event): PromiseLike<Response>;
  /* Sends the session to the Envelope endpoint in Sentry */
  sendSession?(session: Session | SessionAggregates): PromiseLike<Response>;
  /* Waits for all events to be sent or the timeout to expire, whichever comes first */
  close(timeout?: number): PromiseLike<boolean>;
  /* Increment the counter for the specific client outcome */
  recordLostEvent?(type: Outcome, category: SentryRequestType): void;
}
```

### Custom Transports

If you rely on a custom transport, you will need to make some adjustments to how it is created when migrating to v7.
Note that we changed our transports from a class-based to a functional approach, meaning that the previously class-based
transports are now created via functions. This also means that custom transports are now passed by specifying a factory
function in the `Sentry.init` options object instead passing the custom transport's class.

The following example shows how to create a custom transport in v7 vs. how it was done in v6:

```js
// New in v7:
import { BaseTransportOptions, Transport, TransportMakeRequestResponse, TransportRequest } from '@sentry/types';
import { createTransport } from '@sentry/core';

export function makeMyCustomTransport(options: BaseTransportOptions): Transport {
  function makeRequest(request: TransportRequest): PromiseLike<TransportMakeRequestResponse> {
    // this is where your sending logic goes
    const myCustomRequest = {
      body: request.body,
      url: options.url
    };
    // you define how `sendMyCustomRequest` works
    return sendMyCustomRequest(myCustomRequest).then(response => ({
      headers: {
        'x-sentry-rate-limits': response.headers.get('X-Sentry-Rate-Limits'),
        'retry-after': response.headers.get('Retry-After'),
      },
    }));
  }

  // `createTransport` takes care of rate limiting and flushing
  return createTransport(options, makeRequest);
}

Sentry.init({
  dsn: '...',
  transport: makeMyCustomTransport, // this function will be called when the client is initialized
  ...
})

// Before:
class MyCustomTransport extends BaseTransport {
  constructor(options: TransportOptions) {
    // initialize your transport here
    super(options);
  }

  public sendEvent(event: Event): PromiseLike<Response> {
    // this is where your sending logic goes
    // `url` is decoded from dsn in BaseTransport
    const myCustomRequest = createMyCustomRequestFromEvent(event, this.url);
    return sendMyCustomRequest(myCustomRequest).then(() => resolve({status: 'success'}));
  }

  public sendSession(session: Session): PromiseLike<Response> {...}
  // ...
}

Sentry.init({
  dsn: '...',
  transport: MyCustomTransport, // the constructor was called when the client was initialized
  ...
})
```

Overall, the new way of transport creation allows you to create your custom sending implementation without having to
deal with the conversion of events or sessions to envelopes. We recommend calling using the `createTransport` function
from `@sentry/core` as demonstrated in the example above which, besides creating the `Transport` object with your custom
logic, will also take care of rate limiting and flushing.

For a complete v7 transport implementation, take a look at our
[browser fetch transport](https://github.com/getsentry/sentry-javascript/blob/ebc938a03d6efe7d0c4bbcb47714e84c9a566a9c/packages/browser/src/transports/fetch.ts#L1-L34).

### Node Transport Changes

To clean up the options interface, we now require users to pass down transport related options under the
`transportOptions` key. The options that were changed were `caCerts`, `httpProxy`, and `httpsProxy`. In addition,
`httpProxy` and `httpsProxy` were unified to a single option under the `transportOptions` key, `proxy`.

```ts
// New in v7:
Sentry.init({
  dsn: '...',
  transportOptions: {
    caCerts: getMyCaCert(),
    proxy: 'http://example.com',
  },
});

// Before:
Sentry.init({
  dsn: '...',
  caCerts: getMyCaCert(),
  httpsProxy: 'http://example.com',
});
```

## Enum Changes

Given that enums have a high bundle-size impact, our long term goal is to eventually remove all enums from the SDK in
favor of string literals.

### Removed Enums

- The previously deprecated enum `Status` was removed (see
  [#4891](https://github.com/getsentry/sentry-javascript/pull/4891)).
- The previously deprecated internal-only enum `RequestSessionStatus` was removed (see
  [#4889](https://github.com/getsentry/sentry-javascript/pull/4889)) in favor of string literals.
- The previously deprecated internal-only enum `SessionStatus` was removed (see
  [#4890](https://github.com/getsentry/sentry-javascript/pull/4890)) in favor of string literals.

### Deprecated Enums

The two enums `SpanStatus`, and `Severity` remain deprecated, as we decided to limit the number of high-impact breaking
changes in v7. They will be removed in the next major release which is why we strongly recommend moving to the
corresponding string literals. Here's how to adjust [`Severity`](#severity-severitylevel-and-severitylevels) and
[`SpanStatus`](#spanstatus).

## Session Changes

Note: These changes are not relevant for the majority of Sentry users but if you are building an SDK on top of the
Javascript SDK, you might need to make some adaptions. The internal `Session` class was refactored and replaced with a
more functional approach in [#5054](https://github.com/getsentry/sentry-javascript/pull/5054). Instead of the class, we
now export a `Session` interface from `@sentry/types` and three utility functions to create and update a `Session`
object from `@sentry/hub`. This short example shows what has changed and how to deal with the new functions:

```js
// New in v7:
import { makeSession, updateSession, closeSession } from '@sentry/hub';

const session = makeSession({ release: 'v1.0' });
updateSession(session, { environment: 'prod' });
closeSession(session, 'ok');

// Before:
import { Session } from '@sentry/hub';

const session = new Session({ release: 'v1.0' });
session.update({ environment: 'prod' });
session.close('ok');
```

## Propagation of Baggage Header

We introduced a new way of propagating tracing and transaction-related information between services. This change adds
the [`baggage` HTTP header](https://www.w3.org/TR/baggage/) to outgoing requests if the instrumentation of requests is
enabled. Since this adds a header to your HTTP requests, you might need to adjust your Server's CORS settings to allow
this additional header. Take a look at the
[Sentry docs](https://docs.sentry.io/platforms/javascript/performance/connect-services/#navigation-and-other-xhr-requests)
for more in-depth instructions what to change.

## General API Changes

For our efforts to reduce bundle size of the SDK we had to remove and refactor parts of the package which introduced a
few changes to the API:

- Remove support for deprecated `@sentry/apm` package. `@sentry/tracing` should be used instead.
- Remove deprecated `user` field from DSN. `publicKey` should be used instead.
- Remove deprecated `whitelistUrls` and `blacklistUrls` options from `Sentry.init`. They have been superseded by
  `allowUrls` and `denyUrls` specifically. See
  [our docs page on inclusive language](https://develop.sentry.dev/inclusion/) for more details.
- Gatsby SDK: Remove `Sentry` from `window` object.
- Remove deprecated `Status`, `SessionStatus`, and `RequestSessionStatus` enums. These were only part of an internal
  API. If you are using these enums, we encourage you to to look at
  [b177690d](https://github.com/getsentry/sentry-javascript/commit/b177690d89640aef2587039113c614672c07d2be),
  [5fc3147d](https://github.com/getsentry/sentry-javascript/commit/5fc3147dfaaf1a856d5923e4ba409479e87273be), and
  [f99bdd16](https://github.com/getsentry/sentry-javascript/commit/f99bdd16539bf6fac14eccf1a974a4988d586b28) to to see
  the changes we've made to our code as result. We generally recommend using string literals instead of the removed
  enums.
- Remove 'critical' severity.
- Remove deprecated `getActiveDomain` method and `DomainAsCarrier` type from `@sentry/hub`.
- Rename `registerRequestInstrumentation` to `instrumentOutgoingRequests` in `@sentry/tracing`.
- Remove `Backend` and port its functionality into `Client` (see
  [#4911](https://github.com/getsentry/sentry-javascript/pull/4911) and
  [#4919](https://github.com/getsentry/sentry-javascript/pull/4919)). `Backend` was an unnecessary abstraction which is
  not present in other Sentry SDKs. For the sake of reducing complexity, increasing consistency with other Sentry SDKs
  and decreasing bundle-size, `Backend` was removed.
- Remove support for Opera browser pre v15.
- Rename `UserAgent` integration to `HttpContext`. (see
  [#5027](https://github.com/getsentry/sentry-javascript/pull/5027))
- Remove `SDK_NAME` export from `@sentry/browser`, `@sentry/node`, `@sentry/tracing` and `@sentry/vue` packages.
- Removed `eventStatusFromHttpCode` to save on bundle size.
- Replace `BrowserTracing` `maxTransactionDuration` option with `finalTimeout` option
- Removed `ignoreSentryErrors` option from AWS lambda SDK. Errors originating from the SDK will now _always_ be caught
  internally.
- Removed `Integrations.BrowserTracing` export from `@sentry/nextjs`. Please import `BrowserTracing` from
  `@sentry/nextjs` directly.
- Removed static `id` property from `BrowserTracing` integration.
- Removed usage of deprecated `event.stacktrace` field

## Sentry Angular SDK Changes

The Sentry Angular SDK (`@sentry/angular`) is now compiled with the Angular compiler (see
[#4641](https://github.com/getsentry/sentry-javascript/pull/4641)). This change was necessary to fix a long-lasting bug
in the SDK (see [#3282](https://github.com/getsentry/sentry-javascript/issues/3282)): `TraceDirective` and `TraceModule`
can now be used again without risking an application compiler error or having to disable AOT compilation.

### Angular Version Compatibility

As in v6, we continue to list Angular 10-13 in our peer dependencies, meaning that these are the Angular versions we
officially support. If you are using v7 with Angular <10 in your project and you experience problems, we recommend
staying on the latest 6.x version until you can upgrade your Angular version. As v7 of our SDK is compiled with the
Angular 10 compiler and we upgraded our Typescript version, the SDK will work with Angular 10 and above. Tests have
shown that Angular 9 seems to work as well (use at your own risk) but we recommend upgrading to a more recent Angular
version.

### Import Changes

Due to the compiler change, our NPM package structure changed as well as it now conforms to the
[Angular Package Format v10](https://docs.google.com/document/d/1uh2D6XqaGh2yjjXwfF4SrJqWl1MBhMPntlNBBsk6rbw/edit). In
case you're importing from specific paths other than `@sentry/angular` you will have to adjust these paths. As an
example, `import ... from '@sentry/angular/esm/injex.js'` should be changed to
`import ... from '@sentry/angular/esm2015/index.js'`. Generally, we strongly recommend only importing from
`@sentry/angular`.

# Upgrading from 6.17.x to 6.18.0

Version 6.18.0 deprecates the `frameContextLines` top-level option for the Node SDK. This option will be removed in an
upcoming major version. To migrate off of the top-level option, pass it instead to the new `ContextLines` integration.

```js
// New in 6.18.0
init({
  dsn: '__DSN__',
  integrations: [new ContextLines({ frameContextLines: 10 })],
});

// Before:
init({
  dsn: '__DSN__',
  frameContextLines: 10,
});
```

# Upgrading from 6.x to 6.17.x

You only need to make changes when migrating to `6.17.x` if you are using our internal `Dsn` class. Our internal API
class and typescript enums were deprecated, so we recommend you migrate them as well.

The internal `Dsn` class was removed in `6.17.0`. For additional details, you can look at the
[PR where this change happened](https://github.com/getsentry/sentry-javascript/pull/4325). To migrate, see the following
example.

```js
// New in 6.17.0:
import { dsnToString, makeDsn } from '@sentry/utils';

const dsn = makeDsn(process.env.SENTRY_DSN);
console.log(dsnToString(dsn));

// Before:
import { Dsn } from '@sentry/utils';

const dsn = new Dsn(process.env.SENTRY_DSN);
console.log(dsn.toString());
```

The internal API class was deprecated, and will be removed in the next major release. More details can be found in the
[PR that made this change](https://github.com/getsentry/sentry-javascript/pull/4281). To migrate, see the following
example.

```js
// New in 6.17.0:
import {
  initAPIDetails,
  getEnvelopeEndpointWithUrlEncodedAuth,
  getStoreEndpointWithUrlEncodedAuth,
} from '@sentry/core';

const dsn = initAPIDetails(dsn, metadata, tunnel);
const dsn = api.dsn;
const storeEndpoint = getStoreEndpointWithUrlEncodedAuth(api.dsn);
const envelopeEndpoint = getEnvelopeEndpointWithUrlEncodedAuth(api.dsn, api.tunnel);

// Before:
import { API } from '@sentry/core';

const api = new API(dsn, metadata, tunnel);
const dsn = api.getDsn();
const storeEndpoint = api.getStoreEndpointWithUrlEncodedAuth();
const envelopeEndpoint = api.getEnvelopeEndpointWithUrlEncodedAuth();
```

## Enum changes

The enums `Status`, `SpanStatus`, and `Severity` were deprecated, and we've detailed how to migrate away from them
below. We also deprecated the `TransactionMethod`, `Outcome` and `RequestSessionStatus` enums, but those are
internal-only APIs. If you are using them, we encourage you to take a look at the corresponding PRs to see how we've
changed our code as a result.

- `TransactionMethod`: https://github.com/getsentry/sentry-javascript/pull/4314
- `Outcome`: https://github.com/getsentry/sentry-javascript/pull/4315
- `RequestSessionStatus`: https://github.com/getsentry/sentry-javascript/pull/4316

#### Status

We deprecated the `Status` enum in `@sentry/types` and it will be removed in the next major release. We recommend using
string literals to save on bundle size. [PR](https://github.com/getsentry/sentry-javascript/pull/4298). We also removed
the `Status.fromHttpCode` method. This was done to save on bundle size.

```js
// New in 6.17.0:
import { eventStatusFromHttpCode } from '@sentry/utils';

const status = eventStatusFromHttpCode(500);

// Before:
import { Status } from '@sentry/types';

const status = Status.fromHttpCode(500);
```

#### SpanStatus

We deprecated the `Status` enum in `@sentry/tracing` and it will be removed in the next major release. We recommend
using string literals to save on bundle size. [PR](https://github.com/getsentry/sentry-javascript/pull/4299). We also
removed the `SpanStatus.fromHttpCode` method. This was done to save on bundle size.

```js
// New in 6.17.0:
import { spanStatusfromHttpCode } from '@sentry/tracing';

const status = spanStatusfromHttpCode(403);

// Before:
import { SpanStatus } from '@sentry/tracing';

const status = SpanStatus.fromHttpCode(403);
```

#### Severity, SeverityLevel, and SeverityLevels

We deprecated the `Severity` enum in `@sentry/types` and it will be removed in the next major release. We recommend
using string literals (typed as `SeverityLevel`) to save on bundle size.

```js
// New in 6.17.5:
import { SeverityLevel } from '@sentry/types';

const levelA = "error" as SeverityLevel;

const levelB: SeverityLevel = "error"

// Before:
import { Severity, SeverityLevel } from '@sentry/types';

const levelA = Severity.error;

const levelB: SeverityLevel = "error"
```

# Upgrading from 4.x to 5.x/6.x

In this version upgrade, there are a few breaking changes. This guide should help you update your code accordingly.

## Integrations

We moved optional integrations into their own package, called `@sentry/integrations`. Also, we made a few default
integrations now optional. This is probably the biggest breaking change regarding the upgrade.

Integrations that are now opt-in and were default before:

- Dedupe (responsible for sending the same error only once)
- ExtraErrorData (responsible for doing fancy magic, trying to extract data out of the error object using any
  non-standard keys)

Integrations that were pluggable/optional before, that also live in this package:

- Angular (browser)
- Debug (browser/node)
- Ember (browser)
- ReportingObserver (browser)
- RewriteFrames (browser/node)
- Transaction (browser/node)
- Vue (browser)

### How to use `@sentry/integrations`?

Lets start with the approach if you install `@sentry/browser` / `@sentry/node` with `npm` or `yarn`.

Given you have a `Vue` application running, in order to use the `Vue` integration you need to do the following:

With `4.x`:

```js
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: '___PUBLIC_DSN___',
  integrations: [
    new Sentry.Integrations.Vue({
      Vue,
      attachProps: true,
    }),
  ],
});
```

With `5.x` you need to install `@sentry/integrations` and change the import.

```js
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

Sentry.init({
  dsn: '___PUBLIC_DSN___',
  integrations: [
    new Integrations.Vue({
      Vue,
      attachProps: true,
    }),
  ],
});
```

In case you are using the CDN version or the Loader, we provide a standalone file for every integration, you can use it
like this:

```html
<!-- Note that we now also provide a es6 build only -->
<!-- <script src="https://browser.sentry-cdn.com/5.0.0/bundle.es6.min.js" crossorigin="anonymous"></script> -->
<script src="https://browser.sentry-cdn.com/5.0.0/bundle.min.js" crossorigin="anonymous"></script>

<!-- If you include the integration it will be available under Sentry.Integrations.Vue -->
<script src="https://browser.sentry-cdn.com/5.0.0/vue.min.js" crossorigin="anonymous"></script>

<script>
  Sentry.init({
    dsn: '___PUBLIC_DSN___',
    integrations: [
      new Sentry.Integrations.Vue({
        Vue,
        attachProps: true,
      }),
    ],
  });
</script>
```

## New Scope functions

We realized how annoying it is to set a whole object using `setExtra`, so there are now a few new methods on the
`Scope`.

```typescript
setTags(tags: { [key: string]: string | number | boolean | null | undefined }): this;
setExtras(extras: { [key: string]: any }): this;
clearBreadcrumbs(): this;
```

So you can do this now:

```js
// New in 5.x setExtras
Sentry.withScope(scope => {
  scope.setExtras(errorInfo);
  Sentry.captureException(error);
});

// vs. 4.x
Sentry.withScope(scope => {
  Object.keys(errorInfo).forEach(key => {
    scope.setExtra(key, errorInfo[key]);
  });
  Sentry.captureException(error);
});
```

## Less Async API

We removed a lot of the internal async code since in certain situations it generated a lot of memory pressure. This
really only affects you if you where either using the `BrowserClient` or `NodeClient` directly.

So all the `capture*` functions now instead of returning `Promise<Response>` return `string | undefined`. `string` in
this case is the `event_id`, in case the event will not be sent because of filtering it will return `undefined`.

## `close` vs. `flush`

In `4.x` we had both `close` and `flush` on the `Client` draining the internal queue of events, helpful when you were
using `@sentry/node` on a serverless infrastructure.

Now `close` and `flush` work similar, with the difference that if you call `close` in addition to returning a `Promise`
that you can await it also **disables** the client so it will not send any future events.

# Migrating from `raven-js` to `@sentry/browser`

https://docs.sentry.io/platforms/javascript/#browser-table Here are some examples of how the new SDKs work. Please note
that the API for all JavaScript SDKs is the same.

#### Installation

> [Docs](https://docs.sentry.io/platforms/javascript/#connecting-the-sdk-to-sentry)

_Old_:

```js
Raven.config('___PUBLIC_DSN___', {
  release: '1.3.0',
}).install();
```

_New_:

```js
Sentry.init({
  dsn: '___PUBLIC_DSN___',
  release: '1.3.0',
});
```

#### Set a global tag

> [Docs](https://docs.sentry.io/platforms/javascript/#tagging-events)

_Old_:

```js
Raven.setTagsContext({ key: 'value' });
```

_New_:

```js
Sentry.setTag('key', 'value');
```

#### Set user context

_Old_:

```js
Raven.setUserContext({
  id: '123',
  email: 'david@example.com',
});
```

_New_:

```js
Sentry.setUser({
  id: '123',
  email: 'david@example.com',
});
```

#### Capture custom exception

> A scope must now be sent around a capture to add extra information.
> [Docs](https://docs.sentry.io/platforms/javascript/#unsetting-context)

_Old_:

```js
try {
  throwingFunction();
} catch (e) {
  Raven.captureException(e, { extra: { debug: false } });
}
```

_New_:

```js
try {
  throwingFunction();
} catch (e) {
  Sentry.withScope(scope => {
    scope.setExtra('debug', false);
    Sentry.captureException(e);
  });
}
```

#### Capture a message

> A scope must now be sent around a capture to add extra information.
> [Docs](https://docs.sentry.io/platforms/javascript/#unsetting-context)

_Old_:

```js
Raven.captureMessage('test1', 'info');
Raven.captureMessage('test2', 'info', { extra: { debug: false } });
```

_New_:

```js
Sentry.captureMessage('test1', 'info');
Sentry.withScope(scope => {
  scope.setExtra('debug', false);
  Sentry.captureMessage('test2', 'info');
});
```

#### Breadcrumbs

> [Docs](https://docs.sentry.io/platforms/javascript/#breadcrumbs)

_Old_:

```js
Raven.captureBreadcrumb({
  message: 'Item added to shopping cart',
  category: 'action',
  data: {
    isbn: '978-1617290541',
    cartSize: '3',
  },
});
```

_New_:

```js
Sentry.addBreadcrumb({
  message: 'Item added to shopping cart',
  category: 'action',
  data: {
    isbn: '978-1617290541',
    cartSize: '3',
  },
});
```

### Ignoring Urls

> 'ignoreUrls' was renamed to 'denyUrls'. 'ignoreErrors', which has a similar name was not renamed.
> [Docs](https://docs.sentry.io/error-reporting/configuration/?platform=browser#deny-urls) and
> [Decluttering Sentry](https://docs.sentry.io/platforms/javascript/#decluttering-sentry)

_Old_:

```js
Raven.config('___PUBLIC_DSN___', {
  ignoreUrls: ['https://www.baddomain.com', /graph\.facebook\.com/i],
});
```

_New_:

```js
Sentry.init({
  denyUrls: ['https://www.baddomain.com', /graph\.facebook\.com/i],
});
```

### Ignoring Events (`shouldSendCallback`)

> `shouldSendCallback` was renamed to `beforeSend`
> ([#2253](https://github.com/getsentry/sentry-javascript/issues/2253)). Instead of returning `false`, you must return
> `null` to omit sending the event.
> [Docs](https://docs.sentry.io/error-reporting/configuration/filtering/?platform=browser#before-send)

_Old_:

```js
Raven.config('___PUBLIC_DSN___', {
  shouldSendCallback(event) {
    // Only send events that include user data
    if (event.user) {
      return true;
    }
    return false;
  },
});
```

_New_:

```js
Sentry.init({
  beforeSend(event) {
    if (event.user) {
      return event;
    }
    return null;
  },
});
```

### Modifying Events (`dataCallback`)

_Old_:

```js
Raven.config('___PUBLIC_DSN___', {
  dataCallback(event) {
    if (event.user) {
      // Don't send user's email address
      delete event.user.email;
    }
    return event;
  },
});
```

_New_:

```js
Sentry.init({
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
    }
    return event;
  },
});
```

### Attaching Stacktraces

> 'stacktrace' was renamed to 'attachStacktrace'.
> [Docs](https://docs.sentry.io/error-reporting/configuration/?platform=browser#attach-stacktrace)

_Old_:

```js
Raven.config('___PUBLIC_DSN___', {
  stacktrace: true,
});
```

_New_:

```js
Sentry.init({
  attachStacktrace: true,
});
```

### Disabling Promises Handling

_Old_:

```js
Raven.config('___PUBLIC_DSN___', {
  captureUnhandledRejections: false,
});
```

_New_:

```js
Sentry.init({
  integrations: [
    new Sentry.Integrations.GlobalHandlers({
      onunhandledrejection: false,
    }),
  ],
});
```
