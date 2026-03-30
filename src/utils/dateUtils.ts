/**
 * Date utilities for Kelime Oyunu
 * Handles daily seed calculation and date formatting
 */

/**
 * Format a date as YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getToday(): string {
  return formatDate(new Date());
}

/**
 * Get yesterday's date as YYYY-MM-DD string
 */
export function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

/**
 * Calculate days since epoch for a given date string
 * Used for generating consistent daily seeds
 */
export function getDaysSinceEpoch(dateString: string): number {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  
  // Get UTC midnight of the date
  const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const epoch = Date.UTC(1970, 0, 1);
  
  return Math.floor((utcDate - epoch) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate daily seed from date string
 * Returns a number that can be used for seeded random generation
 */
export function getDailySeed(dateString: string): number {
  return getDaysSinceEpoch(dateString);
}

/**
 * Parse a YYYY-MM-DD string into a Date object
 * Returns local date at midnight
 */
export function parseDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Check if a string is a valid YYYY-MM-DD date
 */
export function isValidDateString(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Get the next date string
 */
export function getNextDate(dateString: string): string {
  const date = parseDate(dateString);
  date.setDate(date.getDate() + 1);
  return formatDate(date);
}

/**
 * Get the previous date string
 */
export function getPreviousDate(dateString: string): string {
  const date = parseDate(dateString);
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}
