import type { Workflow } from './schema/types';

export const env = {
  HEAD_COMMIT: '${{ github.event.inputs.commit || github.sha }}',
  CACHED_DEPENDENCY_PATHS:
    '${{ github.workspace }}/node_modules\n${{ github.workspace }}/packages/*/node_modules\n${{ github.workspace }}/dev-packages/*/node_modules\n~/.cache/ms-playwright/\n~/.cache/mongodb-binaries/\n',
  CACHED_BUILD_PATHS:
    '${{ github.workspace }}/dev-packages/*/build\n${{ github.workspace }}/packages/*/build\n${{ github.workspace }}/packages/ember/*.d.ts\n${{ github.workspace }}/packages/gatsby/*.d.ts\n${{ github.workspace }}/packages/core/src/version.ts\n${{ github.workspace }}/packages/serverless\n${{ github.workspace }}/packages/utils/cjs\n${{ github.workspace }}/packages/utils/esm\n',
  BUILD_CACHE_KEY: '${{ github.event.inputs.commit || github.sha }}',
  BUILD_PROFILING_NODE_CACHE_TARBALL_KEY: 'profiling-node-tarball-${{ github.event.inputs.commit || github.sha }}',
  NX_CACHE_RESTORE_KEYS:
    'nx-Linux-${{ github.ref }}-${{ github.event.inputs.commit || github.sha }}\nnx-Linux-${{ github.ref }}\nnx-Linux\n',
} satisfies Workflow['env'];
