import type { JobStep } from '../types';

/**
 * Generates a `run` string from an array of commands.
 *
 * https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepsrun
 */
export function generateMultilineString(commands: string[]): string {
  return commands.join('\n');
}
