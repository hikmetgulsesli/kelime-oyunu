import { TileState } from '../../types';
import { Tile } from '../Tile/Tile';

interface RowProps {
  tiles: { letter: string; state: TileState }[];
  isShaking?: boolean;
  isBouncing?: boolean;
  isFlipping?: boolean;
  flipDelay?: number;
}

/**
 * Row component - A row of 5 tiles in the game board
 * 
 * Features:
 * - Shake animation for invalid words (600ms)
 * - Bounce animation on win
 * - Flip animation for guess submission (250ms per tile, sequential)
 */
export function Row({ 
  tiles, 
  isShaking = false, 
  isBouncing = false, 
  isFlipping = false,
  flipDelay = 0 
}: RowProps) {
  // Animation style for shake
  const rowStyle: React.CSSProperties = isShaking 
    ? { animation: 'shake 600ms ease-in-out' }
    : {};

  return (
    <div 
      className="flex gap-2"
      style={rowStyle}
      data-testid="row"
    >
      {tiles.map((tile, index) => (
        <Tile
          key={index}
          letter={tile.letter}
          state={tile.state}
          isFlipping={isFlipping}
          isBouncing={isBouncing}
          delay={flipDelay + index * 250} // 250ms delay per tile, sequential
        />
      ))}
    </div>
  );
}
