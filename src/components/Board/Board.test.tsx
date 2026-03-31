import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Board } from './Board';
import { TileState } from '../../types';

describe('Board', () => {
  const createEmptyGrid = (): { letter: string; state: TileState }[][] => {
    return Array(6).fill(null).map(() =>
      Array(5).fill(null).map(() => ({ letter: '', state: 'empty' as TileState }))
    );
  };

  const createGridWithWord = (word: string, rowIndex: number, state: TileState = 'filled'): { letter: string; state: TileState }[][] => {
    const grid = createEmptyGrid();
    for (let i = 0; i < 5; i++) {
      grid[rowIndex][i] = { letter: word[i] || '', state };
    }
    return grid;
  };

  it('renders 6 rows', () => {
    const grid = createEmptyGrid();
    render(<Board grid={grid} currentRow={0} />);
    const rows = screen.getAllByTestId('row');
    expect(rows).toHaveLength(6);
  });

  it('renders 30 tiles total (6 rows x 5 tiles)', () => {
    const grid = createEmptyGrid();
    render(<Board grid={grid} currentRow={0} />);
    const tiles = screen.getAllByTestId('tile');
    expect(tiles).toHaveLength(30);
  });

  it('renders grid with letters in correct positions', () => {
    const grid = createGridWithWord('KALEM', 0, 'filled');
    render(<Board grid={grid} currentRow={0} />);
    const tiles = screen.getAllByTestId('tile');
    expect(tiles[0]).toHaveTextContent('K');
    expect(tiles[1]).toHaveTextContent('A');
    expect(tiles[2]).toHaveTextContent('L');
    expect(tiles[3]).toHaveTextContent('E');
    expect(tiles[4]).toHaveTextContent('M');
  });

  it('applies shake animation to specified row', () => {
    const grid = createGridWithWord('KALEM', 2, 'filled');
    render(<Board grid={grid} currentRow={2} shakingRow={2} />);
    const rows = screen.getAllByTestId('row');
    expect(rows[2].style.animation).toContain('shake');
  });

  it('applies flip animation to specified row', () => {
    const grid = createGridWithWord('KALEM', 1, 'filled');
    render(<Board grid={grid} currentRow={1} flippingRow={1} />);
    const rows = screen.getAllByTestId('row');
    const tilesInRow = rows[1].querySelectorAll('[data-testid="tile"]');
    tilesInRow.forEach(tile => {
      expect((tile as HTMLElement).style.animation).toContain('flip');
    });
  });

  it('applies bounce animation to specified row', () => {
    const grid = createGridWithWord('KALEM', 0, 'correct');
    render(<Board grid={grid} currentRow={0} bouncingRow={0} />);
    const rows = screen.getAllByTestId('row');
    const tilesInRow = rows[0].querySelectorAll('[data-testid="tile"]');
    tilesInRow.forEach(tile => {
      expect((tile as HTMLElement).style.animation).toContain('bounce');
    });
  });

  it('renders Turkish characters correctly', () => {
    const grid = createEmptyGrid();
    grid[0][0] = { letter: 'Ç', state: 'filled' };
    grid[0][1] = { letter: 'I', state: 'filled' };
    grid[0][2] = { letter: 'Ğ', state: 'filled' };
    grid[0][3] = { letter: 'Ö', state: 'filled' };
    grid[0][4] = { letter: 'Ş', state: 'filled' };
    
    render(<Board grid={grid} currentRow={0} />);
    const tiles = screen.getAllByTestId('tile');
    expect(tiles[0]).toHaveTextContent('Ç');
    expect(tiles[1]).toHaveTextContent('I');
    expect(tiles[2]).toHaveTextContent('Ğ');
    expect(tiles[3]).toHaveTextContent('Ö');
    expect(tiles[4]).toHaveTextContent('Ş');
  });

  it('renders mixed state rows correctly', () => {
    const grid = createEmptyGrid();
    // Row 0: All correct (win)
    grid[0] = [
      { letter: 'K', state: 'correct' },
      { letter: 'A', state: 'correct' },
      { letter: 'L', state: 'correct' },
      { letter: 'E', state: 'correct' },
      { letter: 'M', state: 'correct' },
    ];
    // Row 1: Mixed states
    grid[1] = [
      { letter: 'S', state: 'correct' },
      { letter: 'A', state: 'present' },
      { letter: 'B', state: 'absent' },
      { letter: 'A', state: 'filled' },
      { letter: 'H', state: 'empty' },
    ];
    
    render(<Board grid={grid} currentRow={2} />);
    const tiles = screen.getAllByTestId('tile');
    
    // Check first row (all correct)
    expect(tiles[0]).toHaveAttribute('data-state', 'correct');
    expect(tiles[1]).toHaveAttribute('data-state', 'correct');
    expect(tiles[2]).toHaveAttribute('data-state', 'correct');
    expect(tiles[3]).toHaveAttribute('data-state', 'correct');
    expect(tiles[4]).toHaveAttribute('data-state', 'correct');
    
    // Check second row (mixed)
    expect(tiles[5]).toHaveAttribute('data-state', 'correct');
    expect(tiles[6]).toHaveAttribute('data-state', 'present');
    expect(tiles[7]).toHaveAttribute('data-state', 'absent');
    expect(tiles[8]).toHaveAttribute('data-state', 'filled');
    expect(tiles[9]).toHaveAttribute('data-state', 'empty');
  });

  it('tracks current row correctly', () => {
    const grid = createEmptyGrid();
    grid[0] = [
      { letter: 'K', state: 'correct' },
      { letter: 'A', state: 'correct' },
      { letter: 'L', state: 'correct' },
      { letter: 'E', state: 'correct' },
      { letter: 'M', state: 'correct' },
    ];
    
    const { rerender } = render(<Board grid={grid} currentRow={1} />);
    expect(screen.getByTestId('board')).toBeInTheDocument();
    
    rerender(<Board grid={grid} currentRow={2} />);
    expect(screen.getByTestId('board')).toBeInTheDocument();
  });
});
