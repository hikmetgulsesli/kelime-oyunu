import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, TileState, Grid, Statistics } from '../types';
import { getTodaysWord, isValidGuess, evaluateGuess } from '../utils/wordUtils';

const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;
const STATISTICS_KEY = 'kelime-stats';

interface UseGameReturn {
  state: GameState;
  grid: Grid;
  currentRow: number;
  currentCol: number;
  targetWord: string;
  guesses: string[];
  keyboardState: Map<string, TileState>;
  statistics: Statistics;
  addLetter: (letter: string) => void;
  deleteLetter: () => void;
  submitGuess: () => { success: boolean; message?: string };
  resetGame: () => void;
  shakingRow: number | null;
  flippingRow: number | null;
  bouncingRow: number | null;
}

function createEmptyGrid(): Grid {
  return Array(MAX_ATTEMPTS).fill(null).map(() =>
    Array(WORD_LENGTH).fill(null).map(() => ({ letter: '', state: 'empty' as TileState }))
  );
}

function loadStatistics(): Statistics {
  try {
    const saved = localStorage.getItem(STATISTICS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore localStorage errors
  }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
    winPercentage: 0,
  };
}

function saveStatistics(stats: Statistics): void {
  try {
    localStorage.setItem(STATISTICS_KEY, JSON.stringify(stats));
  } catch {
    // Ignore localStorage errors
  }
}

