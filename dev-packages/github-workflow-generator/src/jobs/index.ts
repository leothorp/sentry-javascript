import type { Workflow } from '../schema/types';
import { getMetadataJob } from './getMetadata';
import type { JobName } from './names';

export const jobs: Record<JobName, unknown> = {
  job_get_metadata: getMetadataJob,
} satisfies Workflow['jobs'];
