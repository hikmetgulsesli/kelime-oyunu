import { useState, useCallback, useEffect, useMemo } from 'react';
import { evaluateGuess, isValidGuess, getDailyWord, PositionResult } from '../utils/wordUtils';
import { getToday } from '../utils/dateUtils';

export type GameState = 'IDLE' | 'PLAYING' | 'WIN' | 'LOSE';

export interface GuessResult {
  word: string;
  evaluation: PositionResult[];
}

export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  winPercentage: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: [number, number, number, number, number, number];
}

export interface GameStateData {
  gameState: GameState;
  currentRow: number;
  currentTile: number;
  guesses: GuessResult[];
  targetWord: string;
  date: string;
}

const STORAGE_KEY = 'kelime-oyunu-stats';
const GAME_STATE_KEY = 'kelime-oyunu-state';

const DEFAULT_STATS: GameStatistics = {
  gamesPlayed: 0,
  gamesWon: 0,
  winPercentage: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
};

/**
 * Get statistics from localStorage
 */
function getStoredStatistics(): GameStatistics {
  if (typeof window === 'undefined') {
    return DEFAULT_STATS;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return DEFAULT_STATS;
  }

  try {
    return { ...DEFAULT_STATS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_STATS;
  }
}

/**
 * Save statistics to localStorage
 */
function saveStatistics(stats: GameStatistics): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }
}

/**
 * Get saved game state from localStorage
 */
function getStoredGameState(): GameStateData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(GAME_STATE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save game state to localStorage
 */
function saveGameState(state: GameStateData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  }
}

/**
 * Clear game state from localStorage
 */
function clearGameState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GAME_STATE_KEY);
  }
}

/**
 * Custom hook for managing game state
 */
export function useGame() {
  const today = useMemo(() => getToday(), []);
  const todayString = today;
  const targetWord = useMemo(() => getDailyWord(todayString), [todayString]);

  // Read stored state once to initialize all useState calls
  const storedState = useMemo(() => {
    const stored = getStoredGameState();
    if (stored && stored.date === todayString && stored.targetWord === targetWord) {
      return stored;
    }
    return null;
  }, [todayString, targetWord]);

  // Initialize state from localStorage or defaults
  const [gameState, setGameState] = useState<GameState>(() => {
    return storedState?.gameState ?? 'IDLE';
  });

  const [currentRow, setCurrentRow] = useState<number>(() => {
    return storedState?.currentRow ?? 0;
  });

  const [currentTile, setCurrentTile] = useState<number>(() => {
    return storedState?.currentTile ?? 0;
  });

  const [guesses, setGuesses] = useState<GuessResult[]>(() => {
    return storedState?.guesses ?? [];
  });

  // Save game state whenever it changes
  useEffect(() => {
    if (gameState !== 'IDLE') {
      saveGameState({
        gameState,
        currentRow,
        currentTile,
        guesses,
        targetWord,
        date: todayString,
      });
    }
  }, [gameState, currentRow, currentTile, guesses, targetWord, todayString]);

  /**
   * Add a letter to the current guess
   */
  const addLetter = useCallback((letter: string) => {
    if (gameState === 'WIN' || gameState === 'LOSE') {
      return;
    }

    if (currentTile < 5 && currentRow < 6) {
      // Transition from IDLE to PLAYING on first keypress
      if (gameState === 'IDLE') {
        setGameState('PLAYING');
      }
      setCurrentTile((prev) => prev + 1);
    }
    // letter parameter is used by the calling component to track the current word
    void letter;
  }, [currentTile, currentRow, gameState]);

  /**
   * Remove the last letter from the current guess
   */
  const deleteLetter = useCallback(() => {
    if (gameState === 'WIN' || gameState === 'LOSE') {
      return;
    }

    if (currentTile > 0) {
      setCurrentTile((prev) => prev - 1);
    }
  }, [currentTile, gameState]);

  /**
   * Get the current guess word being typed
   * @deprecated Use getCurrentGuessWord instead
   */
  const _getCurrentGuess = useCallback((): string => {
    // This is used externally to track what's being typed
    // The actual letters are managed by the component
    return '';
  }, []);
  // Prevent unused variable error - this function is kept for API compatibility
  void _getCurrentGuess;

  /**
   * Submit the current guess
   */
  const submitGuess = useCallback((guessWord: string): { success: boolean; error?: string } => {
    if (gameState === 'WIN' || gameState === 'LOSE') {
      return { success: false, error: 'Oyun zaten bitti' };
    }

    const upperGuess = guessWord.toUpperCase();

    // Validate word length
    if (upperGuess.length !== 5) {
      return { success: false, error: 'Kelime 5 harfli olmalı' };
    }

    // Validate if it's a valid Turkish word
    if (!isValidGuess(upperGuess)) {
      return { success: false, error: 'Geçerli bir kelime değil' };
    }

    // Evaluate the guess
    const evaluation = evaluateGuess(upperGuess, targetWord);
    const newGuess: GuessResult = {
      word: upperGuess,
      evaluation,
    };

    setGuesses((prev) => [...prev, newGuess]);

    // Check if won
    const isWin = upperGuess === targetWord;
    
    if (isWin) {
      setGameState('WIN');
      // Update statistics
      const stats = getStoredStatistics();
      stats.gamesPlayed += 1;
      stats.gamesWon += 1;
      stats.currentStreak += 1;
      if (stats.currentStreak > stats.maxStreak) {
        stats.maxStreak = stats.currentStreak;
      }
      stats.guessDistribution[currentRow] += 1;
      stats.winPercentage = Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
      saveStatistics(stats);
    } else if (currentRow + 1 >= 6) {
      // Last row and didn't win
      setGameState('LOSE');
      // Update statistics
      const stats = getStoredStatistics();
      stats.gamesPlayed += 1;
      stats.currentStreak = 0;
      stats.winPercentage = Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
      saveStatistics(stats);
    } else {
      // Move to next row
      setCurrentRow((prev) => prev + 1);
      setCurrentTile(0);
    }

    return { success: true };
  }, [currentRow, gameState, targetWord]);

  /**
   * Reset the game to initial state
   */
  const resetGame = useCallback(() => {
    setGameState('IDLE');
    setCurrentRow(0);
    setCurrentTile(0);
    setGuesses([]);
    clearGameState();
  }, []);

  /**
   * Get current statistics
   */
  const getStatistics = useCallback((): GameStatistics => {
    return getStoredStatistics();
  }, []);

  /**
   * Get the current word being typed (for external tracking)
   */
  const getCurrentGuessWord = useCallback((): string => {
    // This returns the word at the current row from guesses if it exists
    // Otherwise returns empty string
    if (guesses.length > currentRow) {
      return guesses[currentRow]?.word || '';
    }
    return '';
  }, [guesses, currentRow]);

  return {
    gameState,
    currentRow,
    currentTile,
    guesses,
    targetWord,
    addLetter,
    deleteLetter,
    submitGuess,
    resetGame,
    getStatistics,
    getCurrentGuessWord,
  };
}
