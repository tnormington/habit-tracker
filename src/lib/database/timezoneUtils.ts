'use client';

/**
 * Timezone Utilities
 *
 * Centralized date/time utilities that respect user's timezone.
 * All habit completion logic should use these functions to ensure
 * consistent day boundaries based on user's local time.
 */

/**
 * Get the user's current timezone from browser
 * Falls back to UTC if not available
 */
export function getUserTimezone(): string {
  if (typeof window === 'undefined') {
    return 'UTC';
  }
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Format a Date object to YYYY-MM-DD string in a specific timezone
 *
 * @param date - The date to format
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateInTimezone(date: Date, timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    // Fallback to local date formatting if timezone is invalid
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Get today's date in YYYY-MM-DD format for a specific timezone
 *
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns Today's date string in YYYY-MM-DD format
 */
export function getTodayInTimezone(timezone: string): string {
  return formatDateInTimezone(new Date(), timezone);
}

/**
 * Get today's date in YYYY-MM-DD format using the browser's local timezone
 * This is the main function components should use for getting "today"
 *
 * @returns Today's date string in YYYY-MM-DD format
 */
export function getLocalTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get yesterday's date in YYYY-MM-DD format for a specific timezone
 *
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns Yesterday's date string in YYYY-MM-DD format
 */
export function getYesterdayInTimezone(timezone: string): string {
  const now = new Date();
  // Get the current time in the target timezone
  const todayStr = getTodayInTimezone(timezone);
  // Parse it back and subtract a day
  const today = new Date(todayStr + 'T12:00:00'); // Use noon to avoid DST issues
  today.setDate(today.getDate() - 1);
  return formatDateInTimezone(today, timezone);
}

/**
 * Get yesterday's date in YYYY-MM-DD format using the browser's local timezone
 *
 * @returns Yesterday's date string in YYYY-MM-DD format
 */
export function getLocalYesterdayDate(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a date string to get the components in the local timezone
 * Use noon to avoid timezone/DST edge cases
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object set to noon on that date in local time
 */
export function parseDateString(dateStr: string): Date {
  return new Date(dateStr + 'T12:00:00');
}

/**
 * Add days to a date string
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param days - Number of days to add (can be negative)
 * @returns New date string in YYYY-MM-DD format
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const date = parseDateString(dateStr);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the start of the week (Monday) for a given date
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date string for Monday of that week
 */
export function getStartOfWeek(dateStr: string): string {
  const date = parseDateString(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(date);
  monday.setDate(diff);
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const dayNum = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayNum}`;
}

/**
 * Get the end of the week (Sunday) for a given date
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date string for Sunday of that week
 */
export function getEndOfWeek(dateStr: string): string {
  const startOfWeek = getStartOfWeek(dateStr);
  return addDaysToDate(startOfWeek, 6);
}

/**
 * Get the start of the month for a given date
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date string for the first day of that month
 */
export function getStartOfMonth(dateStr: string): string {
  return dateStr.substring(0, 7) + '-01';
}

/**
 * Get the end of the month for a given date
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date string for the last day of that month
 */
export function getEndOfMonth(dateStr: string): string {
  const date = parseDateString(dateStr);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const year = lastDay.getFullYear();
  const month = String(lastDay.getMonth() + 1).padStart(2, '0');
  const day = String(lastDay.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the number of days between two date strings
 *
 * @param startDateStr - Start date in YYYY-MM-DD format
 * @param endDateStr - End date in YYYY-MM-DD format
 * @returns Number of days between the dates
 */
export function daysBetween(startDateStr: string, endDateStr: string): number {
  const start = parseDateString(startDateStr);
  const end = parseDateString(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if two dates are consecutive (differ by exactly 1 day)
 *
 * @param dateStr1 - First date in YYYY-MM-DD format
 * @param dateStr2 - Second date in YYYY-MM-DD format
 * @returns True if dates are consecutive
 */
export function areDatesConsecutive(dateStr1: string, dateStr2: string): boolean {
  return Math.abs(daysBetween(dateStr1, dateStr2)) === 1;
}

/**
 * Get the day of week (0 = Sunday, 6 = Saturday) for a date string
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Day of week number
 */
export function getDayOfWeek(dateStr: string): number {
  return parseDateString(dateStr).getDay();
}

/**
 * Generate an array of date strings between start and end (inclusive)
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Array of date strings
 */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = startDate;
  while (current <= endDate) {
    dates.push(current);
    current = addDaysToDate(current, 1);
  }
  return dates;
}

/**
 * Get the week key (YYYY-Wnn) for a date string
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Week key string
 */
export function getWeekKey(dateStr: string): string {
  const date = parseDateString(dateStr);
  const year = date.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const weekNumber = Math.ceil((dayOfYear + firstDay.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Get the month key (YYYY-MM) for a date string
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Month key string
 */
export function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7);
}

/**
 * Validate that a timezone string is valid
 *
 * @param timezone - Timezone string to validate
 * @returns True if valid IANA timezone
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}
