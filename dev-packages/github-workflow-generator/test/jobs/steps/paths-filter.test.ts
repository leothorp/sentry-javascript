import type { PathsFilterStepOptions } from '../../../src/jobs/steps/paths-filter';
import { getPathsFilterStep } from '../../../src/jobs/steps/paths-filter';

describe('getPathsFilterStep', () => {
  it.each([
    {
      filters: {
        workflow: {
          alias: true,
          paths: ['.github/**'],
        },
      } as PathsFilterStepOptions['filters'],
      expectedFilters: "workflow: &workflow\n  - '.github/**'",
    },
    {
      filters: {
        workflow: {
          alias: true,
          paths: ['.github/**'],
        },
        shared: {
          alias: true,
          paths: [
            '*.{js,ts,json,yml,lock}',
            'CHANGELOG.md',
            'jest/**',
            'scripts/**',
            'packages/core/**',
            'packages/rollup-utils/**',
            'packages/tracing/**',
            'packages/tracing-internal/**',
            'packages/utils/**',
            'packages/types/**',
            'packages/integrations/**',
          ],
        },
      } as PathsFilterStepOptions['filters'],
      expectedFilters:
        "workflow: &workflow\n  - '.github/**'\nshared: &shared\n  - *workflow\n  - '*.{js,ts,json,yml,lock}'\n  - 'CHANGELOG.md'\n  - 'jest/**'\n  - 'scripts/**'\n  - 'packages/core/**'\n  - 'packages/rollup-utils/**'\n  - 'packages/tracing/**'\n  - 'packages/tracing-internal/**'\n  - 'packages/utils/**'\n  - 'packages/types/**'\n  - 'packages/integrations/**'",
    },
  ])('should return a PathsFilterStep with correct "with" options', ({ filters, expectedFilters }) => {
    const actual = getPathsFilterStep({ filters });
    expect(actual.with.filters).toEqual(expectedFilters);
  });

  it('should throw an error if a filter has no paths', () => {
    const filters = {
      packages: {
        alias: true,
        paths: [],
      },
    };

    const action = () => getPathsFilterStep({ filters });

    expect(action).toThrowError('Filter "packages" has no paths');
  });
});