export function useGame(): UseGameReturn {
  const [state, setState] = useState<GameState>('IDLE');
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [targetWord, setTargetWord] = useState(() => getTodaysWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [keyboardState, setKeyboardState] = useState<Map<string, TileState>>(new Map());
  const [statistics, setStatistics] = useState<Statistics>(() => loadStatistics());
  const [shakingRow, setShakingRow] = useState<number | null>(null);
  const [flippingRow, setFlippingRow] = useState<number | null>(null);
  const [bouncingRow, setBouncingRow] = useState<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Start game on first interaction
  const startGame = useCallback(() => {
    if (state === 'IDLE') {
      setState('PLAYING');
    }
  }, [state]);

  const addLetter = useCallback((letter: string) => {
    startGame();
    
    if (state === 'WIN' || state === 'LOSE') return;
    if (currentCol >= WORD_LENGTH) return;
    
    const normalizedLetter = letter.toLocaleUpperCase('tr-TR');
    
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[currentRow][currentCol] = { 
        letter: normalizedLetter, 
        state: 'filled' 
      };
      return newGrid;
    });
    
    setCurrentCol(prev => prev + 1);
  }, [currentCol, currentRow, state, startGame]);

  const deleteLetter = useCallback(() => {
    if (state === 'WIN' || state === 'LOSE') return;
    if (currentCol <= 0) return;
    
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[currentRow][currentCol - 1] = { letter: '', state: 'empty' };
      return newGrid;
    });
    
    setCurrentCol(prev => prev - 1);
  }, [currentCol, currentRow, state]);

  const updateKeyboardState = useCallback((_guess: string, results: { letter: string; result: 'correct' | 'present' | 'absent' }[]) => {
    setKeyboardState(prev => {
      const newState = new Map(prev);
      
      results.forEach(({ letter, result }) => {
        const currentState = newState.get(letter);
        
        // Priority: correct > present > absent
        if (result === 'correct') {
          newState.set(letter, 'correct');
        } else if (result === 'present' && currentState !== 'correct') {
          newState.set(letter, 'present');
        } else if (result === 'absent' && !currentState) {
          newState.set(letter, 'absent');
        }
      });
      
      return newState;
    });
  }, []);

  const submitGuess = useCallback(() => {
    if (state === 'WIN' || state === 'LOSE') {
      return { success: false, message: 'Oyun bitti' };
    }
    
    if (currentCol < WORD_LENGTH) {
      // Shake animation for incomplete word
      setShakingRow(currentRow);
      setTimeout(() => {
        if (isMountedRef.current) setShakingRow(null);
      }, 500);
      return { success: false, message: 'Eksik harf' };
    }
    
    const currentGuess = grid[currentRow].map(tile => tile.letter).join('');
    
    if (!isValidGuess(currentGuess)) {
      // Shake animation for invalid word
      setShakingRow(currentRow);
      setTimeout(() => {
        if (isMountedRef.current) setShakingRow(null);
      }, 500);
      return { success: false, message: 'Geçersiz kelime' };
    }
    
    // Evaluate the guess
    const evaluation = evaluateGuess(currentGuess, targetWord);
    const isCorrect = evaluation.every(r => r.result === 'correct');
    
    // Update keyboard state
    updateKeyboardState(currentGuess, evaluation);
    
    // Start flip animation
    setFlippingRow(currentRow);
    
    // Update grid with results after a short delay for animation
    setTimeout(() => {
      if (!isMountedRef.current) return;
      setGrid(prev => {
        const newGrid = prev.map(row => [...row]);
        evaluation.forEach((result, index) => {
          newGrid[currentRow][index] = {
            letter: result.letter,
            state: result.result
          };
        });
        return newGrid;
      });
      
      setFlippingRow(null);
      
      // Add to guesses
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      
      if (isCorrect) {
        setState('WIN');
        setBouncingRow(currentRow);
        setTimeout(() => {
          if (isMountedRef.current) setBouncingRow(null);
        }, 1500);
        
        // Update statistics
        setStatistics(prev => {
          const newStats = {
            ...prev,
            gamesPlayed: prev.gamesPlayed + 1,
            gamesWon: prev.gamesWon + 1,
            currentStreak: prev.currentStreak + 1,
            maxStreak: Math.max(prev.maxStreak, prev.currentStreak + 1),
            guessDistribution: [...prev.guessDistribution],
          };
          newStats.guessDistribution[currentRow]++;
          newStats.winPercentage = Math.round((newStats.gamesWon / newStats.gamesPlayed) * 100);
          saveStatistics(newStats);
          return newStats;
        });
      } else if (currentRow >= MAX_ATTEMPTS - 1) {
        setState('LOSE');
        
        // Update statistics
        setStatistics(prev => {
          const newStats = {
            ...prev,
            gamesPlayed: prev.gamesPlayed + 1,
            currentStreak: 0,
          };
          newStats.winPercentage = Math.round((newStats.gamesWon / newStats.gamesPlayed) * 100);
          saveStatistics(newStats);
          return newStats;
        });
      } else {
        // Move to next row
        setCurrentRow(prev => prev + 1);
        setCurrentCol(0);
      }
    }, 1500);
    
    return { success: true };
  }, [currentCol, currentRow, grid, guesses, state, targetWord, updateKeyboardState]);

  const resetGame = useCallback(() => {
    setState('IDLE');
    setGrid(createEmptyGrid());
    setCurrentRow(0);
    setCurrentCol(0);
    setTargetWord(getTodaysWord());
    setGuesses([]);
    setKeyboardState(new Map());
    setShakingRow(null);
    setFlippingRow(null);
    setBouncingRow(null);
  }, []);

  // Expose game state to window for testing
  useEffect(() => {
    const gameWindow = window as unknown as {
      game: {
        state: GameState;
        currentRow: number;
        currentCol: number;
        targetWord: string;
        guesses: string[];
        grid: Grid;
        statistics: Statistics;
        keyboardState: Map<string, TileState>;
        reset: () => void;
        submitGuess: () => { success: boolean; message?: string };
        getStatistics: () => Statistics;
      }
    };
    
    gameWindow.game = {
      state,
      currentRow,
      currentCol,
      targetWord,
      guesses,
      grid,
      statistics,
      keyboardState,
      reset: resetGame,
      submitGuess,
      getStatistics: () => statistics,
    };
  }, [state, currentRow, currentCol, targetWord, guesses, grid, statistics, keyboardState, resetGame, submitGuess]);

  return {
    state,
    grid,
    currentRow,
    currentCol,
    targetWord,
    guesses,
    keyboardState,
    statistics,
    addLetter,
    deleteLetter,
    submitGuess,
    resetGame,
    shakingRow,
    flippingRow,
    bouncingRow,
  };
}
