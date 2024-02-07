import type { NormalJob } from '../schema/types';
import { MachineType } from './machines';
import { JobName } from './names';

export const checkBranchesJob: NormalJob = {
  name: 'Check PR branches',
  needs: JobName.GetMetadata,
  'runs-on': MachineType.Ubuntu_20_04,
  if: "github.event_name == 'pull_request'",
  permissions: {
    'pull-requests': 'write',
  },
  steps: [
    {
      name: 'PR is opened against master',
      uses: 'mshick/add-pr-comment@dd126dd8c253650d181ad9538d8b4fa218fc31e8',
      if: "${{ github.base_ref == 'master' && !startsWith(github.head_ref, 'prepare-release/') }}",
      with: {
        message: '⚠️ This PR is opened against **master**. You probably want to open it against **develop**.',
      },
    },
  ],
};
