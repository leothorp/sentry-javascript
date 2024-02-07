import type { NormalJob } from '../schema/types';
import { getActionCheckoutStep } from './steps/action-checkout';
import { getPathsFilterStep } from './steps/paths-filter';
import { generateMultilineString } from './utils';

export const getMetadataJob: NormalJob = {
  name: 'Get Metadata',
  'runs-on': 'ubuntu-20.04',
  permissions: {
    'pull-requests': 'read',
  },
  steps: [
    // We need to check out not only the fake merge commit between the PR and the base branch which GH creates, but
    // also its parents, so that we can pull the commit message from the head commit of the PR
    getActionCheckoutStep({ fetchDepth: 2 }),
    {
      name: 'Get metadata',
      id: 'get_metadata',
      run: generateMultilineString([
        'COMMIT_SHA=$(git rev-parse --short ${{ github.event.pull_request.head.sha || github.event.head_commit.id || env.HEAD_COMMIT }})',
        'echo "COMMIT_SHA=$COMMIT_SHA" >> $GITHUB_ENV',
        'echo "COMMIT_MESSAGE=$(git log -n 1 --pretty=format:%s $COMMIT_SHA)" >> $GITHUB_ENV',
      ]),
    },
    getPathsFilterStep({
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
      },
    }),
    {
      name: 'Determine changed packages',
      uses: 'dorny/paths-filter@v3.0.0',
      id: 'changed',
      with: {
        filters:
          "workflow: &workflow\n  - '.github/**'\nshared: &shared\n  - *workflow\n  - '*.{js,ts,json,yml,lock}'\n  - 'CHANGELOG.md'\n  - 'jest/**'\n  - 'scripts/**'\n  - 'packages/core/**'\n  - 'packages/rollup-utils/**'\n  - 'packages/tracing/**'\n  - 'packages/tracing-internal/**'\n  - 'packages/utils/**'\n  - 'packages/types/**'\n  - 'packages/integrations/**'\nbrowser: &browser\n  - *shared\n  - 'packages/browser/**'\n  - 'packages/replay/**'\n  - 'packages/replay-canvas/**'\n  - 'packages/feedback/**'\n  - 'packages/wasm/**'\nbrowser_integration:\n  - *shared\n  - *browser\n  - 'dev-packages/browser-integration-tests/**'\nember:\n  - *shared\n  - *browser\n  - 'packages/ember/**'\nnode:\n  - *shared\n  - 'packages/node/**'\n  - 'packages/node-experimental/**'\n  - 'dev-packages/node-integration-tests/**'\nnextjs:\n  - *shared\n  - *browser\n  - 'packages/nextjs/**'\n  - 'packages/node/**'\n  - 'packages/react/**'\nremix:\n  - *shared\n  - *browser\n  - 'packages/remix/**'\n  - 'packages/node/**'\n  - 'packages/react/**'\nprofiling_node:\n  - *shared\n  - 'packages/node/**'\n  - 'packages/node-experimental/**'\n  - 'packages/profiling-node/**'\n  - 'dev-packages/e2e-tests/test-applications/node-profiling/**'\nprofiling_node_bindings:\n  - *workflow\n  - 'packages/profiling-node/**'\n  - 'dev-packages/e2e-tests/test-applications/node-profiling/**'\ndeno:\n  - *shared\n  - *browser\n  - 'packages/deno/**'\nany_code:\n  - '!**/*.md'\n",
      },
    },
    {
      name: 'Get PR labels',
      id: 'pr-labels',
      uses: 'mydea/pr-labels-action@fn/bump-node20',
    },
  ],
  outputs: {
    commit_label: '${{ env.COMMIT_SHA }}: ${{ env.COMMIT_MESSAGE }}',
    changed_nextjs: '${{ steps.changed.outputs.nextjs }}',
    changed_ember: '${{ steps.changed.outputs.ember }}',
    changed_remix: '${{ steps.changed.outputs.remix }}',
    changed_node: '${{ steps.changed.outputs.node }}',
    changed_profiling_node: '${{ steps.changed.outputs.profiling_node }}',
    changed_profiling_node_bindings: '${{ steps.changed.outputs.profiling_node_bindings }}',
    changed_deno: '${{ steps.changed.outputs.deno }}',
    changed_browser: '${{ steps.changed.outputs.browser }}',
    changed_browser_integration: '${{ steps.changed.outputs.browser_integration }}',
    changed_any_code: '${{ steps.changed.outputs.any_code }}',
    is_develop: "${{ github.ref == 'refs/heads/develop' }}",
    is_release: "${{ startsWith(github.ref, 'refs/heads/release/') }}",
    is_gitflow_sync: "${{ github.head_ref == 'master' || github.ref == 'refs/heads/master' }}",
    has_gitflow_label:
      "${{ github.event_name == 'pull_request' && contains(steps.pr-labels.outputs.labels, ' Gitflow ') }}",
    force_skip_cache:
      "${{ github.event_name == 'schedule' || (github.event_name == 'pull_request' && contains(steps.pr-labels.outputs.labels, ' ci-skip-cache ')) }}",
  },
};
