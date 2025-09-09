import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthIndexPage from './auth._index';
import { useLoginStatus } from '~/hooks/useLoginStatus';

vi.mock('~/hooks/useLoginStatus');

describe('AuthIndexPage', () => {
  it('renders user info when logged in', () => {
    (useLoginStatus as vi.Mock).mockReturnValue({
      isLoggedIn: true,
      user: { displayName: 'Test User', email: 'test@example.com' },
    });
    render(<AuthIndexPage />);
    expect(screen.getByText('user情報')).toBeInTheDocument();
    expect(screen.getByText('name: Test User')).toBeInTheDocument();
    expect(screen.getByText('email: test@example.com')).toBeInTheDocument();
  });
});