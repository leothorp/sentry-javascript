import type { NormalJob } from './schema/types';

export type JobStep = NonNullable<NormalJob['steps']>[0];
