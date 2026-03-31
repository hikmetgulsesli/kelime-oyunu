/**
 * Word utilities for Kelime Oyunu
 * Handles word selection, validation, and evaluation
 */

import { VALID_WORDS } from '../data/validWords';
import { getDailySeed, getToday } from './dateUtils';

/**
 * Letter evaluation result
 */
export type LetterResult = 'correct' | 'present' | 'absent';

/**
 * Result of evaluating a single letter position
 */
export interface PositionResult {
  letter: string;
  result: LetterResult;
}

/**
 * Get the daily word based on a date string (YYYY-MM-DD format)
 * Returns consistent word for the same date across refreshes
 */
export function getDailyWord(dateString: string): string {
  const seed = getDailySeed(dateString);
  const index = seededRandom(seed, VALID_WORDS.length);
  return VALID_WORDS[index];
}

/**
 * Set for O(1) word lookup
 */
const VALID_WORDS_SET = new Set(VALID_WORDS);

/**
 * Normalize a string for Turkish case-insensitive comparison
 */
function turkishToUpper(word: string): string {
  return word.toLocaleUpperCase('tr-TR');
}

/**
 * Check if a guess is a valid word
 */
export function isValidGuess(word: string): boolean {
  if (!word || word.length !== 5) {
    return false;
  }
  
  const normalizedWord = turkishToUpper(word);
  return VALID_WORDS_SET.has(normalizedWord);
}

/**
 * Evaluate a guess against the target word
 * Returns color result for each letter position
 * 
 * Rules:
 * - 'correct' (green): Letter is in the correct position
 * - 'present' (yellow): Letter exists in the word but wrong position
 * - 'absent' (gray): Letter doesn't exist in the word
 * 
 * For duplicate letters:
 * - If the target has 1 'A' and guess has 2 'A's:
 *   - First 'A' in correct position → 'correct'
 *   - Second 'A' → 'absent' (target only has 1 'A')
 */
export function evaluateGuess(guess: string, target: string): PositionResult[] {
  // Normalize inputs with Turkish locale
  const normalizedGuess = guess.toLocaleUpperCase('tr-TR');
  const normalizedTarget = target.toLocaleUpperCase('tr-TR');
  
  if (normalizedGuess.length !== 5 || normalizedTarget.length !== 5) {
    throw new Error('Both guess and target must be 5 letters long');
  }
  
  const result: PositionResult[] = [];
  const targetLetters = normalizedTarget.split('');
  const guessLetters = normalizedGuess.split('');
  
  // Track which target positions are matched
  const targetMatched = new Array(5).fill(false);
  
  // First pass: mark correct positions
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = { letter: guessLetters[i], result: 'correct' };
      targetMatched[i] = true;
    }
  }
  
  // Second pass: mark present and absent
  for (let i = 0; i < 5; i++) {
    // Skip already marked as correct
    if (result[i]) continue;
    
    const letter = guessLetters[i];
    
    // Find if this letter exists in unmatched target positions
    let found = false;
    for (let j = 0; j < 5; j++) {
      if (!targetMatched[j] && targetLetters[j] === letter) {
        found = true;
        targetMatched[j] = true;
        break;
      }
    }
    
    result[i] = { letter, result: found ? 'present' : 'absent' };
  }
  
  return result;
}

/**
 * Seeded random number generator
 * Returns a number between 0 and max-1 based on the seed
 */
function seededRandom(seed: number, max: number): number {
  // Simple seeded RNG using Linear Congruential Generator
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;
  
  // Generate random value from seed
  const random = ((a * seed + c) % m) / m;
  
  return Math.floor(random * max);
}

/**
 * Get a random word from the valid words list
 * Useful for testing or non-daily modes
 */
export function getRandomWord(): string {
  const index = Math.floor(Math.random() * VALID_WORDS.length);
  return VALID_WORDS[index];
}

/**
 * Get word of the day for today
 */
export function getTodaysWord(): string {
  const today = getToday();
  return getDailyWord(today);
}
