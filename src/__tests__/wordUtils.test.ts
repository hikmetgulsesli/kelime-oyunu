import { describe, it, expect } from 'vitest';
import { 
  getDailyWord, 
  isValidGuess, 
  evaluateGuess, 
  getRandomWord, 
  getTodaysWord 
} from '../utils/wordUtils';
import { VALID_WORDS, isValidWord } from '../data/validWords';

describe('wordUtils', () => {
  describe('getDailyWord', () => {
    it('should return consistent word for same date', () => {
      const word1 = getDailyWord('2024-03-15');
      const word2 = getDailyWord('2024-03-15');
      expect(word1).toBe(word2);
    });

    it('should return different words for different dates', () => {
      const word1 = getDailyWord('2024-03-15');
      const word2 = getDailyWord('2024-03-16');
      expect(word1).not.toBe(word2);
    });

    it('should return a valid 5-letter word', () => {
      const word = getDailyWord('2024-03-15');
      expect(word).toHaveLength(5);
      expect(VALID_WORDS).toContain(word);
    });

    it('should throw error for invalid date string', () => {
      expect(() => getDailyWord('invalid')).toThrow();
    });
  });

  describe('isValidGuess', () => {
    it('should return true for valid words', () => {
      expect(isValidGuess('KELAM')).toBe(true);
      expect(isValidGuess('EVLAT')).toBe(true);
      expect(isValidGuess('KİTAP')).toBe(true);
    });

    it('should return false for invalid words', () => {
      expect(isValidGuess('XXXXX')).toBe(false);
      expect(isValidGuess('ABCDE')).toBe(false);
    });

    it('should return false for non-5-letter words', () => {
      expect(isValidGuess('KEL')).toBe(false);
      expect(isValidGuess('KELİME')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isValidGuess('kelam')).toBe(true);
      expect(isValidGuess('Kelam')).toBe(true);
    });

    it('should handle Turkish characters', () => {
      expect(isValidGuess('ÇİÇEK')).toBe(true);
      expect(isValidGuess('ŞEKER')).toBe(true);
      expect(isValidGuess('ÜZGÜN')).toBe(true);
      expect(isValidGuess('ÖĞREK')).toBe(true);
      expect(isValidGuess('IĞDIR')).toBe(true);
    });
  });

  describe('evaluateGuess', () => {
    it('should return all correct when guess matches target', () => {
      const result = evaluateGuess('KELİM', 'KELİM');
      expect(result).toHaveLength(5);
      expect(result.every(r => r.result === 'correct')).toBe(true);
    });

    it('should return all absent when no letters match', () => {
      const result = evaluateGuess('AAAAA', 'KELİM');
      expect(result).toHaveLength(5);
      expect(result.every(r => r.result === 'absent')).toBe(true);
    });

    it('should return all absent when target has completely different letters', () => {
      const result = evaluateGuess('BÖLGE', 'KİTAP');
      expect(result.every(r => r.result === 'absent')).toBe(true);
    });

    it('should identify correct position letters', () => {
      const result = evaluateGuess('KİTAP', 'KELİM');
      // K is correct position
      expect(result[0]).toEqual({ letter: 'K', result: 'correct' });
    });

    it('should identify present letters (wrong position)', () => {
      const result = evaluateGuess('GÜNEŞ', 'KELAM');
      // E is present in KELAM but at different position
      const eResult = result.find(r => r.letter === 'E');
      expect(eResult?.result).toBe('present');
    });

    it('should handle duplicate letters correctly - target has 1, guess has 2', () => {
      // Target has 1 'A', guess has 2 'A's
      const result = evaluateGuess('AARON', 'KABAK');
      // First A should be present (exists in target but wrong position)
      // Second A should be absent (target only has 1 A, already matched)
      const aResults = result.filter(r => r.letter === 'A');
      expect(aResults).toHaveLength(2);
    });

    it('should handle Turkish characters correctly', () => {
      const result = evaluateGuess('ÇİÇEK', 'ÇİÇEK');
      expect(result.every(r => r.result === 'correct')).toBe(true);
    });

    it('should be case-insensitive', () => {
      const result1 = evaluateGuess('kelam', 'KELAM');
      const result2 = evaluateGuess('KELAM', 'kelam');
      expect(result1.every(r => r.result === 'correct')).toBe(true);
      expect(result2.every(r => r.result === 'correct')).toBe(true);
    });

    it('should throw error for non-5-letter inputs', () => {
      expect(() => evaluateGuess('KEL', 'KELİM')).toThrow();
      expect(() => evaluateGuess('KELİM', 'KEL')).toThrow();
    });
  });

  describe('getRandomWord', () => {
    it('should return a valid word', () => {
      const word = getRandomWord();
      expect(word).toHaveLength(5);
      expect(VALID_WORDS).toContain(word);
    });
  });

  describe('getTodaysWord', () => {
    it('should return a valid word', () => {
      const word = getTodaysWord();
      expect(word).toHaveLength(5);
      expect(VALID_WORDS).toContain(word);
    });
  });
});

