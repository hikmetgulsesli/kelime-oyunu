import { TileState } from '../../types';
import { Row } from '../Row/Row';

interface BoardProps {
  grid: { letter: string; state: TileState }[][];
  currentRow: number;
  shakingRow?: number | null;
  bouncingRow?: number | null;
  flippingRow?: number | null;
}

/**
 * Board component - 6x5 tile grid for the word game
 * 
 * Features:
 * - Renders 6 Row components
 * - Each Row renders 5 Tile components
 * - Supports shake animation for invalid words
 * - Supports bounce animation on win
 * - Supports flip animation for guess submission
 * 
 * Turkish characters supported: ç, ş, ğ, ü, ö, ı
 */
export function Board({ 
  grid, 
  currentRow, 
  shakingRow = null,
  bouncingRow = null,
  flippingRow = null
}: BoardProps) {
  // currentRow is used to track which row is active
  void currentRow;
  
  return (
    <div 
      className="grid grid-rows-6 gap-2"
      data-testid="board"
    >
      {grid.map((row, rowIndex) => (
        <Row
          key={rowIndex}
          tiles={row}
          isShaking={shakingRow === rowIndex}
          isBouncing={bouncingRow === rowIndex}
          isFlipping={flippingRow === rowIndex}
          flipDelay={0}
        />
      ))}
    </div>
  );
}
