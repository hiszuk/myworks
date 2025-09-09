import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLoginStatus } from './useLoginStatus';
import { useRouteLoaderData } from '@remix-run/react';

vi.mock('@remix-run/react', async () => {
  const original = await vi.importActual('@remix-run/react');
  return {
    ...original,
    useRouteLoaderData: vi.fn(),
  };
});

describe('useLoginStatus', () => {
  it('should return isLoggedIn=true and user object when user is logged in', () => {
    const mockUser = { id: '123', name: 'Test User' };
    (useRouteLoaderData as vi.Mock).mockReturnValue({ user: mockUser });

    const { result } = renderHook(() => useLoginStatus());

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should return isLoggedIn=false and undefined user when user is not logged in (user is null)', () => {
    (useRouteLoaderData as vi.Mock).mockReturnValue({ user: null });

    const { result } = renderHook(() => useLoginStatus());

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeUndefined();
  });
  
  it('should return isLoggedIn=false and undefined user when user property is missing', () => {
    (useRouteLoaderData as vi.Mock).mockReturnValue({});

    const { result } = renderHook(() => useLoginStatus());

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeUndefined();
  });

  it('should return isLoggedIn=false and undefined user when data is undefined', () => {
    (useRouteLoaderData as vi.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useLoginStatus());

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toBeUndefined();
  });
  
  it('should return isLoggedIn=false if user object has no id', () => {
    const mockUser = { name: 'Test User' }; // No id property
    (useRouteLoaderData as vi.Mock).mockReturnValue({ user: mockUser });

    const { result } = renderHook(() => useLoginStatus());

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });
});