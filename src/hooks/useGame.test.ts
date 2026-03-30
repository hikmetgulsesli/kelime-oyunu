import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from './useGame';
import { GameState } from '../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock word utilities
vi.mock('../utils/wordUtils', () => ({
  getTodaysWord: vi.fn(() => 'BİLGİ'),
  isValidGuess: vi.fn((word: string) => ['BİLGİ', 'KELAM', 'KİTAP', 'KALEM'].includes(word)),
  evaluateGuess: vi.fn((guess: string, target: string) => {
    const result = [];
    for (let i = 0; i < 5; i++) {
      if (guess[i] === target[i]) {
        result.push({ letter: guess[i], result: 'correct' as const });
      } else if (target.includes(guess[i])) {
        result.push({ letter: guess[i], result: 'present' as const });
      } else {
        result.push({ letter: guess[i], result: 'absent' as const });
      }
    }
    return result;
  }),
}));

describe('useGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with IDLE state', () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.state).toBe('IDLE');
  });

  it('should initialize with empty grid', () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.grid).toHaveLength(6);
    result.current.grid.forEach(row => {
      expect(row).toHaveLength(5);
      row.forEach(tile => {
        expect(tile.state).toBe('empty');
        expect(tile.letter).toBe('');
      });
    });
  });

  it('should initialize at row 0, col 0', () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.currentRow).toBe(0);
    expect(result.current.currentCol).toBe(0);
  });

  it('should add letters and transition to PLAYING', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('K');
    });
    
    expect(result.current.state).toBe('PLAYING');
    expect(result.current.grid[0][0].letter).toBe('K');
    expect(result.current.grid[0][0].state).toBe('filled');
    expect(result.current.currentCol).toBe(1);
  });

  it('should add Turkish letters correctly', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('ç');
    });
    
    expect(result.current.grid[0][0].letter).toBe('Ç');
    
    act(() => {
      result.current.addLetter('ş');
    });
    
    expect(result.current.grid[0][1].letter).toBe('Ş');
    
    act(() => {
      result.current.addLetter('ğ');
    });
    
    expect(result.current.grid[0][2].letter).toBe('Ğ');
    
    act(() => {
      result.current.addLetter('ü');
    });
    
    expect(result.current.grid[0][3].letter).toBe('Ü');
    
    act(() => {
      result.current.addLetter('ö');
    });
    
    expect(result.current.grid[0][4].letter).toBe('Ö');
  });

  it('should delete letters', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('K');
    });
    
    expect(result.current.grid[0][0].letter).toBe('K');
    
    act(() => {
      result.current.addLetter('A');
    });
    
    expect(result.current.grid[0][1].letter).toBe('A');
    
    act(() => {
      result.current.deleteLetter();
    });
    
    expect(result.current.grid[0][1].letter).toBe('');
    expect(result.current.currentCol).toBe(1);
  });

  it('should not add more than 5 letters per row', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('K');
      result.current.addLetter('E');
      result.current.addLetter('L');
      result.current.addLetter('A');
      result.current.addLetter('M');
    });
    
    expect(result.current.currentCol).toBe(5);
    
    // Try to add 6th letter
    act(() => {
      result.current.addLetter('X');
    });
    
    // Should still be at 5
    expect(result.current.currentCol).toBe(5);
  });

  it('should return error for incomplete word submission', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('K');
      result.current.addLetter('E');
    });
    
    let submitResult;
    act(() => {
      submitResult = result.current.submitGuess();
    });
    
    expect(submitResult).toEqual({ success: false, message: 'Eksik harf' });
  });

  it('should return error for invalid word submission', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('X');
      result.current.addLetter('X');
      result.current.addLetter('X');
      result.current.addLetter('X');
      result.current.addLetter('X');
    });
    
    expect(result.current.currentCol).toBe(5);
    
    let submitResult;
    act(() => {
      submitResult = result.current.submitGuess();
    });
    
    expect(submitResult).toEqual({ success: false, message: 'Geçersiz kelime' });
  });

  it('should expose game state on window object', () => {
    renderHook(() => useGame());
    
    const gameWindow = window as unknown as {
      game: {
        state: GameState;
        reset: () => void;
        submitGuess: () => { success: boolean; message?: string };
        getStatistics: () => unknown;
      }
    };
    
    expect(gameWindow.game).toBeDefined();
    expect(gameWindow.game.state).toBe('IDLE');
    expect(typeof gameWindow.game.reset).toBe('function');
    expect(typeof gameWindow.game.submitGuess).toBe('function');
    expect(typeof gameWindow.game.getStatistics).toBe('function');
  });

  it('should reset game correctly', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('K');
    });
    
    expect(result.current.grid[0][0].letter).toBe('K');
    
    act(() => {
      result.current.resetGame();
    });
    
    expect(result.current.state).toBe('IDLE');
    expect(result.current.currentRow).toBe(0);
    expect(result.current.currentCol).toBe(0);
    expect(result.current.grid[0][0].letter).toBe('');
  });

  it('should initialize statistics from localStorage', () => {
    const savedStats = {
      gamesPlayed: 10,
      gamesWon: 8,
      currentStreak: 3,
      maxStreak: 5,
      guessDistribution: [1, 2, 3, 2, 0, 0],
      winPercentage: 80,
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedStats));
    
    const { result } = renderHook(() => useGame());
    
    expect(result.current.statistics.gamesPlayed).toBe(10);
    expect(result.current.statistics.gamesWon).toBe(8);
  });

  it('should have empty keyboard state initially', () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.keyboardState.size).toBe(0);
  });
});
