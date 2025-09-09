import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Toaster } from './AppToaster';

describe('AppToaster', () => {
  it('renders without crashing', () => {
    render(<Toaster />);
  });
});
