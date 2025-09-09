import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import * as Svgs from './index';

describe('SVG Components', () => {
  for (const [name, SvgComponent] of Object.entries(Svgs)) {
    if (typeof SvgComponent === 'function') {
      it(`renders ${name} without crashing`, () => {
        render(<SvgComponent />);
      });
    }
  }
});