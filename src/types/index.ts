/**
 * Type definitions for Kelime Oyunu
 */

/** Game state enumeration */
export type GameState = 'IDLE' | 'PLAYING' | 'WIN' | 'LOSE';

/** Tile state enumeration for letter feedback */
export type TileState = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

/** Individual tile/letter in the grid */
export interface Tile {
  letter: string;
  state: TileState;
}

/** A row of tiles in the game grid */
export type Row = Tile[];

/** Complete game grid (6 rows x 5 columns) */
export type Grid = Row[];

/** Statistics for a player's performance */
export interface Statistics {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[]; // Array of 6 numbers (guesses 1-6)
  winPercentage: number;
}

/** Result of a single guess evaluation */
export interface GuessResult {
  word: string;
  tiles: TileState[];
  isCorrect: boolean;
}

/** Game configuration */
export interface GameConfig {
  wordLength: number;
  maxAttempts: number;
  language: 'tr';
}

/** Keyboard key state */
export interface KeyState {
  letter: string;
  state: TileState;
}

/** Full game state object */
export interface Game {
  state: GameState;
  grid: Grid;
  currentRow: number;
  currentCol: number;
  targetWord: string;
  guesses: string[];
  results: GuessResult[];
  keyboardState: Map<string, TileState>;
}
