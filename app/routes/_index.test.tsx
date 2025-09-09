import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Index from './_index';

// Mock hooks from remix
vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    useLoaderData: () => ({
      data: [
        {
          id: 1,
          userId: 'test-user',
          displayName: 'Test User',
          avatar: 'avatar.png',
          img: 'profile.png',
          twitter: 'testuser',
          paragraphOne: 'p1',
          paragraphTwo: 'p2',
          paragraphThree: 'p3',
          projectId: 1,
          projectImage: 'project.png',
          projectTitle: 'Test Project',
          projectDate: '2024-01-01',
          description: 'Test Description',
          porjectUrl: 'http://example.com',
          repository: 'http://github.com',
          publish: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ],
    }),
    useNavigation: () => ({ state: 'idle' }),
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    }),
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
  };
});

// Mock the useLoginStatus hook
vi.mock('~/hooks/useLoginStatus', () => ({
  useLoginStatus: () => ({
    user: null,
    isLoggedIn: false,
  }),
}));

describe('Index page', () => {
  it('renders the main heading', () => {
    render(<Index />);
    expect(screen.getByRole('heading', { name: /MY WORKS/i, level: 1 })).toBeInTheDocument();
  });
});