import { describe, it, expect } from 'vitest';
import { GameState, TileState, Statistics, GuessResult } from '../types';

describe('Type Definitions', () => {
  describe('GameState', () => {
    it('should accept valid game states', () => {
      const states: GameState[] = ['IDLE', 'PLAYING', 'WIN', 'LOSE'];
      expect(states).toContain('IDLE');
      expect(states).toContain('PLAYING');
      expect(states).toContain('WIN');
      expect(states).toContain('LOSE');
    });
  });

  describe('TileState', () => {
    it('should accept valid tile states', () => {
      const states: TileState[] = ['empty', 'filled', 'correct', 'present', 'absent'];
      expect(states).toContain('empty');
      expect(states).toContain('filled');
      expect(states).toContain('correct');
      expect(states).toContain('present');
      expect(states).toContain('absent');
    });
  });

  describe('Statistics interface', () => {
    it('should create valid statistics object', () => {
      const stats: Statistics = {
        gamesPlayed: 10,
        gamesWon: 8,
        currentStreak: 3,
        maxStreak: 5,
        guessDistribution: [1, 2, 3, 2, 0, 0],
        winPercentage: 80,
      };

      expect(stats.gamesPlayed).toBe(10);
      expect(stats.gamesWon).toBe(8);
      expect(stats.currentStreak).toBe(3);
      expect(stats.maxStreak).toBe(5);
      expect(stats.guessDistribution).toHaveLength(6);
      expect(stats.winPercentage).toBe(80);
    });
  });

  describe('GuessResult interface', () => {
    it('should create valid guess result', () => {
      const result: GuessResult = {
        word: 'BİLGİ',
        tiles: ['correct', 'correct', 'correct', 'correct', 'correct'],
        isCorrect: true,
      };

      expect(result.word).toBe('BİLGİ');
      expect(result.tiles).toHaveLength(5);
      expect(result.isCorrect).toBe(true);
    });
  });
});
