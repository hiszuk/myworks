import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Logo from './Logo';

describe('Logo component', () => {
  it('renders the logo text', () => {
    render(<Logo />);
    expect(screen.getByText('MY WORKS')).toBeInTheDocument();
  });
});
