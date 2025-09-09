import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppAlertDialog } from './AlertDialog';

describe('AppAlertDialog', () => {
  it('renders with default props', () => {
    const handleClose = vi.fn();
    render(<AppAlertDialog onClose={handleClose} />);
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('CANCEL')).toBeInTheDocument();
  });

  it('renders with custom title, message and labels', () => {
    const handleClose = vi.fn();
    render(
      <AppAlertDialog
        title="Test Title"
        message="Test Message"
        okLabel="Accept"
        cancelLabel="Decline"
        onClose={handleClose}
      />
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByText('Decline')).toBeInTheDocument();
  });

  it('calls onClose with "ok" when OK button is clicked', () => {
    const handleClose = vi.fn();
    render(<AppAlertDialog onClose={handleClose} okLabel="OK" />);
    fireEvent.click(screen.getByText('OK'));
    expect(handleClose).toHaveBeenCalledWith('ok');
  });

  it('calls onClose with "cancel" when Cancel button is clicked', () => {
    const handleClose = vi.fn();
    render(<AppAlertDialog onClose={handleClose} cancelLabel="Cancel" />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleClose).toHaveBeenCalledWith('cancel');
  });

  it('renders success variant', () => {
    const handleClose = vi.fn();
    render(<AppAlertDialog onClose={handleClose} variant="success" title="Success" />);
    expect(screen.getByText('Success')).toHaveClass('text-green-500');
  });
});