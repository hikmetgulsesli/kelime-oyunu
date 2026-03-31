import { TileState } from '../../types';

interface TileProps {
  letter: string;
  state: TileState;
  isFlipping?: boolean;
  isBouncing?: boolean;
  delay?: number;
}

/**
 * Tile component - Individual letter tile in the game grid
 * 
 * States:
 * - empty: Dark border, no letter
 * - filled: Light border with letter
 * - correct: Green background (letter in correct position)
 * - present: Yellow background (letter exists but wrong position)
 * - absent: Gray background (letter not in word)
 */
export function Tile({ letter, state, isFlipping = false, isBouncing = false, delay = 0 }: TileProps) {
  // Base classes for all tiles
  const baseClasses = 'w-14 h-14 flex items-center justify-center text-2xl font-bold rounded-sm transition-all duration-300';
  
  // State-based styling
  const stateClasses = {
    empty: 'bg-surface-container-highest border-2 border-surface-variant',
    filled: 'bg-surface-container-highest border-2 border-tile-filled text-on-surface',
    correct: 'bg-primary text-on-primary border-2 border-primary',
    present: 'bg-secondary text-on-secondary border-2 border-secondary',
    absent: 'bg-surface-variant text-on-surface-variant border-2 border-surface-variant',
  };

  // Animation styles
  const animationStyle: React.CSSProperties = {};
  
  if (isFlipping) {
    animationStyle.animation = `flip 500ms ease-in-out ${delay}ms forwards`;
  }
  
  if (isBouncing) {
    animationStyle.animation = `bounce 500ms ease-in-out ${delay}ms forwards`;
  }

  return (
    <div
      className={`${baseClasses} ${stateClasses[state]} perspective-500`}
      style={animationStyle}
      data-testid="tile"
      data-state={state}
    >
      {letter}
    </div>
  );
}
