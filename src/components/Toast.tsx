import { useEffect, useState, useRef } from 'react';

export type ToastType = 'error' | 'success' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', isVisible, onClose }: ToastProps) {
  const [isFading, setIsFading] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // Clear any existing timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (isVisible) {
      // Use a microtask to avoid synchronous setState during render
      const initTimer = setTimeout(() => {
        setIsFading(false);
      }, 0);
      timersRef.current.push(initTimer);

      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, 1700);
      timersRef.current.push(fadeTimer);

      const closeTimer = setTimeout(() => {
        onClose?.();
      }, 2000);
      timersRef.current.push(closeTimer);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const typeClasses = {
    error: 'bg-surface-container-high text-on-surface border border-error/30',
    success: 'bg-primary text-on-primary',
    info: 'bg-surface-container-high text-on-surface border border-outline/30',
  };

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-lg shadow-lg font-bold text-sm tracking-wide transition-opacity duration-300 ${
        isFading ? 'opacity-0' : 'opacity-100'
      } ${typeClasses[type]}`}
      role="alert"
      aria-live="polite"
      data-testid="toast"
    >
      {message}
    </div>
  );
}