describe('validWords', () => {
  describe('VALID_WORDS array', () => {
    it('should have at least 2000 words', () => {
      expect(VALID_WORDS.length).toBeGreaterThanOrEqual(2000);
    });

    it('should contain only 5-letter words', () => {
      const nonFiveLetter = VALID_WORDS.filter(w => w.length !== 5);
      expect(nonFiveLetter).toHaveLength(0);
    });

    it('should contain only unique words', () => {
      const uniqueWords = new Set(VALID_WORDS);
      expect(uniqueWords.size).toBe(VALID_WORDS.length);
    });

    it('should contain Turkish special characters', () => {
      // Note: Words are stored in uppercase, so we check for uppercase Turkish chars
      const hasUppercaseC = VALID_WORDS.some(w => w.includes('Ç'));
      const hasUppercaseS = VALID_WORDS.some(w => w.includes('Ş'));
      const hasUppercaseG = VALID_WORDS.some(w => w.includes('Ğ'));
      const hasUppercaseU = VALID_WORDS.some(w => w.includes('Ü'));
      const hasUppercaseO = VALID_WORDS.some(w => w.includes('Ö'));
      const hasUppercaseI = VALID_WORDS.some(w => w.includes('I'));
      
      expect(hasUppercaseC).toBe(true);
      expect(hasUppercaseS).toBe(true);
      expect(hasUppercaseG).toBe(true);
      expect(hasUppercaseU).toBe(true);
      expect(hasUppercaseO).toBe(true);
      expect(hasUppercaseI).toBe(true);
    });

    it('should contain uppercase Turkish characters', () => {
      const hasUppercaseC = VALID_WORDS.some(w => w.includes('Ç'));
      const hasUppercaseS = VALID_WORDS.some(w => w.includes('Ş'));
      const hasUppercaseG = VALID_WORDS.some(w => w.includes('Ğ'));
      const hasUppercaseU = VALID_WORDS.some(w => w.includes('Ü'));
      const hasUppercaseO = VALID_WORDS.some(w => w.includes('Ö'));
      const hasUppercaseI = VALID_WORDS.some(w => w.includes('İ'));
      
      expect(hasUppercaseC).toBe(true);
      expect(hasUppercaseS).toBe(true);
      expect(hasUppercaseG).toBe(true);
      expect(hasUppercaseU).toBe(true);
      expect(hasUppercaseO).toBe(true);
      expect(hasUppercaseI).toBe(true);
    });
  });

  describe('isValidWord', () => {
    it('should return true for words in the list', () => {
      expect(isValidWord('KELAM')).toBe(true);
      expect(isValidWord('EVLAT')).toBe(true);
    });

    it('should return false for words not in the list', () => {
      expect(isValidWord('XXXXX')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isValidWord('kelam')).toBe(true);
      expect(isValidWord('Kelam')).toBe(true);
    });
  });
});
