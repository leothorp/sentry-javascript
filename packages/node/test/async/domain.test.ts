/* eslint-disable deprecation/deprecation */
import { Hub, makeMain } from '@sentry/core';
import { getIsolationScope, withIsolationScope } from '@sentry/core';
import { getCurrentHub, runWithAsyncContext, setAsyncContextStrategy } from '@sentry/core';

import { setDomainAsyncContextStrategy } from '../../src/async/domain';

describe('setDomainAsyncContextStrategy()', () => {
  beforeEach(() => {
    const hub = new Hub();
    // eslint-disable-next-line deprecation/deprecation
    makeMain(hub);
  });

  afterEach(() => {
    // clear the strategy
    setAsyncContextStrategy(undefined);
  });

  describe('with withIsolationScope()', () => {
    it('forks the isolation scope (creating a new one)', done => {
      expect.assertions(7);
      setDomainAsyncContextStrategy();

      const topLevelIsolationScope = getIsolationScope();
      topLevelIsolationScope.setTag('val1', true);

      withIsolationScope(isolationScope1 => {
        expect(isolationScope1).not.toBe(topLevelIsolationScope);
        expect(isolationScope1.getScopeData().tags['val1']).toBe(true);
        isolationScope1.setTag('val2', true);
        topLevelIsolationScope.setTag('val3', true);

        withIsolationScope(isolationScope2 => {
          expect(isolationScope2).not.toBe(isolationScope1);
          expect(isolationScope2).not.toBe(topLevelIsolationScope);
          expect(isolationScope2.getScopeData().tags['val1']).toBe(true);
          expect(isolationScope2.getScopeData().tags['val2']).toBe(true);
          expect(isolationScope2.getScopeData().tags['val3']).toBeUndefined();

          done();
        });
      });
    });

    it('correctly keeps track of isolation scope across asynchronous operations', done => {
      expect.assertions(7);
      setDomainAsyncContextStrategy();

      const topLevelIsolationScope = getIsolationScope();
      expect(getIsolationScope()).toBe(topLevelIsolationScope);

      withIsolationScope(isolationScope1 => {
        setTimeout(() => {
          expect(getIsolationScope()).toBe(isolationScope1);

          withIsolationScope(isolationScope2 => {
            setTimeout(() => {
              expect(getIsolationScope()).toBe(isolationScope2);
            }, 100);
          });

          setTimeout(() => {
            expect(getIsolationScope()).toBe(isolationScope1);
            done();
          }, 200);

          expect(getIsolationScope()).toBe(isolationScope1);
        }, 100);
      });

      setTimeout(() => {
        expect(getIsolationScope()).toBe(topLevelIsolationScope);
      }, 200);

      expect(getIsolationScope()).toBe(topLevelIsolationScope);
    });
  });

  describe('with runWithAsyncContext()', () => {
    test('hub scope inheritance', () => {
      setDomainAsyncContextStrategy();

      const globalHub = getCurrentHub();
      // eslint-disable-next-line deprecation/deprecation
      globalHub.setExtra('a', 'b');

      runWithAsyncContext(() => {
        const hub1 = getCurrentHub();
        expect(hub1).toEqual(globalHub);

        // eslint-disable-next-line deprecation/deprecation
        hub1.setExtra('c', 'd');
        expect(hub1).not.toEqual(globalHub);

        runWithAsyncContext(() => {
          const hub2 = getCurrentHub();
          expect(hub2).toEqual(hub1);
          expect(hub2).not.toEqual(globalHub);

          // eslint-disable-next-line deprecation/deprecation
          hub2.setExtra('e', 'f');
          expect(hub2).not.toEqual(hub1);
        });
      });
    });

    test('async hub scope inheritance', async () => {
      setDomainAsyncContextStrategy();

      async function addRandomExtra(hub: Hub, key: string): Promise<void> {
        return new Promise(resolve => {
          setTimeout(() => {
            // eslint-disable-next-line deprecation/deprecation
            hub.setExtra(key, Math.random());
            resolve();
          }, 100);
        });
      }

      const globalHub = getCurrentHub();
      await addRandomExtra(globalHub, 'a');

      await runWithAsyncContext(async () => {
        const hub1 = getCurrentHub();
        expect(hub1).toEqual(globalHub);

        await addRandomExtra(hub1, 'b');
        expect(hub1).not.toEqual(globalHub);

        await runWithAsyncContext(async () => {
          const hub2 = getCurrentHub();
          expect(hub2).toEqual(hub1);
          expect(hub2).not.toEqual(globalHub);

          await addRandomExtra(hub1, 'c');
          expect(hub2).not.toEqual(hub1);
        });
      });
    });

    test('hub single instance', () => {
      setDomainAsyncContextStrategy();

      runWithAsyncContext(() => {
        const hub = getCurrentHub();
        expect(hub).toBe(getCurrentHub());
      });
    });

    test('within a domain not reused', () => {
      setDomainAsyncContextStrategy();

      runWithAsyncContext(() => {
        const hub1 = getCurrentHub();
        runWithAsyncContext(() => {
          const hub2 = getCurrentHub();
          expect(hub1).not.toBe(hub2);
        });
      });
    });

    test('within a domain reused when requested', () => {
      setDomainAsyncContextStrategy();

      runWithAsyncContext(() => {
        const hub1 = getCurrentHub();
        runWithAsyncContext(
          () => {
            const hub2 = getCurrentHub();
            expect(hub1).toBe(hub2);
          },
          { reuseExisting: true },
        );
      });
    });

    test('concurrent hub contexts', done => {
      setDomainAsyncContextStrategy();

      let d1done = false;
      let d2done = false;

      runWithAsyncContext(() => {
        const hub = getCurrentHub();
        // eslint-disable-next-line deprecation/deprecation
        hub.getStack().push({ client: 'process' } as any);
        // eslint-disable-next-line deprecation/deprecation
        expect(hub.getStack()[1]).toEqual({ client: 'process' });
        // Just in case so we don't have to worry which one finishes first
        // (although it always should be d2)
        setTimeout(() => {
          d1done = true;
          if (d2done) {
            done();
          }
        }, 0);
      });

      runWithAsyncContext(() => {
        const hub = getCurrentHub();
        // eslint-disable-next-line deprecation/deprecation
        hub.getStack().push({ client: 'local' } as any);
        // eslint-disable-next-line deprecation/deprecation
        expect(hub.getStack()[1]).toEqual({ client: 'local' });
        setTimeout(() => {
          d2done = true;
          if (d1done) {
            done();
          }
        }, 0);
      });
    });
  });
});
