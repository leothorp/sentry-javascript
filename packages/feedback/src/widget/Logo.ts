import { WINDOW } from '@sentry/browser';

import type { FeedbackInternalOptions } from '../types';
import { setAttributesNS } from '../util/setAttributesNS';

const XMLNS = 'http://www.w3.org/2000/svg';

interface IconReturn {
  el: SVGElement;
}

type Props = Pick<FeedbackInternalOptions, 'colorScheme'>;

/**
 * Sentry Logo
 */
export function Logo({ colorScheme }: Props): IconReturn {
  const createElementNS = <K extends keyof SVGElementTagNameMap>(tagName: K): SVGElementTagNameMap[K] =>
    WINDOW.document.createElementNS(XMLNS, tagName);
  const svg = setAttributesNS(createElementNS('svg'), {
    class: 'sentry-logo',
    width: '32',
    height: '30',
    viewBox: '0 0 72 66',
    fill: 'none',
  });

  const path = setAttributesNS(createElementNS('path'), {
    transform: 'translate(11, 11)',
    d: 'M29,2.26a4.67,4.67,0,0,0-8,0L14.42,13.53A32.21,32.21,0,0,1,32.17,40.19H27.55A27.68,27.68,0,0,0,12.09,17.47L6,28a15.92,15.92,0,0,1,9.23,12.17H4.62A.76.76,0,0,1,4,39.06l2.94-5a10.74,10.74,0,0,0-3.36-1.9l-2.91,5a4.54,4.54,0,0,0,1.69,6.24A4.66,4.66,0,0,0,4.62,44H19.15a19.4,19.4,0,0,0-8-17.31l2.31-4A23.87,23.87,0,0,1,23.76,44H36.07a35.88,35.88,0,0,0-16.41-31.8l4.67-8a.77.77,0,0,1,1.05-.27c.53.29,20.29,34.77,20.66,35.17a.76.76,0,0,1-.68,1.13H40.6q.09,1.91,0,3.81h4.78A4.59,4.59,0,0,0,50,39.43a4.49,4.49,0,0,0-.62-2.28Z',
  });
  svg.append(path);

  const defs = createElementNS('defs');
  const style = createElementNS('style');

  if (colorScheme === 'system') {
    style.textContent = `
    @media (prefers-color-scheme: dark) {
      path: {
        fill: '#fff';
      }
    }
    `;
  }

  style.textContent = `
    path {
      fill: ${colorScheme === 'dark' ? '#fff' : '#362d59'};
    }`;

  defs.append(style);
  svg.append(defs);

  return {
    get el() {
      return svg;
    },
  };
}
