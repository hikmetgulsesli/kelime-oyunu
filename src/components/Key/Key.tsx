import { TileState } from '../../types';

interface KeyProps {
  letter: string;
  state?: TileState;
  isWide?: boolean;
  onClick: () => void;
  isActive?: boolean;
}

/**
 * Key component - Individual keyboard key
 * 
 * Features:
 * - Displays a single letter or special key (ENTER, BACKSPACE)
 * - Shows color state based on game progress (correct, present, absent)
 * - Supports wide keys for ENTER and BACKSPACE
 * - Shows active animation when pressed
 * 
 * Turkish characters: Ç, Ş, Ğ, Ü, Ö, İ, I
 */
export function Key({ 
  letter, 
  state = 'empty', 
  isWide = false, 
  onClick,
  isActive = false 
}: KeyProps) {
  // Base classes for all keys
  const baseClasses = [
    'flex items-center justify-center',
    'h-14 rounded-sm font-bold text-sm',
    'transition-all duration-100 ease-out',
    'select-none cursor-pointer',
    'hover:opacity-90 active:scale-95',
  ].join(' ');

  // Width classes
  const widthClasses = isWide 
    ? 'flex-1 min-w-[3.5rem] px-2' 
    : 'w-8 sm:w-10';

  // State-based styling
  const getStateClasses = (): string => {
    switch (state) {
      case 'correct':
        return 'bg-primary text-on-primary';
      case 'present':
        return 'bg-secondary text-on-secondary';
      case 'absent':
        return 'bg-surface-variant text-on-surface-variant';
      case 'filled':
        return 'bg-surface-container-highest text-on-surface border border-outline-variant';
      default:
        return 'bg-surface-container-highest text-on-surface';
    }
  };

  // Active state animation
  const activeClasses = isActive ? 'scale-90 brightness-110' : '';

  // Display text for special keys
  const displayText = letter === 'ENTER' ? 'GÖNDER' 
    : letter === 'BACKSPACE' ? '⌫' 
    : letter;

  return (
    <button
      className={`${baseClasses} ${widthClasses} ${getStateClasses()} ${activeClasses}`}
      onClick={onClick}
      data-testid="key"
      data-key={letter}
      data-state={state}
      type="button"
    >
      {displayText}
    </button>
  );
}
