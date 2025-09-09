import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContactPage from './$userId.contact';

vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    useLoaderData: () => ({
      user: { userId: 'test', displayName: 'Test User', email: 'test@test.com', contactMail: 'contact@test.com' },
    }),
    useRouteLoaderData: (routeId: string) => {
        if (routeId === 'root') {
            return { user: { id: '1', userId: 'test' } };
        }
        return {};
    },
    useActionData: () => undefined,
    useNavigation: () => ({ state: 'idle' }),
    Form: ({ children, ...props }: { children: React.ReactNode }) => <form {...props}>{children}</form>,
    Link: ({ children, to }: { children: React.ReactNode, to: string }) => <a href={to}>{children}</a>,
  };
});

vi.mock('@conform-to/react', () => ({
    useForm: () => [
        {}, // form
        { // fields
            name: { id: 'name', errors: undefined, name: 'name' },
            email_address: { id: 'email_address', errors: undefined, name: 'email_address' },
            detail: { id: 'detail', errors: undefined, name: 'detail' },
            userid: { id: 'userid', name: 'userid' },
            usermail: { id: 'usermail', name: 'usermail' },
            username: { id: 'username', name: 'username' },
        }
    ],
    getFormProps: () => ({}),
    getInputProps: (field: any, options: any) => ({ id: field.id, type: options?.type, name: field.name }),
    getTextareaProps: (field: any) => ({ id: field.id, name: field.name }),
}));

describe('ContactPage', () => {
  it('renders the contact form', () => {
    render(<ContactPage />);
    expect(screen.getByRole('heading', { name: /Contact \/ お問い合わせ/i })).toBeInTheDocument();
    expect(screen.getByLabelText('名前')).toBeInTheDocument();
    expect(screen.getByLabelText('メール')).toBeInTheDocument();
    expect(screen.getByLabelText('お問い合わせ内容')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '送信する' })).toBeInTheDocument();
  });
});