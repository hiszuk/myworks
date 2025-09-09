import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders the message', () => {
    render(<Spinner message="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
