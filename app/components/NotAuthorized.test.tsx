import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotAuthorized from './NotAuthorized';

vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
  };
});

describe('NotAuthorized', () => {
  it('renders the message and link', () => {
    render(<NotAuthorized />);
    expect(screen.getByText('ユーザー認証・認可されていません')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Homeに戻る/i })).toBeInTheDocument();
  });
});
