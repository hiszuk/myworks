import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundaryComponent } from './ErrorBoundary';

vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    isRouteErrorResponse: (error: any) => error && typeof error.status === 'number',
  };
});

describe('ErrorBoundaryComponent', () => {
  it('renders 404 Not Found', () => {
    const error = { status: 404, statusText: 'Not Found', data: 'some data' };
    render(<ErrorBoundaryComponent error={error} />);
    expect(screen.getByText('ページが見つかりません')).toBeInTheDocument();
  });

  it('renders 400 Bad Request', () => {
    const error = { status: 400, statusText: 'Bad Request', data: 'some data' };
    render(<ErrorBoundaryComponent error={error} />);
    expect(screen.getByText('アプリケーションが正しく動作していません')).toBeInTheDocument();
  });

  it('renders 401 Unauthorized', () => {
    const error = { status: 401, statusText: 'Unauthorized', data: 'some data' };
    render(<ErrorBoundaryComponent error={error} />);
    expect(screen.getByText('ログインしていません')).toBeInTheDocument();
  });

  it('renders 403 Forbidden', () => {
    const error = { status: 403, statusText: 'Forbidden', data: 'some data' };
    render(<ErrorBoundaryComponent error={error} />);
    expect(screen.getByText('閲覧権限がありません')).toBeInTheDocument();
  });

  it('renders 500 Server Error', () => {
    const error = { status: 500, statusText: 'Server Error', data: 'some data' };
    render(<ErrorBoundaryComponent error={error} />);
    expect(screen.getByText('予期しないエラーが発生しました')).toBeInTheDocument();
  });

  it('renders a generic error for other route errors', () => {
    const error = { status: 418, statusText: "I'm a teapot", data: 'some data' };
    render(<ErrorBoundaryComponent error={error} />);
    expect(screen.getByText('予期しないエラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText("418:I'm a teapot")).toBeInTheDocument();
  });

  it('renders an Error object', () => {
    const error = new Error('Test error message');
    error.stack = 'Test stack trace';
    render(<ErrorBoundaryComponent error={error} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByText('Stack Trace: Test stack trace')).toBeInTheDocument();
  });

  it('renders an unknown error', () => {
    render(<ErrorBoundaryComponent error="some string error" />);
    expect(screen.getByText('Unknown Error')).toBeInTheDocument();
  });
});