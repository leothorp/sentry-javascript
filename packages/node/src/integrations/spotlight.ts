import * as http from 'http';
import { URL } from 'url';
import { convertIntegrationFnToClass, defineIntegration } from '@sentry/core';
import type { Client, Envelope, Integration, IntegrationClass, IntegrationFn } from '@sentry/types';
import { logger, serializeEnvelope } from '@sentry/utils';

type SpotlightConnectionOptions = {
  /**
   * Set this if the Spotlight Sidecar is not running on localhost:8969
   * By default, the Url is set to http://localhost:8969/stream
   */
  sidecarUrl?: string;
};

const INTEGRATION_NAME = 'Spotlight';

const _spotlightIntegration = ((options: Partial<SpotlightConnectionOptions> = {}) => {
  const _options = {
    sidecarUrl: options.sidecarUrl || 'http://localhost:8969/stream',
  };

  return {
    name: INTEGRATION_NAME,
    // TODO v8: Remove this
    setupOnce() {}, // eslint-disable-line @typescript-eslint/no-empty-function
    setup(client) {
      if (typeof process === 'object' && process.env && process.env.NODE_ENV !== 'development') {
        logger.warn("[Spotlight] It seems you're not in dev mode. Do you really want to have Spotlight enabled?");
      }
      connectToSpotlight(client, _options);
    },
  };
}) satisfies IntegrationFn;

export const spotlightIntegration = defineIntegration(_spotlightIntegration);

/**
 * Use this integration to send errors and transactions to Spotlight.
 *
 * Learn more about spotlight at https://spotlightjs.com
 *
 * Important: This integration only works with Node 18 or newer.
 *
 * @deprecated Use `spotlightIntegration()` instead.
 */
// eslint-disable-next-line deprecation/deprecation
export const Spotlight = convertIntegrationFnToClass(INTEGRATION_NAME, spotlightIntegration) as IntegrationClass<
  Integration & { setup: (client: Client) => void }
> & {
  new (
    options?: Partial<{
      sidecarUrl?: string;
    }>,
  ): Integration;
};

// eslint-disable-next-line deprecation/deprecation
export type Spotlight = typeof Spotlight;

function connectToSpotlight(client: Client, options: Required<SpotlightConnectionOptions>): void {
  const spotlightUrl = parseSidecarUrl(options.sidecarUrl);
  if (!spotlightUrl) {
    return;
  }

  let failedRequests = 0;

  if (typeof client.on !== 'function') {
    logger.warn('[Spotlight] Cannot connect to spotlight due to missing method on SDK client (`client.on`)');
    return;
  }

  client.on('beforeEnvelope', (envelope: Envelope) => {
    if (failedRequests > 3) {
      logger.warn('[Spotlight] Disabled Sentry -> Spotlight integration due to too many failed requests');
      return;
    }

    const serializedEnvelope = serializeEnvelope(envelope);

    const request = getNativeHttpRequest();
    const req = request(
      {
        method: 'POST',
        path: spotlightUrl.pathname,
        hostname: spotlightUrl.hostname,
        port: spotlightUrl.port,
        headers: {
          'Content-Type': 'application/x-sentry-envelope',
        },
      },
      res => {
        res.on('data', () => {
          // Drain socket
        });

        res.on('end', () => {
          // Drain socket
        });
        res.setEncoding('utf8');
      },
    );

    req.on('error', () => {
      failedRequests++;
      logger.warn('[Spotlight] Failed to send envelope to Spotlight Sidecar');
    });
    req.write(serializedEnvelope);
    req.end();
  });
}

function parseSidecarUrl(url: string): URL | undefined {
  try {
    return new URL(`${url}`);
  } catch {
    logger.warn(`[Spotlight] Invalid sidecar URL: ${url}`);
    return undefined;
  }
}

type HttpRequestImpl = typeof http.request;
type WrappedHttpRequest = HttpRequestImpl & { __sentry_original__: HttpRequestImpl };

/**
 * We want to get an unpatched http request implementation to avoid capturing our own calls.
 */
export function getNativeHttpRequest(): HttpRequestImpl {
  const { request } = http;
  if (isWrapped(request)) {
    return request.__sentry_original__;
  }

  return request;
}

function isWrapped(impl: HttpRequestImpl): impl is WrappedHttpRequest {
  return '__sentry_original__' in impl;
}
