import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignupPage from './signup';

vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    useLoaderData: () => ({ isTemporaryRegistered: false }),
    useRouteLoaderData: (routeId: string) => {
        if (routeId === 'root') {
            return { user: null }; // Not logged in for signup page
        }
        return {};
    },
    useActionData: () => undefined,
    useNavigation: () => ({ state: 'idle' }),
    Form: ({ children, ...props }: { children: React.ReactNode }) => <form {...props}>{children}</form>,
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
  };
});

describe('SignupPage', () => {
  it('renders signup form when not temporarily registered', () => {
    render(<SignupPage />);
    expect(screen.getByRole('heading', { name: 'ユーザー登録' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /googleアカウントでユーザー登録する/i })).toBeInTheDocument();
  });
});