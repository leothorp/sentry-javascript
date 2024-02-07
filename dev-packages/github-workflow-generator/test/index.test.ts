import { workflow } from '../src';

import { stringify } from 'yaml';

describe('workflow', () => {
  it('should generate a workflow', () => {
    expect(stringify(workflow)).toMatchSnapshot();
  });
});
