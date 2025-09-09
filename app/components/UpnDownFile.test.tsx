import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UploadFile, DeleteFile } from './UpnDownFile';

const submit = vi.fn();

vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    useSubmit: () => submit,
    useLocation: () => ({ key: 'test' }),
    Form: ({ children, ...props }: { children: React.ReactNode }) => <form {...props}>{children}</form>,
  };
});

describe('UpnDownFile', () => {
  describe('UploadFile', () => {
    it('renders the upload button', () => {
      render(<UploadFile userid="testuser" path="test/path" />);
      expect(screen.getByText('アップロード')).toBeInTheDocument();
    });
  });

  describe('DeleteFile', () => {
    it('renders the delete button', () => {
      render(<DeleteFile userid="testuser" path="test/path" />);
      expect(screen.getByText('イメージ削除')).toBeInTheDocument();
    });
  });
});