import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useOffsetTop, useThrottle } from './useOffsetTop';

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should throttle the function calls', () => {
    const func = vi.fn();
    const { result } = renderHook(() => useThrottle(func, 100));

    act(() => {
      result.current();
      result.current();
    });

    expect(func).toHaveBeenCalledTimes(0);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(func).toHaveBeenCalledTimes(1);
  });
});

describe('useOffsetTop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should calculate offsetTop on mount and scroll', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');
    const removeEventListener = vi.spyOn(window, 'removeEventListener');

    const ref = {
      current: {
        getBoundingClientRect: vi.fn().mockReturnValue({ top: 50 }),
      } as unknown as HTMLElement,
    };
    
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 100,
    });

    const { result, unmount } = renderHook(() => useOffsetTop(ref));

    act(() => {
        vi.advanceTimersByTime(100);
    });

    expect(ref.current.getBoundingClientRect).toHaveBeenCalled();
    expect(result.current.viewportTop).toBe(50);
    expect(result.current.pageOffsetTop).toBe(150);
    expect(addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});