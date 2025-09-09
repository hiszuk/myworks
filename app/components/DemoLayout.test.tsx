import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Layout as DemoLayout } from './DemoLayout';

vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
    useNavigation: () => ({ state: 'idle' }),
  };
});

describe('DemoLayout', () => {
  it('renders the layout with children', () => {
    render(<DemoLayout><div>Demo Child</div></DemoLayout>);
    expect(screen.getByText('Demo Child')).toBeInTheDocument();
    expect(screen.getByText('MY WORKS')).toBeInTheDocument();
    expect(screen.getByText('確認')).toBeInTheDocument();
    expect(screen.getByText('編集')).toBeInTheDocument();
    expect(screen.getByText('設定')).toBeInTheDocument();
  });
});