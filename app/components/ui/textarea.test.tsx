import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('renders a textarea element', () => {
    render(<Textarea aria-label="test-textarea" />);
    expect(screen.getByLabelText('test-textarea')).toBeInTheDocument();
  });
});