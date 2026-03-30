/**
 * Word utilities for Kelime Oyunu
 * Handles word selection, validation, and evaluation
 */

import { VALID_WORDS } from '../data/validWords';

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
  // Parse the date
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  
  // Create a seed from the date (days since epoch)
  const seed = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  
  // Use seeded random to select word
  const index = seededRandom(seed, VALID_WORDS.length);
  
  return VALID_WORDS[index];
}

/**
 * Check if a guess is a valid word
 */
export function isValidGuess(word: string): boolean {
  if (!word || word.length !== 5) {
    return false;
  }
  
  const normalizedWord = word.toUpperCase();
  return VALID_WORDS.includes(normalizedWord);
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
  // Normalize inputs
  const normalizedGuess = guess.toUpperCase();
  const normalizedTarget = target.toUpperCase();
  
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
  const today = new Date().toISOString().split('T')[0];
  return getDailyWord(today);
}
