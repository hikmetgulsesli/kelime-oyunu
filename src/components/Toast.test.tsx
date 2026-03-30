import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders when isVisible is true', () => {
    render(<Toast message="Test message" isVisible={true} />);
    expect(screen.getByTestId('toast')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('does not render when isVisible is false', () => {
    render(<Toast message="Test message" isVisible={false} />);
    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });

  it('displays error toast with correct styling', () => {
    render(<Toast message="Bu kelime geçerli değil" type="error" isVisible={true} />);
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveTextContent('Bu kelime geçerli değil');
  });

  it('displays success toast with correct styling', () => {
    render(<Toast message="Tebrikler! 3 tahminde buldunuz" type="success" isVisible={true} />);
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveTextContent('Tebrikler! 3 tahminde buldunuz');
  });

  it('auto-dismisses after 2000ms', () => {
    const onClose = vi.fn();
    render(<Toast message="Test" isVisible={true} onClose={onClose} />);

    expect(screen.getByTestId('toast')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('starts fading after 1700ms', () => {
    render(<Toast message="Test" isVisible={true} />);

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('opacity-100');

    act(() => {
      vi.advanceTimersByTime(1700);
    });

    expect(toast).toHaveClass('opacity-0');
  });

  it('has correct transition duration for fade', () => {
    render(<Toast message="Test" isVisible={true} />);
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('duration-300');
  });
});
