/**
 * Date utilities for the Kelime Oyunu
 */

/**
 * Get today's date at midnight (for consistent daily word)
 */
export function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the number of days since a start date
 */
export function getDaysSince(startDate: Date, currentDate: Date = new Date()): number {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const current = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const diffTime = current.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Get yesterday's date
 */
export function getYesterday(): Date {
  const yesterday = getToday();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}
