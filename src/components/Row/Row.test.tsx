import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Row } from './Row';
import { TileState } from '../../types';

describe('Row', () => {
  const createTiles = (letters: string, state: TileState = 'empty'): { letter: string; state: TileState }[] => {
    return letters.split('').map(letter => ({ letter, state }));
  };

  it('renders 5 tiles', () => {
    const tiles = createTiles('     ', 'empty');
    render(<Row tiles={tiles} />);
    const row = screen.getByTestId('row');
    expect(row).toBeInTheDocument();
    expect(row.children).toHaveLength(5);
  });

  it('renders tiles with correct letters', () => {
    const tiles = createTiles('KALEM', 'filled');
    render(<Row tiles={tiles} />);
    const rowTiles = screen.getAllByTestId('tile');
    expect(rowTiles[0]).toHaveTextContent('K');
    expect(rowTiles[1]).toHaveTextContent('A');
    expect(rowTiles[2]).toHaveTextContent('L');
    expect(rowTiles[3]).toHaveTextContent('E');
    expect(rowTiles[4]).toHaveTextContent('M');
  });

  it('applies shake animation when isShaking is true', () => {
    const tiles = createTiles('KALEM', 'filled');
    render(<Row tiles={tiles} isShaking={true} />);
    const row = screen.getByTestId('row');
    expect(row.style.animation).toContain('shake');
  });

  it('applies flip animation to all tiles when isFlipping is true', () => {
    const tiles = createTiles('KALEM', 'filled');
    render(<Row tiles={tiles} isFlipping={true} />);
    const rowTiles = screen.getAllByTestId('tile');
    rowTiles.forEach(tile => {
      expect(tile.style.animation).toContain('flip');
    });
  });

  it('applies sequential delay to flip animations', () => {
    const tiles = createTiles('KALEM', 'filled');
    render(<Row tiles={tiles} isFlipping={true} flipDelay={0} />);
    const rowTiles = screen.getAllByTestId('tile');
    expect(rowTiles[0].style.animation).toContain('0ms');
    expect(rowTiles[1].style.animation).toContain('250ms');
    expect(rowTiles[2].style.animation).toContain('500ms');
    expect(rowTiles[3].style.animation).toContain('750ms');
    expect(rowTiles[4].style.animation).toContain('1000ms');
  });

  it('renders Turkish characters correctly', () => {
    const tiles = [
      { letter: 'Ç', state: 'filled' as TileState },
      { letter: 'I', state: 'filled' as TileState },
      { letter: 'Ğ', state: 'filled' as TileState },
      { letter: 'L', state: 'filled' as TileState },
      { letter: 'İ', state: 'filled' as TileState },
    ];
    render(<Row tiles={tiles} />);
    const rowTiles = screen.getAllByTestId('tile');
    expect(rowTiles[0]).toHaveTextContent('Ç');
    expect(rowTiles[1]).toHaveTextContent('I');
    expect(rowTiles[2]).toHaveTextContent('Ğ');
    expect(rowTiles[3]).toHaveTextContent('L');
    expect(rowTiles[4]).toHaveTextContent('İ');
  });

  it('renders mixed state tiles', () => {
    const tiles = [
      { letter: 'K', state: 'correct' as TileState },
      { letter: 'A', state: 'present' as TileState },
      { letter: 'L', state: 'absent' as TileState },
      { letter: 'E', state: 'empty' as TileState },
      { letter: 'M', state: 'filled' as TileState },
    ];
    render(<Row tiles={tiles} />);
    const rowTiles = screen.getAllByTestId('tile');
    expect(rowTiles[0]).toHaveAttribute('data-state', 'correct');
    expect(rowTiles[1]).toHaveAttribute('data-state', 'present');
    expect(rowTiles[2]).toHaveAttribute('data-state', 'absent');
    expect(rowTiles[3]).toHaveAttribute('data-state', 'empty');
    expect(rowTiles[4]).toHaveAttribute('data-state', 'filled');
  });
});
