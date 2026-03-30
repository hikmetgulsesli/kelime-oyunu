import { useState } from 'react';
import { Board } from './components/Board';
import { TileState } from './types';

// Create initial empty grid
function createEmptyGrid(): { letter: string; state: TileState }[][] {
  return Array(6).fill(null).map(() =>
    Array(5).fill(null).map(() => ({ letter: '', state: 'empty' as TileState }))
  );
}

export default function App() {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [currentRow, setCurrentRow] = useState(0);
  const [shakingRow, setShakingRow] = useState<number | null>(null);
  const [bouncingRow, setBouncingRow] = useState<number | null>(null);
  const [flippingRow, setFlippingRow] = useState<number | null>(null);

  // Demo: Fill a row with Turkish characters
  const fillRow = () => {
    const newGrid = [...grid];
    const turkishWord = 'ÇIĞLIK';
    for (let i = 0; i < 5; i++) {
      newGrid[currentRow][i] = { 
        letter: turkishWord[i] || '', 
        state: 'filled' 
      };
    }
    setGrid(newGrid);
  };

  // Demo: Trigger shake animation
  const triggerShake = () => {
    setShakingRow(currentRow);
    setTimeout(() => setShakingRow(null), 600);
  };

  // Demo: Trigger flip animation with states
  const triggerFlip = () => {
    setFlippingRow(currentRow);
    
    // Update states after flip starts
    setTimeout(() => {
      const newGrid = [...grid];
      const states: TileState[] = ['correct', 'present', 'absent', 'correct', 'present'];
      for (let i = 0; i < 5; i++) {
        newGrid[currentRow][i].state = states[i];
      }
      setGrid(newGrid);
    }, 250);

    setTimeout(() => {
      setFlippingRow(null);
      if (currentRow < 5) {
        setCurrentRow(currentRow + 1);
      }
    }, 1500);
  };

  // Demo: Trigger bounce animation
  const triggerBounce = () => {
    setBouncingRow(currentRow);
    setTimeout(() => setBouncingRow(null), 2500);
  };

  return (
    <div className="min-h-screen bg-surface-dim text-on-surface flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-black tracking-widest mb-8">KELİME</h1>
      
      <Board 
        grid={grid} 
        currentRow={currentRow}
        shakingRow={shakingRow}
        bouncingRow={bouncingRow}
        flippingRow={flippingRow}
      />

      <div className="mt-8 flex flex-wrap gap-2 justify-center">
        <button 
          onClick={fillRow}
          className="px-4 py-2 bg-surface-container-high rounded text-sm font-medium hover:bg-surface-container transition-colors"
        >
          Harf Ekle (ÇIĞLIK)
        </button>
        <button 
          onClick={triggerShake}
          className="px-4 py-2 bg-surface-container-high rounded text-sm font-medium hover:bg-surface-container transition-colors"
        >
          Sallanma Animasyonu
        </button>
        <button 
          onClick={triggerFlip}
          className="px-4 py-2 bg-surface-container-high rounded text-sm font-medium hover:bg-surface-container transition-colors"
        >
          Çevirme Animasyonu
        </button>
        <button 
          onClick={triggerBounce}
          className="px-4 py-2 bg-surface-container-high rounded text-sm font-medium hover:bg-surface-container transition-colors"
        >
          Zıplama Animasyonu
        </button>
      </div>
    </div>
  );
}
