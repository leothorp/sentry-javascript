import type { JobStep } from '../../types';

const ACTION = 'actions/checkout@v4' as const;

interface ActionCheckOutStepOptions {
  name?: string;
  fetchDepth?: number;
}

/**
 * Wrapper around the `actions/checkout` action to check out the current commit.
 */
export function getActionCheckoutStep({ name, fetchDepth }: ActionCheckOutStepOptions = {}): ActionCheckoutStep {
  const step: ActionCheckoutStep = {
    name: name || 'Check out current commit',
    uses: ACTION,
    with: {
      ref: '${{ env.HEAD_COMMIT }}',
    },
  } satisfies JobStep;

  if (fetchDepth) {
    step.with['fetch-depth'] = fetchDepth;
  }

  return step;
}

// https://github.com/actions/checkout
interface WithOptions {
  // The branch, tag or SHA to checkout. When checking out the repository that
  // triggered a workflow, this defaults to the reference or SHA for that event.
  // Otherwise, uses the default branch.
  ref?: string;
  // Number of commits to fetch. 0 indicates all history for all branches and tags.
  // Default: 1
  'fetch-depth'?: number;
}

type ActionCheckoutStep = JobStep & {
  uses: typeof ACTION;
  with: WithOptions;
};
