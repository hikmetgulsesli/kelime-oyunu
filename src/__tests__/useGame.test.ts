import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame, GameStatistics } from '../hooks/useGame';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useGame', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start in IDLE state', () => {
      const { result } = renderHook(() => useGame());
      expect(result.current.gameState).toBe('IDLE');
    });

    it('should start at row 0, tile 0', () => {
      const { result } = renderHook(() => useGame());
      expect(result.current.currentRow).toBe(0);
      expect(result.current.currentTile).toBe(0);
    });

    it('should have empty guesses array', () => {
      const { result } = renderHook(() => useGame());
      expect(result.current.guesses).toEqual([]);
    });

    it('should provide a target word', () => {
      const { result } = renderHook(() => useGame());
      expect(result.current.targetWord).toBeDefined();
      expect(result.current.targetWord.length).toBe(5);
    });
  });

  describe('State Machine Transitions', () => {
    it('should transition from IDLE to PLAYING on addLetter', () => {
      const { result } = renderHook(() => useGame());
      
      act(() => {
        result.current.addLetter('A');
      });

      expect(result.current.gameState).toBe('PLAYING');
    });

    it('should transition from PLAYING to WIN on correct guess', () => {
      const { result } = renderHook(() => useGame());
      const targetWord = result.current.targetWord;

      // Start game
      act(() => {
        result.current.addLetter('A');
      });

      // Submit correct guess
      act(() => {
        const response = result.current.submitGuess(targetWord);
        expect(response.success).toBe(true);
      });

      expect(result.current.gameState).toBe('WIN');
    });

    it('should transition from PLAYING to LOSE after 6 failed guesses', () => {
      const { result } = renderHook(() => useGame());
      const targetWord = result.current.targetWord;

      // Start game
      act(() => {
        result.current.addLetter('A');
      });

      // Use valid Turkish 5-letter words from the word list
      const allWords = ['CADDE', 'DAĞAR', 'HALAT', 'JETON', 'KAMAN', 'LAMBA', 'NADAS', 'PALAZ', 'RADAR',
                        'SABAN', 'TABAK', 'VAPUR', 'YABAN', 'ZAFER', 'BÖLGE', 'GÜNEŞ', 'KALEM', 'KİTAP', 'TARİH'];
      const wrongWords = allWords.filter(w => w !== targetWord).slice(0, 6);
      
      // Ensure we have 6 wrong words
      expect(wrongWords.length).toBe(6);
      
      wrongWords.forEach((word) => {
        act(() => {
          const response = result.current.submitGuess(word);
          expect(response.success).toBe(true);
        });
      });

      expect(result.current.gameState).toBe('LOSE');
    });

    it('should reset to IDLE on resetGame', () => {
      const { result } = renderHook(() => useGame());

      // Start and make a guess
      act(() => {
        result.current.addLetter('A');
        result.current.submitGuess('BÖLGE');
      });

      // Reset
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.gameState).toBe('IDLE');
      expect(result.current.currentRow).toBe(0);
      expect(result.current.currentTile).toBe(0);
      expect(result.current.guesses).toEqual([]);
    });
  });

  describe('submitGuess Validation', () => {
    it('should reject words with length != 5', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.addLetter('A');
      });

      act(() => {
        const response = result.current.submitGuess('KAL');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Kelime 5 harfli olmalı');
      });
    });

    it('should reject invalid Turkish words', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.addLetter('A');
      });

      act(() => {
        const response = result.current.submitGuess('XXXXX');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Geçerli bir kelime değil');
      });
    });

    it('should accept valid 5-letter Turkish words', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.addLetter('A');
      });

      act(() => {
        const response = result.current.submitGuess('BÖLGE');
        expect(response.success).toBe(true);
      });
    });
  });

  describe('Guess Evaluation', () => {
    it('should store guess with evaluation after submission', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.addLetter('A');
      });

      act(() => {
        result.current.submitGuess('BÖLGE');
      });

      expect(result.current.guesses.length).toBe(1);
      expect(result.current.guesses[0].word).toBe('BÖLGE');
      expect(result.current.guesses[0].evaluation).toBeDefined();
      expect(result.current.guesses[0].evaluation.length).toBe(5);
    });

    it('should advance row after successful guess', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.addLetter('A');
      });

      act(() => {
        result.current.submitGuess('BÖLGE');
      });

      expect(result.current.currentRow).toBe(1);
      expect(result.current.currentTile).toBe(0);
    });
  });

  describe('Statistics', () => {
    it('should return default statistics initially', () => {
      const { result } = renderHook(() => useGame());
      const stats = result.current.getStatistics();

      expect(stats.gamesPlayed).toBe(0);
      expect(stats.gamesWon).toBe(0);
      expect(stats.winPercentage).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.maxStreak).toBe(0);
      expect(stats.guessDistribution).toEqual([0, 0, 0, 0, 0, 0]);
    });

    it('should update statistics on win', () => {
      const { result } = renderHook(() => useGame());
      const targetWord = result.current.targetWord;

      act(() => {
        result.current.addLetter('A');
        result.current.submitGuess(targetWord);
      });

      const stats = result.current.getStatistics();
      expect(stats.gamesPlayed).toBe(1);
      expect(stats.gamesWon).toBe(1);
      expect(stats.winPercentage).toBe(100);
      expect(stats.currentStreak).toBe(1);
      expect(stats.maxStreak).toBe(1);
      expect(stats.guessDistribution[0]).toBe(1);
    });

    it('should update statistics on loss', () => {
      const { result } = renderHook(() => useGame());
      const targetWord = result.current.targetWord;

      act(() => {
        result.current.addLetter('A');
      });

      // Use valid Turkish 5-letter words from the word list
      const allWords = ['CADDE', 'DAĞAR', 'HALAT', 'JETON', 'KAMAN', 'LAMBA', 'NADAS', 'PALAZ', 'RADAR',
                        'SABAN', 'TABAK', 'VAPUR', 'YABAN', 'ZAFER', 'BÖLGE', 'GÜNEŞ', 'KALEM', 'KİTAP', 'TARİH'];
      const wrongWords = allWords.filter(w => w !== targetWord).slice(0, 6);
      
      // Ensure we have 6 wrong words
      expect(wrongWords.length).toBe(6);
      
      wrongWords.forEach((word) => {
        act(() => {
          result.current.submitGuess(word);
        });
      });

      const stats = result.current.getStatistics();
      expect(stats.gamesPlayed).toBe(1);
      expect(stats.gamesWon).toBe(0);
      expect(stats.winPercentage).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.maxStreak).toBe(0);
    });

    it('should track streaks correctly', () => {
      const { result } = renderHook(() => useGame());
      const targetWord = result.current.targetWord;

      // Win first game
      act(() => {
        result.current.addLetter('A');
        result.current.submitGuess(targetWord);
      });

      let stats = result.current.getStatistics();
      expect(stats.currentStreak).toBe(1);
      expect(stats.maxStreak).toBe(1);

      // Reset and win again
      act(() => {
        result.current.resetGame();
      });

      // Need to start a new game with a different target word
      // For this test, we'll just verify the stats persisted
      stats = result.current.getStatistics();
      expect(stats.gamesPlayed).toBe(1);
      expect(stats.currentStreak).toBe(1);
    });

    it('should persist statistics to localStorage', () => {
      const { result } = renderHook(() => useGame());
      const targetWord = result.current.targetWord;

      act(() => {
        result.current.addLetter('A');
        result.current.submitGuess(targetWord);
      });

      const stored = localStorageMock.getItem('kelime-oyunu-stats');
      expect(stored).toBeDefined();
      
      const parsed: GameStatistics = JSON.parse(stored!);
      expect(parsed.gamesPlayed).toBe(1);
      expect(parsed.gamesWon).toBe(1);
    });
  });

  describe('Game State Persistence', () => {
    it('should persist game state to localStorage', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.addLetter('A');
        result.current.submitGuess('BÖLGE');
      });

      const stored = localStorageMock.getItem('kelime-oyunu-state');
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.gameState).toBe('PLAYING');
      expect(parsed.guesses.length).toBe(1);
    });
  });

  describe('Tile Management', () => {
    it('should increment tile on addLetter', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.addLetter('A');
      });

      expect(result.current.currentTile).toBe(1);

      act(() => {
        result.current.addLetter('B');
      });

      expect(result.current.currentTile).toBe(2);
    });

    it('should not increment tile beyond 5', () => {
      const { result } = renderHook(() => useGame());

      // Add 5 letters
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.addLetter('A');
        });
      }

      expect(result.current.currentTile).toBe(5);

      // Try to add 6th
      act(() => {
        result.current.addLetter('B');
      });

      expect(result.current.currentTile).toBe(5);
    });

    it('should decrement tile on deleteLetter', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.addLetter('A');
        result.current.addLetter('B');
      });

      expect(result.current.currentTile).toBe(2);

      act(() => {
        result.current.deleteLetter();
      });

      expect(result.current.currentTile).toBe(1);
    });

    it('should not decrement tile below 0', () => {
      const { result } = renderHook(() => useGame());

      act(() => {
        result.current.deleteLetter();
      });

      expect(result.current.currentTile).toBe(0);
    });
  });

  describe('Game Over Behavior', () => {
    it('should not allow addLetter when game is won', () => {
      const { result } = renderHook(() => useGame());
      const targetWord = result.current.targetWord;

      act(() => {
        result.current.addLetter('A');
        result.current.submitGuess(targetWord);
      });

      expect(result.current.gameState).toBe('WIN');

      const previousTile = result.current.currentTile;
      
      act(() => {
        result.current.addLetter('Z');
      });

      expect(result.current.currentTile).toBe(previousTile);
    });

    it('should not allow submitGuess when game is lost', () => {
      const { result } = renderHook(() => useGame());
      const targetWord = result.current.targetWord;

      act(() => {
        result.current.addLetter('A');
      });

      // Use valid Turkish 5-letter words from the word list
      const allWords = ['CADDE', 'DAĞAR', 'HALAT', 'JETON', 'KAMAN', 'LAMBA', 'NADAS', 'PALAZ', 'RADAR',
                        'SABAN', 'TABAK', 'VAPUR', 'YABAN', 'ZAFER', 'BÖLGE', 'GÜNEŞ', 'KALEM', 'KİTAP', 'TARİH'];
      const wrongWords = allWords.filter(w => w !== targetWord).slice(0, 6);
      
      // Ensure we have 6 wrong words
      expect(wrongWords.length).toBe(6);
      
      wrongWords.forEach((word) => {
        act(() => {
          result.current.submitGuess(word);
        });
      });

      expect(result.current.gameState).toBe('LOSE');

      act(() => {
        const response = result.current.submitGuess('BÖLGE');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Oyun zaten bitti');
      });
    });
  });
});
