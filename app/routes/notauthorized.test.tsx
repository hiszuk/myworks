import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotAuthorizedPage from './notauthorized';

vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
  };
});

describe('NotAuthorizedPage', () => {
  it('renders the not authorized message', () => {
    render(<NotAuthorizedPage />);
    expect(screen.getByText('ユーザー認証・認可されていません')).toBeInTheDocument();
  });
});