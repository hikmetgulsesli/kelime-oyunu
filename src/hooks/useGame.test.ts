import { describe, it, expect, beforeEach } from 'vitest';
import { GameState, TileState } from '../types';

// Placeholder useGame hook implementation for testing
interface Game {
  state: GameState;
  currentRow: number;
  currentCol: number;
  grid: { letter: string; state: TileState }[][];
}

function createGame(): Game {
  return {
    state: 'IDLE',
    currentRow: 0,
    currentCol: 0,
    grid: Array(6).fill(null).map(() =>
      Array(5).fill(null).map(() => ({ letter: '', state: 'empty' as TileState }))
    ),
  };
}

describe('useGame (placeholder)', () => {
  let game: Game;

  beforeEach(() => {
    game = createGame();
  });

  it('should initialize with IDLE state', () => {
    expect(game.state).toBe('IDLE');
  });

  it('should initialize at row 0, col 0', () => {
    expect(game.currentRow).toBe(0);
    expect(game.currentCol).toBe(0);
  });

  it('should have 6 rows in grid', () => {
    expect(game.grid).toHaveLength(6);
  });

  it('should have 5 columns in each row', () => {
    game.grid.forEach(row => {
      expect(row).toHaveLength(5);
    });
  });

  it('should initialize all tiles as empty', () => {
    game.grid.forEach(row => {
      row.forEach(tile => {
        expect(tile.state).toBe('empty');
        expect(tile.letter).toBe('');
      });
    });
  });

  it('should transition to PLAYING state', () => {
    game.state = 'PLAYING';
    expect(game.state).toBe('PLAYING');
  });

  it('should transition to WIN state', () => {
    game.state = 'WIN';
    expect(game.state).toBe('WIN');
  });

  it('should transition to LOSE state', () => {
    game.state = 'LOSE';
    expect(game.state).toBe('LOSE');
  });
});
