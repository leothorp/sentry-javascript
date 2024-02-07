import type { JobStep } from '../../types';

const ACTION = 'actions/setup-node@v4' as const;

interface ActionSetupNodeOptions {
  nodeVersion?: string;
}

/**
 * Wrapper around the setup node action
 *
 * https://github.com/actions/setup-node
 */
export function getActionSetupNodeStep({ nodeVersion }: ActionSetupNodeOptions = {}): ActionSetupNodeStep {
  const step: ActionSetupNodeStep = {
    name: 'Set up Node',
    uses: ACTION,
    with: {},
  } satisfies JobStep;

  if (nodeVersion) {
    step.with['node-version'] = nodeVersion;
  } else {
    step.with['node-version-file'] = 'package.json';
  }

  return step;
}

// https://github.com/actions/setup-node?tab=readme-ov-file#usage
interface WithOptions {
  // Version Spec of the version to use in SemVer notation.
  // It also emits such aliases as lts, latest, nightly and canary builds
  // Examples: 12.x, 10.15.1, >=10.15.0, lts/Hydrogen, 16-nightly, latest, node
  'node-version'?: string;
  // File containing the version Spec of the version to use.  Examples: package.json, .nvmrc, .node-version, .tool-versions.
  // If node-version and node-version-file are both provided the action will use version from node-version.
  'node-version-file'?: string;
}

type ActionSetupNodeStep = JobStep & {
  uses: typeof ACTION;
  with: WithOptions;
};
