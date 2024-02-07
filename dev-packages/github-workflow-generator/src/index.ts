import type { Workflow } from './schema/types';

import { env } from './env';
import { jobs } from './jobs';

export const workflow = {
  name: 'Build & Test',
  on: {
    push: {
      branches: ['develop', 'master', 'release/**'],
    },
    pull_request: null,
    workflow_dispatch: {
      inputs: {
        commit: {
          description: "If the commit you want to test isn't the head of a branch, provide its SHA here",
          required: false,
        },
      },
    },
    schedule: [
      {
        cron: '0 0 * * *',
      },
    ],
  },
  concurrency: {
    group: '${{ github.workflow }}-${{ github.head_ref || github.run_id }}',
    'cancel-in-progress': true,
  },
  env,
  jobs,
} satisfies Workflow;

// const h = {
//   jobs: {
//     job_size_check: {
//       name: 'Size Check',
//       needs: ['job_get_metadata', 'job_build'],
//       'timeout-minutes': 15,
//       'runs-on': 'ubuntu-20.04',
//       if: "github.event_name == 'pull_request' || needs.job_get_metadata.outputs.is_develop == 'true' || needs.job_get_metadata.outputs.is_release == 'true'",
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version': '14',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Check bundle sizes',
//           uses: 'getsentry/size-limit-action@runForBranch',
//           with: {
//             github_token: '${{ secrets.GITHUB_TOKEN }}',
//             skip_step: 'build',
//             main_branch: 'develop',
//             run_for_branch: "${{ (needs.job_get_metadata.outputs.is_release == 'true' && 'true') || '' }}",
//           },
//         },
//       ],
//     },
//     job_lint: {
//       name: 'Lint',
//       needs: ['job_get_metadata', 'job_build'],
//       'timeout-minutes': 10,
//       'runs-on': 'ubuntu-20.04',
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Lint source files',
//           run: 'yarn lint:lerna',
//         },
//         {
//           name: 'Lint C++ files',
//           run: 'yarn lint:clang',
//         },
//         {
//           name: 'Validate ES5 builds',
//           run: 'yarn validate:es5',
//         },
//       ],
//     },
//     job_check_format: {
//       name: 'Check file formatting',
//       needs: ['job_get_metadata', 'job_install_deps'],
//       'timeout-minutes': 10,
//       'runs-on': 'ubuntu-20.04',
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
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
//           name: 'Check file formatting',
//           run: 'yarn lint:prettier && yarn lint:biome',
//         },
//       ],
//     },
//     job_circular_dep_check: {
//       name: 'Circular Dependency Check',
//       needs: ['job_get_metadata', 'job_build'],
//       'timeout-minutes': 10,
//       'runs-on': 'ubuntu-20.04',
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Run madge',
//           run: 'yarn circularDepCheck',
//         },
//       ],
//     },
//     job_artifacts: {
//       name: 'Upload Artifacts',
//       needs: ['job_get_metadata', 'job_build', 'job_compile_bindings_profiling_node'],
//       'runs-on': 'ubuntu-20.04',
//       if: "needs.job_get_metadata.outputs.is_release == 'true'",
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Pack tarballs',
//           run: 'yarn build:tarball --ignore @sentry/profiling-node',
//         },
//         {
//           name: 'Restore profiling tarball',
//           uses: 'actions/cache/restore@v4',
//           with: {
//             key: '${{ env.BUILD_PROFILING_NODE_CACHE_TARBALL_KEY }}',
//             path: '${{ github.workspace }}/packages/*/*.tgz',
//           },
//         },
//         {
//           name: 'Archive artifacts',
//           uses: 'actions/upload-artifact@v4',
//           with: {
//             name: '${{ github.sha }}',
//             path: '${{ github.workspace }}/packages/browser/build/bundles/**\n${{ github.workspace }}/packages/integrations/build/bundles/**\n${{ github.workspace }}/packages/replay/build/bundles/**\n${{ github.workspace }}/packages/replay-canvas/build/bundles/**\n${{ github.workspace }}/packages/**/*.tgz\n${{ github.workspace }}/packages/serverless/build/aws/dist-serverless/*.zip\n',
//           },
//         },
//       ],
//     },
//     job_browser_unit_tests: {
//       name: 'Browser Unit Tests',
//       needs: ['job_get_metadata', 'job_build'],
//       'timeout-minutes': 10,
//       'runs-on': 'ubuntu-20.04',
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Run tests',
//           env: {
//             NODE_VERSION: 16,
//           },
//           run: 'yarn test-ci-browser',
//         },
//         {
//           name: 'Compute test coverage',
//           uses: 'codecov/codecov-action@v4',
//           with: {
//             token: '${{ secrets.CODECOV_TOKEN }}',
//           },
//         },
//       ],
//     },
//     job_bun_unit_tests: {
//       name: 'Bun Unit Tests',
//       needs: ['job_get_metadata', 'job_build'],
//       'timeout-minutes': 10,
//       'runs-on': 'ubuntu-20.04',
//       strategy: {
//         'fail-fast': false,
//       },
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
//         {
//           name: 'Set up Bun',
//           uses: 'oven-sh/setup-bun@v1',
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Run tests',
//           run: 'yarn test-ci-bun\n',
//         },
//       ],
//     },
//     job_deno_unit_tests: {
//       name: 'Deno Unit Tests',
//       needs: ['job_get_metadata', 'job_build'],
//       if: "needs.job_get_metadata.outputs.changed_deno == 'true' || github.event_name != 'pull_request'",
//       'timeout-minutes': 10,
//       'runs-on': 'ubuntu-20.04',
//       strategy: {
//         'fail-fast': false,
//       },
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
//         {
//           name: 'Set up Deno',
//           uses: 'denoland/setup-deno@v1.1.4',
//           with: {
//             'deno-version': 'v1.38.5',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Run tests',
//           run: 'cd packages/deno\nyarn build\nyarn test\n',
//         },
//       ],
//     },
//     job_node_unit_tests: {
//       name: 'Node (${{ matrix.node }}) Unit Tests',
//       if: "needs.job_get_metadata.outputs.changed_node == 'true' || github.event_name != 'pull_request'",
//       needs: ['job_get_metadata', 'job_build'],
//       'timeout-minutes': 10,
//       'runs-on': 'ubuntu-20.04',
//       strategy: {
//         'fail-fast': false,
//         matrix: {
//           node: [8, 10, 12, 14, 16, 18, 20, 21],
//         },
//       },
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version': '${{ matrix.node }}',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Run tests',
//           env: {
//             NODE_VERSION: '${{ matrix.node }}',
//           },
//           run: '[[ $NODE_VERSION == 8 ]] && yarn add --dev --ignore-engines --ignore-scripts --ignore-workspace-root-check ts-node@8.10.2\nyarn test-ci-node\n',
//         },
//         {
//           name: 'Compute test coverage',
//           uses: 'codecov/codecov-action@v4',
//           with: {
//             token: '${{ secrets.CODECOV_TOKEN }}',
//           },
//         },
//       ],
//     },
//     job_profiling_node_unit_tests: {
//       name: 'Node Profiling Unit Tests',
//       needs: ['job_get_metadata', 'job_build'],
//       if: "needs.job_get_metadata.outputs.changed_node == 'true' || needs.job_get_metadata.outputs.changed_profiling_node == 'true' || github.event_name != 'pull_request'",
//       'runs-on': 'ubuntu-latest',
//       'timeout-minutes': 10,
//       steps: [
//         {
//           name: 'Check out current commit',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version': 20,
//           },
//         },
//         {
//           uses: 'actions/setup-python@v5',
//           with: {
//             'python-version': '3.11.7',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Build Configure node-gyp',
//           run: 'yarn lerna run build:bindings:configure --scope @sentry/profiling-node',
//         },
//         {
//           name: 'Build Bindings for Current Environment',
//           run: 'yarn build --scope @sentry/profiling-node',
//         },
//         {
//           name: 'Unit Test',
//           run: 'yarn lerna run test --scope @sentry/profiling-node',
//         },
//       ],
//     },
//     job_nextjs_integration_test: {
//       name: 'Nextjs (Node ${{ matrix.node }}) Tests',
//       needs: ['job_get_metadata', 'job_build'],
//       if: "needs.job_get_metadata.outputs.changed_nextjs == 'true' || github.event_name != 'pull_request'",
//       'timeout-minutes': 25,
//       'runs-on': 'ubuntu-20.04',
//       strategy: {
//         'fail-fast': false,
//         matrix: {
//           node: [10, 12, 14, 16, 18, 20, 21],
//         },
//       },
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version': '${{ matrix.node }}',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Get npm cache directory',
//           id: 'npm-cache-dir',
//           run: 'echo "dir=$(npm config get cache)" >> $GITHUB_OUTPUT',
//         },
//         {
//           name: 'Get Playwright version',
//           id: 'playwright-version',
//           run: 'echo "version=$(node -p "require(\'@playwright/test/package.json\').version")" >> $GITHUB_OUTPUT',
//         },
//         {
//           uses: 'actions/cache@v4',
//           name: 'Check if Playwright browser is cached',
//           id: 'playwright-cache',
//           with: {
//             path: '${{ steps.npm-cache-dir.outputs.dir }}',
//             key: '${{ runner.os }}-Playwright-${{steps.playwright-version.outputs.version}}',
//           },
//         },
//         {
//           name: 'Install Playwright browser if not cached',
//           if: "steps.playwright-cache.outputs.cache-hit != 'true' && matrix.node >= 14",
//           run: 'npx playwright install --with-deps',
//           env: {
//             PLAYWRIGHT_BROWSERS_PATH: '${{steps.npm-cache-dir.outputs.dir}}',
//           },
//         },
//         {
//           name: 'Install OS dependencies of Playwright if cache hit',
//           if: "steps.playwright-cache.outputs.cache-hit == 'true' && matrix.node >= 14",
//           run: 'npx playwright install-deps',
//         },
//         {
//           name: 'Run tests',
//           env: {
//             NODE_VERSION: '${{ matrix.node }}',
//           },
//           run: 'cd packages/nextjs\nyarn test:integration\n',
//         },
//       ],
//     },
//     job_browser_playwright_tests: {
//       name: "Playwright (${{ matrix.bundle }}${{ matrix.shard && format(' {0}/{1}', matrix.shard, matrix.shards) || ''}}) Tests",
//       needs: ['job_get_metadata', 'job_build'],
//       if: "needs.job_get_metadata.outputs.changed_browser_integration == 'true' || github.event_name != 'pull_request'",
//       'runs-on': 'ubuntu-20.04-large-js',
//       'timeout-minutes': 25,
//       strategy: {
//         'fail-fast': false,
//         matrix: {
//           bundle: [
//             'esm',
//             'bundle_es5',
//             'bundle_es5_min',
//             'bundle_es6',
//             'bundle_es6_min',
//             'bundle_replay_es6',
//             'bundle_replay_es6_min',
//             'bundle_tracing_es5',
//             'bundle_tracing_es5_min',
//             'bundle_tracing_es6',
//             'bundle_tracing_es6_min',
//             'bundle_tracing_replay_es6',
//             'bundle_tracing_replay_es6_min',
//           ],
//           project: ['chromium'],
//           include: [
//             {
//               bundle: 'bundle_tracing_replay_es6_min',
//               project: '',
//               shard: 1,
//               shards: 2,
//             },
//             {
//               bundle: 'bundle_tracing_replay_es6_min',
//               project: '',
//               shard: 2,
//               shards: 2,
//             },
//             {
//               bundle: 'esm',
//               project: '',
//               shard: 1,
//               shards: 3,
//             },
//             {
//               bundle: 'esm',
//               shard: 2,
//               shards: 3,
//             },
//             {
//               bundle: 'esm',
//               project: '',
//               shard: 3,
//               shards: 3,
//             },
//           ],
//           exclude: [
//             {
//               bundle: 'bundle_tracing_replay_es6_min',
//               project: 'chromium',
//             },
//             {
//               bundle: 'esm',
//               project: 'chromium',
//             },
//           ],
//         },
//       },
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Get npm cache directory',
//           id: 'npm-cache-dir',
//           run: 'echo "dir=$(npm config get cache)" >> $GITHUB_OUTPUT',
//         },
//         {
//           name: 'Get Playwright version',
//           id: 'playwright-version',
//           run: 'echo "version=$(node -p "require(\'@playwright/test/package.json\').version")" >> $GITHUB_OUTPUT',
//         },
//         {
//           uses: 'actions/cache@v4',
//           name: 'Check if Playwright browser is cached',
//           id: 'playwright-cache',
//           with: {
//             path: '${{ steps.npm-cache-dir.outputs.dir }}',
//             key: '${{ runner.os }}-Playwright-${{steps.playwright-version.outputs.version}}',
//           },
//         },
//         {
//           name: 'Install Playwright browser if not cached',
//           if: "steps.playwright-cache.outputs.cache-hit != 'true'",
//           run: 'npx playwright install --with-deps',
//           env: {
//             PLAYWRIGHT_BROWSERS_PATH: '${{steps.npm-cache-dir.outputs.dir}}',
//           },
//         },
//         {
//           name: 'Install OS dependencies of Playwright if cache hit',
//           if: "steps.playwright-cache.outputs.cache-hit == 'true'",
//           run: 'npx playwright install-deps',
//         },
//         {
//           name: 'Run Playwright tests',
//           env: {
//             PW_BUNDLE: '${{ matrix.bundle }}',
//           },
//           'working-directory': 'dev-packages/browser-integration-tests',
//           run: "yarn test:ci${{ matrix.project && format(' --project={0}', matrix.project) || '' }}${{ matrix.shard && format(' --shard={0}/{1}', matrix.shard, matrix.shards) || '' }}",
//         },
//       ],
//     },
//     job_browser_loader_tests: {
//       name: 'Playwright Loader (${{ matrix.bundle }}) Tests',
//       needs: ['job_get_metadata', 'job_build'],
//       if: "needs.job_get_metadata.outputs.changed_browser_integration == 'true' || github.event_name != 'pull_request'",
//       'runs-on': 'ubuntu-20.04',
//       'timeout-minutes': 15,
//       strategy: {
//         'fail-fast': false,
//         matrix: {
//           bundle: [
//             'loader_base',
//             'loader_eager',
//             'loader_debug',
//             'loader_tracing',
//             'loader_replay',
//             'loader_tracing_replay',
//           ],
//         },
//       },
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Get npm cache directory',
//           id: 'npm-cache-dir',
//           run: 'echo "dir=$(npm config get cache)" >> $GITHUB_OUTPUT',
//         },
//         {
//           name: 'Get Playwright version',
//           id: 'playwright-version',
//           run: 'echo "version=$(node -p "require(\'@playwright/test/package.json\').version")" >> $GITHUB_OUTPUT',
//         },
//         {
//           uses: 'actions/cache@v4',
//           name: 'Check if Playwright browser is cached',
//           id: 'playwright-cache',
//           with: {
//             path: '${{ steps.npm-cache-dir.outputs.dir }}',
//             key: '${{ runner.os }}-Playwright-${{steps.playwright-version.outputs.version}}',
//           },
//         },
//         {
//           name: 'Install Playwright browser if not cached',
//           if: "steps.playwright-cache.outputs.cache-hit != 'true'",
//           run: 'npx playwright install --with-deps',
//           env: {
//             PLAYWRIGHT_BROWSERS_PATH: '${{steps.npm-cache-dir.outputs.dir}}',
//           },
//         },
//         {
//           name: 'Install OS dependencies of Playwright if cache hit',
//           if: "steps.playwright-cache.outputs.cache-hit == 'true'",
//           run: 'npx playwright install-deps',
//         },
//         {
//           name: 'Run Playwright Loader tests',
//           env: {
//             PW_BUNDLE: '${{ matrix.bundle }}',
//           },
//           run: 'cd dev-packages/browser-integration-tests\nyarn test:loader\n',
//         },
//       ],
//     },
//     job_browser_integration_tests: {
//       name: 'Browser (${{ matrix.browser }}) Tests',
//       needs: ['job_get_metadata', 'job_build'],
//       if: "needs.job_get_metadata.outputs.changed_browser == 'true' || github.event_name != 'pull_request'",
//       'runs-on': 'ubuntu-20.04-large-js',
//       'timeout-minutes': 20,
//       strategy: {
//         'fail-fast': false,
//         matrix: {
//           browser: ['ChromeHeadless', 'FirefoxHeadless', 'WebkitHeadless'],
//         },
//       },
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Run integration tests',
//           env: {
//             KARMA_BROWSER: '${{ matrix.browser }}',
//           },
//           run: 'cd packages/browser\n[[ $KARMA_BROWSER == WebkitHeadless ]] && yarn run playwright install-deps webkit\nyarn test:integration\n',
//         },
//       ],
//     },
//     job_browser_build_tests: {
//       name: 'Browser Build Tests',
//       needs: ['job_get_metadata', 'job_build'],
//       'runs-on': 'ubuntu-20.04',
//       'timeout-minutes': 5,
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Run browser build tests',
//           run: 'cd packages/browser\nyarn test:package\n',
//         },
//         {
//           name: 'Run utils build tests',
//           run: 'cd packages/utils\nyarn test:package\n',
//         },
//       ],
//     },
//     job_check_for_faulty_dts: {
//       name: 'Check for faulty .d.ts files',
//       needs: ['job_get_metadata', 'job_build'],
//       'runs-on': 'ubuntu-20.04',
//       'timeout-minutes': 5,
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Check for dts files that reference stuff in the temporary build folder',
//           run: 'if grep -r --include "*.d.ts" --exclude-dir ".nxcache" \'import("@sentry(-internal)?/[^/]*/build\' .; then\n  echo "Found illegal TypeScript import statement."\n  exit 1\nfi\n',
//         },
//       ],
//     },
//     job_node_integration_tests: {
//       name: "Node (${{ matrix.node }})${{ (matrix.typescript && format(' (TS {0})', matrix.typescript)) || '' }} Integration Tests",
//       needs: ['job_get_metadata', 'job_build'],
//       if: "needs.job_get_metadata.outputs.changed_node == 'true' || github.event_name != 'pull_request'",
//       'runs-on': 'ubuntu-20.04',
//       'timeout-minutes': 15,
//       strategy: {
//         'fail-fast': false,
//         matrix: {
//           node: [10, 12, 14, 16, 18, 20, 21],
//           typescript: [false],
//           include: [
//             {
//               node: 20,
//               typescript: '3.8',
//             },
//           ],
//         },
//       },
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version': '${{ matrix.node }}',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Overwrite typescript version',
//           if: 'matrix.typescript',
//           run: 'yarn add --dev --ignore-workspace-root-check typescript@${{ matrix.typescript }}',
//         },
//         {
//           name: 'Run integration tests',
//           env: {
//             NODE_VERSION: '${{ matrix.node }}',
//           },
//           run: 'cd dev-packages/node-integration-tests\nyarn test\n',
//         },
//       ],
//     },
//     job_remix_integration_tests: {
//       name: "Remix v${{ matrix.remix }} (Node ${{ matrix.node }}) ${{ matrix.tracingIntegration && 'TracingIntegration'}} Tests",
//       needs: ['job_get_metadata', 'job_build'],
//       if: "needs.job_get_metadata.outputs.changed_remix == 'true' || github.event_name != 'pull_request'",
//       'runs-on': 'ubuntu-20.04',
//       'timeout-minutes': 10,
//       strategy: {
//         'fail-fast': false,
//         matrix: {
//           node: [18, 20, 21],
//           remix: [1, 2],
//           include: [
//             {
//               node: 14,
//               remix: 1,
//             },
//             {
//               node: 16,
//               remix: 1,
//             },
//             {
//               tracingIntegration: true,
//               remix: 2,
//             },
//           ],
//         },
//       },
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version': '${{ matrix.node }}',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Run integration tests',
//           env: {
//             NODE_VERSION: '${{ matrix.node }}',
//             REMIX_VERSION: '${{ matrix.remix }}',
//             TRACING_INTEGRATION: '${{ matrix.tracingIntegration }}',
//           },
//           run: 'cd packages/remix\nyarn test:integration:ci\n',
//         },
//       ],
//     },
//     job_e2e_prepare: {
//       name: 'Prepare E2E tests',
//       if: "always() && needs.job_build.result == 'success' &&\n(needs.job_compile_bindings_profiling_node.result == 'success' || needs.job_compile_bindings_profiling_node.result == 'skipped') &&\n(github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository) &&\ngithub.actor != 'dependabot[bot]'\n",
//       needs: ['job_get_metadata', 'job_build', 'job_compile_bindings_profiling_node'],
//       'runs-on': 'ubuntu-20.04-large-js',
//       'timeout-minutes': 15,
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'NX cache',
//           uses: 'actions/cache/restore@v4',
//           with: {
//             path: '.nxcache',
//             key: 'nx-Linux-${{ github.ref }}-${{ env.HEAD_COMMIT }}',
//             'restore-keys': '${{ env.NX_CACHE_RESTORE_KEYS }}',
//           },
//         },
//         {
//           name: 'Build tarballs',
//           run: 'yarn build:tarball --ignore @sentry/profiling-node',
//         },
//         {
//           name: 'Build Profiling Node',
//           if: "(needs.job_get_metadata.outputs.changed_profiling_node_bindings == 'true') ||\n(needs.job_get_metadata.outputs.is_release == 'true') ||\n(github.event_name != 'pull_request')\n",
//           run: 'yarn lerna run build:lib --scope @sentry/profiling-node',
//         },
//         {
//           name: 'Extract Profiling Node Prebuilt Binaries',
//           if: "(needs.job_get_metadata.outputs.changed_profiling_node_bindings == 'true') ||\n(github.event_name != 'pull_request')\n",
//           uses: 'actions/download-artifact@v3',
//           with: {
//             name: 'profiling-node-binaries-${{ github.sha }}',
//             path: '${{ github.workspace }}/packages/profiling-node/lib/',
//           },
//         },
//         {
//           name: 'Build Profiling tarball',
//           run: 'yarn build:tarball --scope @sentry/profiling-node',
//         },
//         {
//           name: 'Stores tarballs in cache',
//           uses: 'actions/cache/save@v4',
//           with: {
//             path: '${{ github.workspace }}/packages/*/*.tgz',
//             key: '${{ env.BUILD_PROFILING_NODE_CACHE_TARBALL_KEY }}',
//           },
//         },
//       ],
//     },
//     job_e2e_tests: {
//       name: 'E2E ${{ matrix.label || matrix.test-application }} Test',
//       if: "always() && needs.job_e2e_prepare.result == 'success' && (github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository) && github.actor != 'dependabot[bot]'",
//       needs: ['job_get_metadata', 'job_build', 'job_e2e_prepare'],
//       'runs-on': 'ubuntu-20.04',
//       'timeout-minutes': 10,
//       env: {
//         E2E_TEST_AUTH_TOKEN: '${{ secrets.E2E_TEST_AUTH_TOKEN }}',
//         E2E_TEST_DSN: '${{ secrets.E2E_TEST_DSN }}',
//         NEXT_PUBLIC_E2E_TEST_DSN: '${{ secrets.E2E_TEST_DSN }}',
//         PUBLIC_E2E_TEST_DSN: '${{ secrets.E2E_TEST_DSN }}',
//         REACT_APP_E2E_TEST_DSN: '${{ secrets.E2E_TEST_DSN }}',
//         E2E_TEST_SENTRY_ORG_SLUG: 'sentry-javascript-sdks',
//         E2E_TEST_SENTRY_TEST_PROJECT: 'sentry-javascript-e2e-tests',
//       },
//       strategy: {
//         'fail-fast': false,
//         matrix: {
//           'test-application': [
//             'angular-17',
//             'cloudflare-astro',
//             'node-express-app',
//             'create-react-app',
//             'create-next-app',
//             'debug-id-sourcemaps',
//             'nextjs-app-dir',
//             'nextjs-14',
//             'react-create-hash-router',
//             'react-router-6-use-routes',
//             'standard-frontend-react',
//             'standard-frontend-react-tracing-import',
//             'sveltekit',
//             'sveltekit-2',
//             'generic-ts3.8',
//             'node-experimental-fastify-app',
//             'node-hapi-app',
//             'node-exports-test-app',
//             'vue-3',
//           ],
//           'build-command': [false],
//           label: [false],
//           include: [
//             {
//               'test-application': 'create-react-app',
//               'build-command': 'test:build-ts3.8',
//               label: 'create-react-app (TS 3.8)',
//             },
//             {
//               'test-application': 'standard-frontend-react',
//               'build-command': 'test:build-ts3.8',
//               label: 'standard-frontend-react (TS 3.8)',
//             },
//             {
//               'test-application': 'create-next-app',
//               'build-command': 'test:build-13',
//               label: 'create-next-app (next@13)',
//             },
//             {
//               'test-application': 'nextjs-app-dir',
//               'build-command': 'test:build-13',
//               label: 'nextjs-app-dir (next@13)',
//             },
//           ],
//         },
//       },
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           uses: 'pnpm/action-setup@v2',
//           with: {
//             version: '8.3.1',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'dev-packages/e2e-tests/package.json',
//           },
//         },
//         {
//           name: 'Set up Bun',
//           if: "matrix.test-application == 'node-exports-test-app'",
//           uses: 'oven-sh/setup-bun@v1',
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Restore tarball cache',
//           uses: 'actions/cache/restore@v4',
//           with: {
//             path: '${{ github.workspace }}/packages/*/*.tgz',
//             key: '${{ env.BUILD_PROFILING_NODE_CACHE_TARBALL_KEY }}',
//           },
//         },
//         {
//           name: 'Get node version',
//           id: 'versions',
//           run: 'echo "echo node=$(jq -r \'.volta.node\' dev-packages/e2e-tests/package.json)" >> $GITHUB_OUTPUT\n',
//         },
//         {
//           name: 'Validate Verdaccio',
//           run: 'yarn test:validate',
//           'working-directory': 'dev-packages/e2e-tests',
//         },
//         {
//           name: 'Prepare Verdaccio',
//           run: 'yarn test:prepare',
//           'working-directory': 'dev-packages/e2e-tests',
//           env: {
//             E2E_TEST_PUBLISH_SCRIPT_NODE_VERSION: '${{ steps.versions.outputs.node }}',
//           },
//         },
//         {
//           name: 'Build E2E app',
//           'working-directory': 'dev-packages/e2e-tests/test-applications/${{ matrix.test-application }}',
//           'timeout-minutes': 5,
//           run: "yarn ${{ matrix.build-command || 'test:build' }}",
//         },
//         {
//           name: 'Run E2E test',
//           'working-directory': 'dev-packages/e2e-tests/test-applications/${{ matrix.test-application }}',
//           'timeout-minutes': 5,
//           run: 'yarn test:assert',
//         },
//         {
//           name: 'Deploy Astro to Cloudflare',
//           uses: 'cloudflare/pages-action@v1',
//           if: "matrix.test-application == 'cloudflare-astro'",
//           with: {
//             apiToken: '${{ secrets.CLOUDFLARE_API_TOKEN }}',
//             accountId: '${{ secrets.CLOUDFLARE_ACCOUNT_ID }}',
//             projectName: '${{ secrets.CLOUDFLARE_PROJECT_NAME }}',
//             directory: 'dist',
//             workingDirectory: 'dev-packages/e2e-tests/test-applications/${{ matrix.test-application }}',
//           },
//         },
//       ],
//     },
//     job_profiling_e2e_tests: {
//       name: 'E2E ${{ matrix.label || matrix.test-application }} Test',
//       if: "always() && needs.job_e2e_prepare.result == 'success' && (github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository) && github.actor != 'dependabot[bot]' && ( (needs.job_get_metadata.outputs.changed_profiling_node_bindings == 'true') || (needs.job_get_metadata.outputs.is_release == 'true') || (github.event_name != 'pull_request') )",
//       needs: ['job_get_metadata', 'job_build', 'job_e2e_prepare'],
//       'runs-on': 'ubuntu-20.04',
//       'timeout-minutes': 10,
//       env: {
//         E2E_TEST_AUTH_TOKEN: '${{ secrets.E2E_TEST_AUTH_TOKEN }}',
//         E2E_TEST_DSN: '${{ secrets.E2E_TEST_DSN }}',
//         E2E_TEST_SENTRY_ORG_SLUG: 'sentry-javascript-sdks',
//         E2E_TEST_SENTRY_TEST_PROJECT: 'sentry-javascript-e2e-tests',
//       },
//       strategy: {
//         'fail-fast': false,
//         matrix: {
//           'test-application': ['node-profiling'],
//           'build-command': [false],
//           label: [false],
//         },
//       },
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           uses: 'pnpm/action-setup@v2',
//           with: {
//             version: '8.3.1',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'dev-packages/e2e-tests/package.json',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Build Profiling Node',
//           run: 'yarn lerna run build:lib --scope @sentry/profiling-node',
//         },
//         {
//           name: 'Extract Profiling Node Prebuilt Binaries',
//           uses: 'actions/download-artifact@v3',
//           with: {
//             name: 'profiling-node-binaries-${{ github.sha }}',
//             path: '${{ github.workspace }}/packages/profiling-node/lib/',
//           },
//         },
//         {
//           name: 'Build Profiling tarball',
//           run: 'yarn build:tarball --scope @sentry/profiling-node',
//         },
//         {
//           name: 'Restore tarball cache',
//           uses: 'actions/cache/restore@v4',
//           with: {
//             path: '${{ github.workspace }}/packages/*/*.tgz',
//             key: '${{ env.BUILD_PROFILING_NODE_CACHE_TARBALL_KEY }}',
//           },
//         },
//         {
//           name: 'Get node version',
//           id: 'versions',
//           run: 'echo "echo node=$(jq -r \'.volta.node\' dev-packages/e2e-tests/package.json)" >> $GITHUB_OUTPUT\n',
//         },
//         {
//           name: 'Validate Verdaccio',
//           run: 'yarn test:validate',
//           'working-directory': 'dev-packages/e2e-tests',
//         },
//         {
//           name: 'Prepare Verdaccio',
//           run: 'yarn test:prepare',
//           'working-directory': 'dev-packages/e2e-tests',
//           env: {
//             E2E_TEST_PUBLISH_SCRIPT_NODE_VERSION: '${{ steps.versions.outputs.node }}',
//           },
//         },
//         {
//           name: 'Build E2E app',
//           'working-directory': 'dev-packages/e2e-tests/test-applications/${{ matrix.test-application }}',
//           'timeout-minutes': 5,
//           run: "yarn ${{ matrix.build-command || 'test:build' }}",
//         },
//         {
//           name: 'Run E2E test',
//           'working-directory': 'dev-packages/e2e-tests/test-applications/${{ matrix.test-application }}',
//           'timeout-minutes': 5,
//           run: 'yarn test:assert',
//         },
//       ],
//     },
//     job_required_jobs_passed: {
//       name: 'All required jobs passed or were skipped',
//       needs: [
//         'job_build',
//         'job_compile_bindings_profiling_node',
//         'job_browser_build_tests',
//         'job_browser_unit_tests',
//         'job_bun_unit_tests',
//         'job_deno_unit_tests',
//         'job_node_unit_tests',
//         'job_profiling_node_unit_tests',
//         'job_nextjs_integration_test',
//         'job_node_integration_tests',
//         'job_browser_playwright_tests',
//         'job_browser_integration_tests',
//         'job_browser_loader_tests',
//         'job_remix_integration_tests',
//         'job_e2e_tests',
//         'job_profiling_e2e_tests',
//         'job_artifacts',
//         'job_lint',
//         'job_check_format',
//         'job_circular_dep_check',
//       ],
//       if: 'always()',
//       'runs-on': 'ubuntu-20.04',
//       steps: [
//         {
//           name: 'Check for failures',
//           if: "contains(needs.*.result, 'failure')",
//           run: 'echo "One of the dependent jobs have failed. You may need to re-run it." && exit 1\n',
//         },
//       ],
//     },
//     overhead_metrics: {
//       name: 'Overhead metrics',
//       needs: ['job_get_metadata', 'job_build'],
//       'runs-on': 'ubuntu-20.04',
//       'timeout-minutes': 30,
//       if: "contains(github.event.pull_request.labels.*.name, 'ci-overhead-measurements')\n",
//       steps: [
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Set up Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version-file': 'package.json',
//           },
//         },
//         {
//           name: 'Restore caches',
//           uses: './.github/actions/restore-cache',
//           env: {
//             DEPENDENCY_CACHE_KEY: '${{ needs.job_build.outputs.dependency_cache_key }}',
//           },
//         },
//         {
//           name: 'Collect',
//           run: 'yarn ci:collect',
//           'working-directory': 'dev-packages/overhead-metrics',
//         },
//         {
//           name: 'Process',
//           id: 'process',
//           run: 'yarn ci:process',
//           'working-directory': 'dev-packages/overhead-metrics',
//           if: "github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository",
//           env: {
//             GITHUB_TOKEN: '${{ github.token }}',
//           },
//         },
//         {
//           name: 'Upload results',
//           uses: 'actions/upload-artifact@v4',
//           if: "github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository",
//           with: {
//             name: '${{ steps.process.outputs.artifactName }}',
//             path: '${{ steps.process.outputs.artifactPath }}',
//           },
//         },
//       ],
//     },
//     job_compile_bindings_profiling_node: {
//       name: "Compile & Test Profiling Bindings (v${{ matrix.node }}) ${{ matrix.target_platform || matrix.os }}, ${{ matrix.node || matrix.container }}, ${{ matrix.arch || matrix.container }}, ${{ contains(matrix.container, 'alpine') && 'musl' || 'glibc'  }}",
//       needs: ['job_get_metadata', 'job_install_deps', 'job_build'],
//       if: "(needs.job_get_metadata.outputs.changed_profiling_node_bindings == 'true') ||\n(needs.job_get_metadata.outputs.is_release == 'true') ||\n(github.event_name != 'pull_request')\n",
//       'runs-on': '${{ matrix.os }}',
//       container: '${{ matrix.container }}',
//       'timeout-minutes': 30,
//       strategy: {
//         'fail-fast': false,
//         matrix: {
//           include: [
//             {
//               os: 'ubuntu-20.04',
//               node: 16,
//             },
//             {
//               os: 'ubuntu-20.04',
//               node: 18,
//             },
//             {
//               os: 'ubuntu-20.04',
//               node: 20,
//             },
//             {
//               os: 'ubuntu-20.04',
//               container: 'node:16-alpine3.16',
//               node: 16,
//             },
//             {
//               os: 'ubuntu-20.04',
//               container: 'node:18-alpine3.17',
//               node: 18,
//             },
//             {
//               os: 'ubuntu-20.04',
//               container: 'node:20-alpine3.17',
//               node: 20,
//             },
//             {
//               os: 'ubuntu-20.04',
//               arch: 'arm64',
//               node: 16,
//             },
//             {
//               os: 'ubuntu-20.04',
//               arch: 'arm64',
//               node: 18,
//             },
//             {
//               os: 'ubuntu-20.04',
//               arch: 'arm64',
//               node: 20,
//             },
//             {
//               os: 'ubuntu-20.04',
//               container: 'node:16-alpine3.16',
//               arch: 'arm64',
//               node: 16,
//             },
//             {
//               os: 'ubuntu-20.04',
//               arch: 'arm64',
//               container: 'node:18-alpine3.17',
//               node: 18,
//             },
//             {
//               os: 'ubuntu-20.04',
//               arch: 'arm64',
//               container: 'node:20-alpine3.17',
//               node: 20,
//             },
//             {
//               os: 'macos-11',
//               node: 16,
//               arch: 'x64',
//             },
//             {
//               os: 'macos-11',
//               node: 18,
//               arch: 'x64',
//             },
//             {
//               os: 'macos-11',
//               node: 20,
//               arch: 'x64',
//             },
//             {
//               os: 'macos-12',
//               arch: 'arm64',
//               node: 16,
//               target_platform: 'darwin',
//             },
//             {
//               os: 'macos-12',
//               arch: 'arm64',
//               node: 18,
//               target_platform: 'darwin',
//             },
//             {
//               os: 'macos-12',
//               arch: 'arm64',
//               node: 20,
//               target_platform: 'darwin',
//             },
//             {
//               os: 'windows-2022',
//               node: 16,
//               arch: 'x64',
//             },
//             {
//               os: 'windows-2022',
//               node: 18,
//               arch: 'x64',
//             },
//             {
//               os: 'windows-2022',
//               node: 20,
//               arch: 'x64',
//             },
//           ],
//         },
//       },
//       steps: [
//         {
//           name: 'Setup (alpine)',
//           if: "contains(matrix.container, 'alpine')",
//           run: 'apk add --no-cache build-base git g++ make curl python3\nln -sf python3 /usr/bin/python\n',
//         },
//         {
//           name: 'Check out current commit (${{ needs.job_get_metadata.outputs.commit_label }})',
//           uses: 'actions/checkout@v4',
//           with: {
//             ref: '${{ env.HEAD_COMMIT }}',
//           },
//         },
//         {
//           name: 'Restore dependency cache',
//           uses: 'actions/cache/restore@v4',
//           id: 'restore-dependencies',
//           with: {
//             path: '${{ env.CACHED_DEPENDENCY_PATHS }}',
//             key: '${{ needs.job_install_deps.outputs.dependency_cache_key }}',
//             enableCrossOsArchive: true,
//           },
//         },
//         {
//           name: 'Restore build cache',
//           uses: 'actions/cache/restore@v4',
//           id: 'restore-build',
//           with: {
//             path: '${{ env.CACHED_BUILD_PATHS }}',
//             key: '${{ needs.job_build.outputs.dependency_cache_key }}',
//             enableCrossOsArchive: true,
//           },
//         },
//         {
//           name: 'Configure safe directory',
//           run: 'git config --global --add safe.directory "*"\n',
//         },
//         {
//           name: 'Install yarn',
//           run: 'npm i -g yarn@1.22.19 --force',
//         },
//         {
//           name: 'Increase yarn network timeout on Windows',
//           if: "contains(matrix.os, 'windows')",
//           run: 'yarn config set network-timeout 600000 -g',
//         },
//         {
//           name: 'Setup python',
//           uses: 'actions/setup-python@v5',
//           if: "${{ !contains(matrix.container, 'alpine') }}",
//           id: 'python-setup',
//           with: {
//             'python-version': '3.8.10',
//           },
//         },
//         {
//           name: 'Setup Node',
//           uses: 'actions/setup-node@v4',
//           with: {
//             'node-version': '${{ matrix.node }}',
//           },
//         },
//         {
//           name: 'Install Dependencies',
//           if: "steps.restore-dependencies.outputs.cache-hit != 'true'",
//           run: 'yarn install --frozen-lockfile --ignore-engines --ignore-scripts',
//         },
//         {
//           name: "Setup (arm64| ${{ contains(matrix.container, 'alpine') && 'musl' || 'glibc'  }})",
//           if: "matrix.arch == 'arm64' && !contains(matrix.container, 'alpine') && matrix.target_platform != 'darwin'",
//           run: 'sudo apt-get update\nsudo apt install -y gcc-aarch64-linux-gnu g++-aarch64-linux-gnu\n',
//         },
//         {
//           name: 'Setup Musl',
//           if: "contains(matrix.container, 'alpine')",
//           run: 'cd packages/profiling-node\ncurl -OL https://musl.cc/aarch64-linux-musl-cross.tgz\ntar -xzvf aarch64-linux-musl-cross.tgz\n$(pwd)/aarch64-linux-musl-cross/bin/aarch64-linux-musl-gcc --version\n',
//         },
//         {
//           name: 'Configure node-gyp',
//           if: "matrix.arch != 'arm64'",
//           run: 'cd packages/profiling-node\nyarn build:bindings:configure\n',
//         },
//         {
//           name: "Configure node-gyp (arm64, ${{ contains(matrix.container, 'alpine') && 'musl' || 'glibc'  }})",
//           if: "matrix.arch == 'arm64' && matrix.target_platform != 'darwin'",
//           run: 'cd packages/profiling-node\nyarn build:bindings:configure:arm64\n',
//         },
//         {
//           name: 'Configure node-gyp (arm64, darwin)',
//           if: "matrix.arch == 'arm64' && matrix.target_platform == 'darwin'",
//           run: 'cd packages/profiling-node\nyarn build:bindings:configure:arm64\n',
//         },
//         {
//           name: 'Build Bindings',
//           if: "matrix.arch != 'arm64'",
//           run: 'yarn lerna run build:bindings --scope @sentry/profiling-node\n',
//         },
//         {
//           name: "Build Bindings (arm64, ${{ contains(matrix.container, 'alpine') && 'musl' || 'glibc'  }})",
//           if: "matrix.arch == 'arm64' && contains(matrix.container, 'alpine') && matrix.target_platform != 'darwin'",
//           run: 'cd packages/profiling-node\nCC=$(pwd)/aarch64-linux-musl-cross/bin/aarch64-linux-musl-gcc \\\nCXX=$(pwd)/aarch64-linux-musl-cross/bin/aarch64-linux-musl-g++ \\\nBUILD_ARCH=arm64 \\\nyarn build:bindings\n',
//         },
//         {
//           name: "Build Bindings (arm64, ${{ contains(matrix.container, 'alpine') && 'musl' || 'glibc'  }})",
//           if: "matrix.arch == 'arm64' && !contains(matrix.container, 'alpine') && matrix.target_platform != 'darwin'",
//           run: 'cd packages/profiling-node\nCC=aarch64-linux-gnu-gcc \\\nCXX=aarch64-linux-gnu-g++ \\\nBUILD_ARCH=arm64 \\\nyarn build:bindings:arm64\n',
//         },
//         {
//           name: 'Build Bindings (arm64, darwin)',
//           if: "matrix.arch == 'arm64' && matrix.target_platform == 'darwin'",
//           run: 'cd packages/profiling-node\nBUILD_PLATFORM=darwin \\\nBUILD_ARCH=arm64 \\\nyarn build:bindings:arm64\n',
//         },
//         {
//           name: 'Build Monorepo',
//           if: "steps.restore-build.outputs.cache-hit != 'true'",
//           run: 'yarn build --scope @sentry/profiling-node',
//         },
//         {
//           name: 'Test Bindings',
//           if: "matrix.arch != 'arm64'",
//           run: 'yarn lerna run test --scope @sentry/profiling-node\n',
//         },
//         {
//           name: 'Archive Binary',
//           uses: 'actions/upload-artifact@v3',
//           with: {
//             name: 'profiling-node-binaries-${{ github.sha }}',
//             path: '${{ github.workspace }}/packages/profiling-node/lib/*.node\n',
//           },
//         },
//       ],
//     },
//   },
// };
