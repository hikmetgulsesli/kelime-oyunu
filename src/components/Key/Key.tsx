import { TileState } from '../../types';

interface KeyProps {
  letter: string;
  state?: TileState;
  isWide?: boolean;
  onClick: () => void;
  isActive?: boolean;
}

// State-based styling - declarative lookup
const stateClasses: Record<TileState, string> = {
  'correct': 'bg-primary text-on-primary',
  'present': 'bg-secondary text-on-secondary',
  'absent': 'bg-surface-variant text-on-surface-variant',
  'filled': 'bg-surface-container-highest text-on-surface border border-outline-variant',
  'empty': 'bg-surface-container-highest text-on-surface',
};

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

  // Active state animation
  const activeClasses = isActive ? 'scale-90 brightness-110' : '';

  // Display text for special keys
  const displayText = letter === 'ENTER' ? 'GÖNDER' 
    : letter === 'BACKSPACE' ? '⌫' 
    : letter;

  // Accessible label for special keys
  const ariaLabel = letter === 'ENTER' ? 'Gönder' 
    : letter === 'BACKSPACE' ? 'Sil' 
    : undefined;

  return (
    <button
      className={`${baseClasses} ${widthClasses} ${stateClasses[state]} ${activeClasses}`}
      onClick={onClick}
      data-testid="key"
      data-key={letter}
      data-state={state}
      type="button"
      aria-label={ariaLabel}
    >
      {displayText}
    </button>
  );
}