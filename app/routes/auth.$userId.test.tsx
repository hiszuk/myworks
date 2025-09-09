import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthUserIdPage from './auth.$userId';
import { useLoginStatus } from '~/hooks/useLoginStatus';
import { useLoaderData } from '@remix-run/react';

vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    Outlet: ({context}: {context: any}) => <div data-testid="outlet">{context.userId}</div>,
    useLoaderData: vi.fn(),
    useNavigation: () => ({ state: 'idle' }),
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
  };
});

vi.mock('~/hooks/useLoginStatus');

describe('AuthUserIdPage', () => {
  it('renders Outlet when user is authorized', () => {
    (useLoginStatus as vi.Mock).mockReturnValue({
      isLoggedIn: true,
      user: { userId: 'test-user' },
    });
    (useLoaderData as vi.Mock).mockReturnValue({ userId: 'test-user' });

    render(<AuthUserIdPage />);
    const outlet = screen.getByTestId('outlet');
    expect(outlet).toBeInTheDocument();
  });
});