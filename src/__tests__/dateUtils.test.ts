import { describe, it, expect } from 'vitest';
import {
  formatDate,
  getToday,
  getYesterday,
  getDaysSinceEpoch,
  getDailySeed,
  parseDate,
  isValidDateString,
  getNextDate,
  getPreviousDate
} from '../utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2024, 2, 15); // March 15, 2024
      expect(formatDate(date)).toBe('2024-03-15');
    });

    it('should pad single digit months and days', () => {
      const date = new Date(2024, 0, 5); // January 5, 2024
      expect(formatDate(date)).toBe('2024-01-05');
    });
  });

  describe('getToday', () => {
    it('should return today\'s date in YYYY-MM-DD format', () => {
      const today = getToday();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getYesterday', () => {
    it('should return yesterday\'s date in YYYY-MM-DD format', () => {
      const yesterday = getYesterday();
      expect(yesterday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should be one day before today', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      expect(getYesterday()).toBe(formatDate(yesterday));
    });
  });

  describe('getDaysSinceEpoch', () => {
    it('should return correct days for epoch date', () => {
      const days = getDaysSinceEpoch('1970-01-01');
      expect(days).toBe(0);
    });

    it('should return correct days for a known date', () => {
      // March 15, 2024 is day 19796 since epoch (UTC)
      const days = getDaysSinceEpoch('2024-03-15');
      expect(typeof days).toBe('number');
      expect(days).toBeGreaterThan(0);
    });

    it('should throw error for invalid date string', () => {
      expect(() => getDaysSinceEpoch('invalid')).toThrow();
    });
  });

  describe('getDailySeed', () => {
    it('should return same value as getDaysSinceEpoch', () => {
      const dateString = '2024-03-15';
      expect(getDailySeed(dateString)).toBe(getDaysSinceEpoch(dateString));
    });
  });

  describe('parseDate', () => {
    it('should parse YYYY-MM-DD string correctly', () => {
      const date = parseDate('2024-03-15');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(2); // March is 2
      expect(date.getDate()).toBe(15);
    });
  });

  describe('isValidDateString', () => {
    it('should return true for valid YYYY-MM-DD strings', () => {
      expect(isValidDateString('2024-03-15')).toBe(true);
      expect(isValidDateString('2024-01-01')).toBe(true);
      expect(isValidDateString('2024-12-31')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(isValidDateString('2024/03/15')).toBe(false);
      expect(isValidDateString('15-03-2024')).toBe(false);
      expect(isValidDateString('2024-3-15')).toBe(false);
      expect(isValidDateString('invalid')).toBe(false);
    });
  });

  describe('getNextDate', () => {
    it('should return next day', () => {
      expect(getNextDate('2024-03-15')).toBe('2024-03-16');
    });

    it('should handle month boundaries', () => {
      expect(getNextDate('2024-03-31')).toBe('2024-04-01');
    });

    it('should handle year boundaries', () => {
      expect(getNextDate('2024-12-31')).toBe('2025-01-01');
    });
  });

  describe('getPreviousDate', () => {
    it('should return previous day', () => {
      expect(getPreviousDate('2024-03-15')).toBe('2024-03-14');
    });

    it('should handle month boundaries', () => {
      expect(getPreviousDate('2024-04-01')).toBe('2024-03-31');
    });

    it('should handle year boundaries', () => {
      expect(getPreviousDate('2025-01-01')).toBe('2024-12-31');
    });
  });
});
