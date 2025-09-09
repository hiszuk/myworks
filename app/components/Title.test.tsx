import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Title from './Title';

describe('Title', () => {
  it('renders the title', () => {
    render(<Title title="Test Title" />);
    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
  });
});
