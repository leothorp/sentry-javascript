import type { NormalJob } from '../schema/types';
import { MachineType } from './machines';
import { JobName } from './names';
import { getActionCheckoutStep } from './steps/action-checkout';
import { getActionCacheStep } from './steps/check-dependency-cache';
import { getActionSetupNodeStep } from './steps/setup-node';

export const installDependenciesJob: NormalJob = {
  name: 'Install Dependencies',
  needs: JobName.GetMetadata,
  'runs-on': MachineType.Ubuntu_20_04,
  'timeout-minutes': 15,
  if: "(needs.job_get_metadata.outputs.is_gitflow_sync == 'false' && needs.job_get_metadata.outputs.has_gitflow_label == 'false')",
  steps: [
    getActionCheckoutStep({ name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})' }),
    getActionSetupNodeStep(),
    {
      name: 'Compute dependency cache key',
      id: 'compute_lockfile_hash',
      run: 'echo "hash=${{ hashFiles(\'yarn.lock\', \'**/package.json\') }}" >> "$GITHUB_OUTPUT"',
    },
    {
      ...getActionCacheStep({
        key: '${{ steps.compute_lockfile_hash.outputs.hash }}',
        path: '${{ env.CACHED_DEPENDENCY_PATHS }}',
      }),
      id: 'cache_dependencies',
    },
    {
      name: 'Install dependencies',
      if: "steps.cache_dependencies.outputs.cache-hit != 'true'",
      run: 'yarn install --ignore-engines --frozen-lockfile',
    },
  ],
  outputs: {
    dependency_cache_key: '${{ steps.compute_lockfile_hash.outputs.hash }}',
  },
};
