import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useToaster } from './useToaster';
import { toast as notify } from 'sonner';
import { ToastMessage } from 'remix-toast';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useToaster', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call notify.success for success toast', () => {
    const toast: ToastMessage = { type: 'success', message: 'Success!' };
    renderHook(() => useToaster(toast));
    expect(notify.success).toHaveBeenCalledWith('Success!', expect.any(Object));
  });

  it('should call notify.info for info toast', () => {
    const toast: ToastMessage = { type: 'info', message: 'Info!' };
    renderHook(() => useToaster(toast));
    expect(notify.info).toHaveBeenCalledWith('Info!', expect.any(Object));
  });

  it('should call notify.warning for warning toast', () => {
    const toast: ToastMessage = { type: 'warning', message: 'Warning!' };
    renderHook(() => useToaster(toast));
    expect(notify.warning).toHaveBeenCalledWith('Warning!', expect.any(Object));
  });

  it('should call notify.error for error toast', () => {
    const toast: ToastMessage = { type: 'error', message: 'Error!' };
    renderHook(() => useToaster(toast));
    expect(notify.error).toHaveBeenCalledWith('Error!', expect.any(Object));
  });

  it('should not call any notification if toast is undefined', () => {
    renderHook(() => useToaster(undefined));
    expect(notify.success).not.toHaveBeenCalled();
    expect(notify.info).not.toHaveBeenCalled();
    expect(notify.warning).not.toHaveBeenCalled();
    expect(notify.error).not.toHaveBeenCalled();
  });
  
  it('should not call any notification for unknown type', () => {
    const toast: ToastMessage = { type: 'unknown', message: 'Unknown!' };
    renderHook(() => useToaster(toast));
    expect(notify.success).not.toHaveBeenCalled();
    expect(notify.info).not.toHaveBeenCalled();
    expect(notify.warning).not.toHaveBeenCalled();
    expect(notify.error).not.toHaveBeenCalled();
  });
});