import type { NormalJob, Workflow } from '../schema/types';
import { buildJob } from './build';
import { checkBranchesJob } from './checkBranches';
import { getMetadataJob } from './getMetadata';
import { installDependenciesJob } from './installDependencies';
import { JobName } from './names';

export const jobs: Record<JobName, NormalJob> = {
  [JobName.GetMetadata]: getMetadataJob,
  [JobName.InstallDependencies]: installDependenciesJob,
  [JobName.CheckBranches]: checkBranchesJob,
  [JobName.Build]: buildJob,
} satisfies Workflow['jobs'];
