import { loader } from './auth.$userId._index';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@remix-run/cloudflare', async () => {
    const original = await vi.importActual('@remix-run/cloudflare');
    return {
        ...original,
        redirect: vi.fn((url) => new Response(null, { status: 302, headers: { Location: url }})),
    }
});

describe('auth.$userId._index loader', () => {
  it('should redirect to setting page', () => {
    const params = { userId: 'test-user' };
    const response = loader({ request: new Request("http://test.com"), params, context: {} } as any);
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('/auth/test-user/setting');
  });

  it('should throw if userId is missing', () => {
    const params = {};
    expect(() => loader({ request: new Request("http://test.com"), params, context: {} } as any)).toThrow('Missing userId param');
  });
});