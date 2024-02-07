import type { JobStep } from '../../types';

const ACTION = 'actions/setup-node@v4' as const;

interface ActionCacheStepOptions {
  // The key created when saving a cache and the key used to search for a cache.
  // It can be any combination of variables, context values, static strings, and functions.
  // Keys have a maximum length of 512 characters, and keys longer than the maximum length
  // will cause the action to fail.
  key: string;
  // The path(s) on the runner to cache or restore
  path: string;
  failOnCacheMiss?: boolean;
}

/**
 * Wrapper around the cache action
 *
 * https://github.com/actions/cache
 */
export function getActionCacheStep({ key, path, failOnCacheMiss }: ActionCacheStepOptions): ActionCacheStep {
  const step: ActionCacheStep = {
    name: 'Check dependency cache',
    uses: ACTION,
    with: {
      key,
      path,
    },
  } satisfies JobStep;

  if (failOnCacheMiss !== undefined) {
    step.with['fail-on-cache-miss'] = failOnCacheMiss;
  }

  return step;
}

// https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows
interface WithOptions {
  // The key created when saving a cache and the key used to search for a cache.
  // It can be any combination of variables, context values, static strings, and functions.
  // Keys have a maximum length of 512 characters, and keys longer than the maximum length
  // will cause the action to fail.
  key: string;
  // The path(s) on the runner to cache or restore
  path: string;
  // Fail the workflow if cache entry is not found. Default `false`.
  'fail-on-cache-miss'?: boolean;
}

type ActionCacheStep = JobStep & {
  uses: typeof ACTION;
  with: WithOptions;
};
