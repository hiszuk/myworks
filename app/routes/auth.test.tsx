import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthPage from './auth';

vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    Outlet: () => <div data-testid="outlet" />,
  };
});

describe('AuthPage', () => {
  it('renders an Outlet', () => {
    render(<AuthPage />);
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
});