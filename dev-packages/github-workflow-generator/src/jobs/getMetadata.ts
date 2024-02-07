import type { NormalJob } from '../schema/types';
import { MachineType } from './machines';
import { getActionCheckoutStep } from './steps/action-checkout';
import { getPathsFilterStep } from './steps/paths-filter';
import { generateMultilineString } from './utils';

export const pathFilterStep = getPathsFilterStep({
  filters: {
    workflow: {
      alias: true,
      paths: ['.github/**'],
    },
    shared: {
      alias: true,
      paths: [
        '*workflow',
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
    browser: {
      alias: true,
      paths: [
        '*shared',
        'packages/browser/**',
        'packages/replay/**',
        'packages/replay-canvas/**',
        'packages/feedback/**',
        'packages/wasm/**',
      ],
    },
    browser_integration: {
      paths: ['*shared', '*browser', 'dev-packages/browser-integration-tests/**'],
    },
    ember: {
      paths: ['*shared', '*browser', 'packages/ember/**'],
    },
    node: {
      paths: ['*shared', 'packages/node/**', 'packages/node-experimental/**', 'dev-packages/node-integration-tests/**'],
    },
    nextjs: {
      paths: ['*shared', '*browser', 'packages/nextjs/**', 'packages/node/**', 'packages/react/**'],
    },
    remix: {
      paths: ['*shared', '*browser', 'packages/remix/**', 'packages/node/**', 'packages/react/**'],
    },
    profiling_node: {
      paths: [
        '*shared',
        'packages/node/**',
        'packages/node-experimental/**',
        'packages/profiling-node/**',
        'dev-packages/e2e-tests/test-applications/node-profiling/**',
      ],
    },
    profiling_node_bindings: {
      paths: ['*workflow', 'packages/profiling-node/**', 'dev-packages/e2e-tests/test-applications/node-profiling/**'],
    },
    deno: {
      paths: ['*shared', '*browser', 'packages/deno/**'],
    },
    any_code: {
      paths: ['!**/*.md'],
    },
  },
});

export const getMetadataJob: NormalJob = {
  name: 'Get Metadata',
  'runs-on': MachineType.Ubuntu_20_04,
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
    pathFilterStep,
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
