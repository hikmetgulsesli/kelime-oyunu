import { useState, useCallback, useRef } from 'react';
import type { GameState, TileState, Grid, Statistics, GuessResult } from '../types';
import { getTodaysWord, isValidGuess, evaluateGuess } from '../utils/wordUtils';

const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;

interface UseGameReturn {
  state: GameState;
  grid: Grid;
  currentRow: number;
  currentCol: number;
  keyboardState: Map<string, TileState>;
  addLetter: (letter: string) => void;
  deleteLetter: () => void;
  submitGuess: () => { success: boolean; message?: string };
  reset: () => void;
  getStatistics: () => Statistics;
  shakingRow: number | null;
  flippingRow: number | null;
  bouncingRow: number | null;
  toast: { message: string; type: 'info' | 'success' | 'error'; visible: boolean } | null;
  dismissToast: () => void;
  targetWord: string;
}

function createEmptyGrid(): Grid {
  return Array(MAX_ATTEMPTS).fill(null).map(() =>
    Array(WORD_LENGTH).fill(null).map(() => ({ letter: '', state: 'empty' as TileState }))
  );
}

function loadStatistics(): Statistics {
  try {
    const saved = localStorage.getItem('kelime-stats');
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
    localStorage.setItem('kelime-stats', JSON.stringify(stats));
  } catch {
    // Ignore localStorage errors
  }
}

export function useGame(): UseGameReturn {
  const [state, setState] = useState<GameState>('PLAYING');
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [keyboardState, setKeyboardState] = useState<Map<string, TileState>>(new Map());
  const [shakingRow, setShakingRow] = useState<number | null>(null);
  const [flippingRow, setFlippingRow] = useState<number | null>(null);
  const [bouncingRow, setBouncingRow] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error'; visible: boolean } | null>(null);
  
  const [targetWord, setTargetWord] = useState(getTodaysWord());
  const targetWordRef = useRef(targetWord);
  const guessesRef = useRef<string[]>([]);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ message, type, visible: true });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(prev => prev ? { ...prev, visible: false } : null);
  }, []);

  const addLetter = useCallback((letter: string) => {
    if (state !== 'PLAYING') return;
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
  }, [state, currentRow, currentCol]);

  const deleteLetter = useCallback(() => {
    if (state !== 'PLAYING') return;
    if (currentCol <= 0) return;
    
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[currentRow][currentCol - 1] = { letter: '', state: 'empty' };
      return newGrid;
    });
    
    setCurrentCol(prev => prev - 1);
  }, [state, currentRow, currentCol]);

  const updateKeyboardState = useCallback((guess: string, results: GuessResult) => {
    setKeyboardState(prev => {
      const newState = new Map(prev);
      results.tiles.forEach((tileState, index) => {
        const letter = guess[index];
        const currentState = newState.get(letter);
        
        // Priority: correct > present > absent
        if (tileState === 'correct') {
          newState.set(letter, 'correct');
        } else if (tileState === 'present' && currentState !== 'correct') {
          newState.set(letter, 'present');
        } else if (tileState === 'absent' && !currentState) {
          newState.set(letter, 'absent');
        }
      });
      return newState;
    });
  }, []);

  const submitGuess = useCallback(() => {
    if (state !== 'PLAYING') {
      return { success: false, message: 'Oyun bitti' };
    }
    
    if (currentCol < WORD_LENGTH) {
      setShakingRow(currentRow);
      setTimeout(() => setShakingRow(null), 600);
      return { success: false, message: 'Eksik harf' };
    }
    
    const guess = grid[currentRow].map(tile => tile.letter).join('');
    
    if (!isValidGuess(guess)) {
      setShakingRow(currentRow);
      setTimeout(() => setShakingRow(null), 600);
      showToast('Geçersiz kelime', 'error');
      return { success: false, message: 'Geçersiz kelime' };
    }
    
    const targetWord = targetWordRef.current;
    const evaluation = evaluateGuess(guess, targetWord);
    const tiles = evaluation.map(e => e.result);
    
    // Start flip animation
    setFlippingRow(currentRow);
    
    // Update grid with results after a short delay (mid-flip)
    setTimeout(() => {
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
    }, 250);
    
    // End flip animation and check win/lose
    setTimeout(() => {
      setFlippingRow(null);
      
      const isCorrect = tiles.every(t => t === 'correct');
      guessesRef.current.push(guess);
      
      updateKeyboardState(guess, { word: guess, tiles, isCorrect });
      
      if (isCorrect) {
        setState('WIN');
        setBouncingRow(currentRow);
        setTimeout(() => setBouncingRow(null), 2500);
        showToast('Tebrikler!', 'success');
        
        // Update statistics
        const stats = loadStatistics();
        stats.gamesPlayed++;
        stats.gamesWon++;
        stats.currentStreak++;
        if (stats.currentStreak > stats.maxStreak) {
          stats.maxStreak = stats.currentStreak;
        }
        stats.guessDistribution[currentRow]++;
        stats.winPercentage = Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
        saveStatistics(stats);
      } else if (currentRow >= MAX_ATTEMPTS - 1) {
        setState('LOSE');
        showToast(`Kelime: ${targetWord}`, 'info');
        
        // Update statistics
        const stats = loadStatistics();
        stats.gamesPlayed++;
        stats.currentStreak = 0;
        stats.winPercentage = Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
        saveStatistics(stats);
      } else {
        setCurrentRow(prev => prev + 1);
        setCurrentCol(0);
      }
    }, 1500);
    
    return { success: true };
  }, [state, currentRow, currentCol, grid, showToast, updateKeyboardState]);

  const reset = useCallback(() => {
    const newWord = getTodaysWord();
    setState('PLAYING');
    setGrid(createEmptyGrid());
    setCurrentRow(0);
    setCurrentCol(0);
    setKeyboardState(new Map());
    setTargetWord(newWord);
    targetWordRef.current = newWord;
    guessesRef.current = [];
    setShakingRow(null);
    setFlippingRow(null);
    setBouncingRow(null);
    setToast(null);
  }, []);

  const getStatistics = useCallback(() => {
    return loadStatistics();
  }, []);

  return {
    state,
    grid,
    currentRow,
    currentCol,
    keyboardState,
    addLetter,
    deleteLetter,
    submitGuess,
    reset,
    getStatistics,
    shakingRow,
    flippingRow,
    bouncingRow,
    toast,
    dismissToast,
    targetWord,
  };
}
