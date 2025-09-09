import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Default Badge</Badge>);
    expect(screen.getByText('Default Badge')).toBeInTheDocument();
  });

  it('renders with success variant', () => {
    render(<Badge variant="success">Success Badge</Badge>);
    expect(screen.getByText('Success Badge')).toHaveClass('bg-green-500');
  });
});