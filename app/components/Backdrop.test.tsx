import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BackDrop } from './Backdrop';

describe('BackDrop', () => {
  it('renders its children', () => {
    render(<BackDrop><div>Child</div></BackDrop>);
    expect(screen.getByText('Child')).toBeInTheDocument();
  });
});
