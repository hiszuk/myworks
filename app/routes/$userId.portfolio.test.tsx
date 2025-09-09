import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PortfolioPage from './$userId.portfolio';

vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    useLoaderData: () => ({
      user: { displayName: 'Test User', title: 'Title', name: 'Name', subtitle: 'Sub', paragraphOne: 'p1' },
      setting: { openLabel: 'Go', contactMessage: 'Contact me', contactLabel: 'Send' },
      projects: [],
      custom: null,
    }),
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
  };
});

vi.mock('~/hooks/useLoginStatus', () => ({
  useLoginStatus: () => ({ isLoggedIn: false }),
}));

vi.mock('~/hooks/useOffsetTop', () => ({
  useOffsetTop: () => ({ viewportTop: 100 }),
}));

describe('PortfolioPage', () => {
  it('renders the portfolio page sections', () => {
    render(<PortfolioPage />);
    expect(screen.getByText('ABOUT')).toBeInTheDocument();
    expect(screen.getByText('PROJECTS')).toBeInTheDocument();
    expect(screen.getByText('CONTACT')).toBeInTheDocument();
    expect(screen.getByText('About Me')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});