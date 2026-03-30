/**
 * Word utilities for the Kelime Oyunu (Turkish Wordle)
 */

import { VALID_WORDS } from '../data/validWords';

export type LetterStatus = 'correct' | 'present' | 'absent';

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

/**
 * Normalize Turkish characters for comparison
 * This handles case-insensitive comparison with Turkish special characters
 */
export function normalizeTurkishChar(char: string): string {
  const upper = char.toUpperCase();
  return upper;
}

/**
 * Check if a character is a valid Turkish letter
 */
export function isValidTurkishLetter(char: string): boolean {
  const validLetters = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
  return validLetters.includes(char.toUpperCase());
}

/**
 * Validate if a guess is exactly 5 letters
 */
export function isValidLength(guess: string): boolean {
  return guess.length === 5;
}

/**
 * Check if a word is in the valid words list
 */
export function isValidGuess(word: string): boolean {
  const upperWord = word.toUpperCase();
  return VALID_WORDS.includes(upperWord);
}

/**
 * Get a random word from the valid words list
 */
export function getRandomWord(): string {
  const randomIndex = Math.floor(Math.random() * VALID_WORDS.length);
  return VALID_WORDS[randomIndex];
}

/**
 * Evaluate a guess against the target word
 * Returns an array of LetterResult indicating the status of each letter
 * 
 * Algorithm (Wordle-style):
 * 1. First pass: Mark exact matches (correct position)
 * 2. Second pass: Mark present matches (wrong position, but exists in target)
 *    - Only count each letter in target once
 *    - Don't override correct matches
 */
export function evaluateGuess(guess: string, target: string): LetterResult[] {
  const upperGuess = guess.toUpperCase();
  const upperTarget = target.toUpperCase();
  
  const result: LetterResult[] = [];
  const targetLetterCounts: Map<string, number> = new Map();
  
  // Initialize result array and count target letters
  for (let i = 0; i < 5; i++) {
    result.push({ letter: upperGuess[i], status: 'absent' });
    const letter = upperTarget[i];
    targetLetterCounts.set(letter, (targetLetterCounts.get(letter) || 0) + 1);
  }
  
  // First pass: Mark correct positions
  for (let i = 0; i < 5; i++) {
    if (upperGuess[i] === upperTarget[i]) {
      result[i].status = 'correct';
      // Decrement count for this letter
      const count = targetLetterCounts.get(upperGuess[i]) || 0;
      if (count > 0) {
        targetLetterCounts.set(upperGuess[i], count - 1);
      }
    }
  }
  
  // Second pass: Mark present (wrong position)
  for (let i = 0; i < 5; i++) {
    if (result[i].status === 'correct') continue;
    
    const letter = upperGuess[i];
    const count = targetLetterCounts.get(letter) || 0;
    
    if (count > 0) {
      result[i].status = 'present';
      targetLetterCounts.set(letter, count - 1);
    }
  }
  
  return result;
}

/**
 * Check if the guess is correct (all letters in correct position)
 */
export function isCorrectGuess(guess: string, target: string): boolean {
  return guess.toUpperCase() === target.toUpperCase();
}

/**
 * Get the word for a specific day (daily word)
 * Uses a simple algorithm based on the date
 */
export function getDailyWord(date: Date = new Date()): string {
  // Create a seed based on the date (year, month, day)
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Simple hash function to get consistent index for a date
  const seed = year * 10000 + month * 100 + day;
  const index = seed % VALID_WORDS.length;
  
  return VALID_WORDS[index];
}
