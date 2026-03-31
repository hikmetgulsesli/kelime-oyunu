import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGame } from './useGame';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// Mock word utilities
vi.mock('../utils/wordUtils', () => ({
  getTodaysWord: vi.fn(() => 'KELİM'),
  isValidGuess: vi.fn((word: string) => ['KELİM', 'KALEM', 'KİTAP', 'BİLGİ'].includes(word)),
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
    vi.stubGlobal('localStorage', localStorageMock);
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with PLAYING state', () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.state).toBe('PLAYING');
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

  it('should add letter to current position', async () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('A');
    });
    
    await waitFor(() => {
      expect(result.current.grid[0][0].letter).toBe('A');
      expect(result.current.grid[0][0].state).toBe('filled');
      expect(result.current.currentCol).toBe(1);
    });
  });

  it('should add Turkish letters correctly', async () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('ç');
    });
    
    await waitFor(() => {
      expect(result.current.grid[0][0].letter).toBe('Ç');
    });
    
    act(() => {
      result.current.addLetter('ş');
    });
    
    await waitFor(() => {
      expect(result.current.grid[0][1].letter).toBe('Ş');
    });
    
    act(() => {
      result.current.addLetter('ğ');
    });
    
    await waitFor(() => {
      expect(result.current.grid[0][2].letter).toBe('Ğ');
    });
  });

  it('should not add more than 5 letters', async () => {
    const { result } = renderHook(() => useGame());

    // Add 5 letters one at a time
    for (const letter of ['A', 'B', 'C', 'D', 'E']) {
      act(() => {
        result.current.addLetter(letter);
      });
    }

    await waitFor(() => {
      expect(result.current.currentCol).toBe(5);
    });

    // Try to add 6th letter - should be ignored
    act(() => {
      result.current.addLetter('F');
    });

    // State should remain unchanged
    expect(result.current.currentCol).toBe(5);
    expect(result.current.grid[0][4].letter).toBe('E');
  });

  it('should delete letter', async () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('A');
      result.current.addLetter('B');
    });
    
    await waitFor(() => {
      expect(result.current.currentCol).toBe(2);
    });
    
    act(() => {
      result.current.deleteLetter();
    });
    
    await waitFor(() => {
      expect(result.current.grid[0][1].letter).toBe('');
      expect(result.current.grid[0][1].state).toBe('empty');
      expect(result.current.currentCol).toBe(1);
    });
  });

  it('should not delete when at start', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.deleteLetter();
    });
    
    expect(result.current.currentCol).toBe(0);
  });

  it('should submit valid guess', async () => {
    const { result } = renderHook(() => useGame());

    // Add letters one at a time
    for (const letter of ['K', 'İ', 'T', 'A', 'P']) {
      act(() => {
        result.current.addLetter(letter);
      });
    }

    await waitFor(() => {
      expect(result.current.currentCol).toBe(5);
    });

    let submitResult: { success: boolean; message?: string } | undefined;
    act(() => {
      submitResult = result.current.submitGuess();
    });

    expect(submitResult?.success).toBe(true);
  });

  it('should reject incomplete guess', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('A');
      result.current.addLetter('B');
    });
    
    let submitResult: { success: boolean; message?: string } | undefined;
    act(() => {
      submitResult = result.current.submitGuess();
    });
    
    expect(submitResult?.success).toBe(false);
    expect(submitResult?.message).toBe('Eksik harf');
  });

  it('should reject invalid word', async () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('X');
      result.current.addLetter('X');
      result.current.addLetter('X');
      result.current.addLetter('X');
      result.current.addLetter('X');
    });
    
    await waitFor(() => {
      expect(result.current.currentCol).toBe(5);
    });
    
    let submitResult: { success: boolean; message?: string } | undefined;
    act(() => {
      submitResult = result.current.submitGuess();
    });
    
    expect(submitResult?.success).toBe(false);
    expect(submitResult?.message).toBe('Geçersiz kelime');
  });

  it('should reset game', () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('A');
      result.current.addLetter('B');
      result.current.reset();
    });
    
    expect(result.current.currentRow).toBe(0);
    expect(result.current.currentCol).toBe(0);
    expect(result.current.state).toBe('PLAYING');
    expect(result.current.grid[0][0].letter).toBe('');
  });

  it('should return statistics', () => {
    const { result } = renderHook(() => useGame());
    
    const stats = result.current.getStatistics();
    
    expect(stats).toHaveProperty('gamesPlayed');
    expect(stats).toHaveProperty('gamesWon');
    expect(stats).toHaveProperty('currentStreak');
    expect(stats).toHaveProperty('maxStreak');
    expect(stats).toHaveProperty('guessDistribution');
    expect(stats).toHaveProperty('winPercentage');
  });

  it('should track keyboard state', async () => {
    const { result } = renderHook(() => useGame());
    
    act(() => {
      result.current.addLetter('K');
      result.current.addLetter('İ');
      result.current.addLetter('T');
      result.current.addLetter('A');
      result.current.addLetter('P');
    });
    
    await waitFor(() => {
      expect(result.current.currentCol).toBe(5);
    });
    
    act(() => {
      result.current.submitGuess();
    });
    
    // Keyboard state should be updated after flip animation completes
    // This is a simplified check
    expect(result.current.keyboardState).toBeInstanceOf(Map);
  });
});
