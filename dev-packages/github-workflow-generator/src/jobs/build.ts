import type { NormalJob } from '../schema/types';
import { MachineType } from './machines';
import { JobName } from './names';
import { getActionCheckoutStep } from './steps/action-checkout';
import { getActionCacheStep } from './steps/check-dependency-cache';
import { getActionSetupNodeStep } from './steps/setup-node';

export const buildJob: NormalJob = {
  name: 'Build',
  needs: [JobName.GetMetadata, JobName.InstallDependencies],
  'runs-on': MachineType.Ubuntu_20_04_Large_JS,
  'timeout-minutes': 30,
  if: "(needs.job_get_metadata.outputs.changed_any_code == 'true' || github.event_name != 'pull_request')",
  steps: [
    getActionCheckoutStep({ name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})' }),
    getActionSetupNodeStep(),
    getActionCacheStep({
      key: '${{ needs.job_install_deps.outputs.dependency_cache_key }}',
      path: '${{ env.CACHED_DEPENDENCY_PATHS }}',
      failOnCacheMiss: true,
    }),
  ],
};

//     job_build: {
//       name: 'Build',
//       needs: ['job_get_metadata', 'job_install_deps'],
//       'runs-on': 'ubuntu-20.04-large-js',
//       'timeout-minutes': 30,
//       if: "(needs.job_get_metadata.outputs.changed_any_code == 'true' || github.event_name != 'pull_request')\n",
//       steps: [
//         {
//           name: 'Check dependency cache',
//           uses: 'actions/cache/restore@v4',
//           with: {
//             path: '${{ env.CACHED_DEPENDENCY_PATHS }}',
//             key: '${{ needs.job_install_deps.outputs.dependency_cache_key }}',
//             'fail-on-cache-miss': true,
//           },
//         },
//         {
//           name: 'Check build cache',
//           uses: 'actions/cache@v4',
//           id: 'cache_built_packages',
//           with: {
//             path: '${{ env.CACHED_BUILD_PATHS }}',
//             key: '${{ env.BUILD_CACHE_KEY }}',
//           },
//         },
//         {
//           name: 'NX cache',
//           uses: 'actions/cache@v4',
//           if: "needs.job_get_metadata.outputs.is_release == 'false' &&\nneeds.job_get_metadata.outputs.force_skip_cache == 'false'\n",
//           with: {
//             path: '.nxcache',
//             key: 'nx-Linux-${{ github.ref }}-${{ env.HEAD_COMMIT }}',
//             'restore-keys':
//               "${{needs.job_get_metadata.outputs.is_develop == 'false' && env.NX_CACHE_RESTORE_KEYS || 'nx-never-restore'}}",
//           },
//         },
//         {
//           name: 'Build packages',
//           if: "steps.cache_built_packages.outputs.cache-hit == ''",
//           run: 'yarn build',
//         },
//       ],
//       outputs: {
//         dependency_cache_key: '${{ needs.job_install_deps.outputs.dependency_cache_key }}',
//       },
//     },
