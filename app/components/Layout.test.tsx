import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Layout } from './Layout';
import { useLoginStatus } from '~/hooks/useLoginStatus';

vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
    useNavigation: () => ({ state: 'idle' }),
  };
});

vi.mock('~/hooks/useLoginStatus', () => ({
  useLoginStatus: vi.fn(),
}));

describe('Layout', () => {
  it('renders for a logged in user', () => {
    (useLoginStatus as vi.Mock).mockReturnValue({
        isLoggedIn: true,
        user: { userId: 'testuser', avatar: 'test.png', twitter: 'testtwitter' },
    });
    render(<Layout><div>Child Content</div></Layout>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
    expect(screen.getByText('確認')).toBeInTheDocument();
    expect(screen.getByText('編集')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });

  it('renders for a logged out user', () => {
    (useLoginStatus as vi.Mock).mockReturnValue({
        isLoggedIn: false,
        user: null,
    });
    render(<Layout><div>Child Content</div></Layout>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
    expect(screen.getByText('ユーザー登録')).toBeInTheDocument();
    expect(screen.getByText('ログイン')).toBeInTheDocument();
  });
});