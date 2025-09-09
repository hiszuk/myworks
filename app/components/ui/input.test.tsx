import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input aria-label="test-input" />);
    expect(screen.getByLabelText('test-input')).toBeInTheDocument();
  });
});