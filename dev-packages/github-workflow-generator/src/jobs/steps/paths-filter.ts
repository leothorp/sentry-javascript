import type { JobStep } from '../../types';

const ACTION = 'dorny/paths-filter@v3.0.0' as const;

export interface PathsFilterStepOptions {
  filters: Record<string, { alias?: boolean; paths: string[] }>;
}

/**
 * Wrapper around the `dorny/paths-filter` action.
 *
 * https://github.com/dorny/paths-filter
 */
export function getPathsFilterStep({ filters }: PathsFilterStepOptions): PathsFilterStep {
  if (Object.keys(filters).length === 0) {
    throw new Error('At least one filter must be provided');
  }

  let filtersString = '';
  for (const [name, { alias, paths }] of Object.entries(filters)) {
    if (paths.length === 0) {
      throw new Error(`Filter "${name}" has no paths`);
    }

    if (filtersString !== '') {
      filtersString += '\n';
    }

    filtersString += `${name}:`;
    if (alias) {
      filtersString += ` &${name}`;
    }
    for (const path of paths) {
      filtersString += `\n  - '${path}'`;
    }
  }

  const step: PathsFilterStep = {
    name: 'Determine changed packages',
    uses: ACTION,
    id: 'changed',
    with: {
      filters: filtersString,
    },
  } satisfies JobStep;

  return step;
}

// https://github.com/dorny/paths-filter?tab=readme-ov-file#usage
interface WithOptions {
  // Defines filters applied to detected changed files.
  // Each filter has a name and a list of rules.
  // Rule is a glob expression - paths of all changed
  // files are matched against it.
  // Rule can optionally specify if the file
  // should be added, modified, or deleted.
  // For each filter, there will be a corresponding output variable to
  // indicate if there's a changed file matching any of the rules.
  // Optionally, there can be a second output variable
  // set to list of all files matching the filter.
  // Filters can be provided inline as a string (containing valid YAML document),
  // or as a relative path to a file (e.g.: .github/filters.yaml).
  // Filters syntax is documented by example - see examples section.
  filters?: string;
}

type PathsFilterStep = JobStep & {
  uses: typeof ACTION;
  with: WithOptions;
};
