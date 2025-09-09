import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppTooltip } from './AppTooltip';

describe('AppTooltip', () => {
  it('renders its children', () => {
    render(
      <AppTooltip message="Test Tooltip">
        <span>Child Content</span>
      </AppTooltip>
    );
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});