'use client';

/**
 * Streak Service Functions
 * Service layer for calculating habit streaks including current streak,
 * longest streak, and streak history for both positive and negative habits.
 */

import { getDatabase } from './database';
import type {
  HabitDocType,
  HabitLogDocType,
  HabitTrackerDatabase,
  HabitType,
  HabitFrequency,
} from './types';

// ============================================================================
// Types
// ============================================================================

/**
 * Streak data for a single habit
 */
export interface StreakData {
  /** The habit ID */
  habitId: string;
  /** Current consecutive streak (days) */
  currentStreak: number;
  /** Longest streak ever achieved (days) */
  longestStreak: number;
  /** Date when the current streak started (YYYY-MM-DD) */
  currentStreakStartDate: string | null;
  /** Date when the current streak ends/ended (YYYY-MM-DD, typically today or yesterday) */
  currentStreakEndDate: string | null;
  /** Start date of the longest streak (YYYY-MM-DD) */
  longestStreakStartDate: string | null;
  /** End date of the longest streak (YYYY-MM-DD) */
  longestStreakEndDate: string | null;
  /** Whether the streak is currently active (includes today or yesterday) */
  isStreakActive: boolean;
  /** Last date the habit was completed/avoided (YYYY-MM-DD) */
  lastActivityDate: string | null;
}

/**
 * A single streak period
 */
export interface StreakPeriod {
  /** Start date of the streak (YYYY-MM-DD) */
  startDate: string;
  /** End date of the streak (YYYY-MM-DD) */
  endDate: string;
  /** Length of the streak in days */
  length: number;
}

/**
 * Complete streak history for a habit
 */
export interface StreakHistory {
  /** The habit ID */
  habitId: string;
  /** All streak periods, ordered by start date descending (most recent first) */
  streaks: StreakPeriod[];
  /** Total number of completed/avoided days */
  totalSuccessDays: number;
  /** Total number of tracked days */
  totalTrackedDays: number;
  /** Success rate as a percentage (0-100) */
  successRate: number;
}

/**
 * Result of a streak service operation
 */
export interface StreakServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StreakServiceError;
}

/**
 * Custom error class for streak service operations
 */
export class StreakServiceError extends Error {
  constructor(
    message: string,
    public readonly code: StreakServiceErrorCode,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'StreakServiceError';
  }
}

/**
 * Error codes for streak service operations
 */
export enum StreakServiceErrorCode {
  DATABASE_NOT_INITIALIZED = 'DATABASE_NOT_INITIALIZED',
  HABIT_NOT_FOUND = 'HABIT_NOT_FOUND',
  OPERATION_FAILED = 'OPERATION_FAILED',
  INVALID_INPUT = 'INVALID_INPUT',
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get database instance with error handling
 */
async function getDatabaseOrThrow(): Promise<HabitTrackerDatabase> {
  try {
    return await getDatabase();
  } catch (error) {
    throw new StreakServiceError(
      'Database not initialized',
      StreakServiceErrorCode.DATABASE_NOT_INITIALIZED,
      error
    );
  }
}

/**
 * Get today's date in YYYY-MM-DD format using local timezone
 * This ensures streak calculations use the user's local day boundaries
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get yesterday's date in YYYY-MM-DD format using local timezone
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a date string and return new date string
 * Uses noon to avoid DST edge cases
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T12:00:00');
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the difference in days between two date strings
 */
function daysBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if two dates are consecutive (differ by exactly 1 day)
 */
function areDatesConsecutive(dateStr1: string, dateStr2: string): boolean {
  return Math.abs(daysBetween(dateStr1, dateStr2)) === 1;
}

/**
 * Determine if a log counts as "success" based on habit type
 * - Positive habits: completed=true is success
 * - Negative habits: completed=false is success (avoided the bad habit)
 */
function isSuccessForHabitType(
  completed: boolean,
  habitType: HabitType
): boolean {
  return habitType === 'positive' ? completed : !completed;
}

/**
 * Generate all dates between start and end (inclusive)
 */
function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = startDate;
  while (current <= endDate) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

/**
 * Get the week number for a date (ISO week number)
 */
function getWeekKey(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  // Get the first day of the year
  const firstDay = new Date(year, 0, 1);
  // Calculate week number
  const dayOfYear = Math.floor((date.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const weekNumber = Math.ceil((dayOfYear + firstDay.getDay()) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Get the month key for a date (YYYY-MM)
 */
function getMonthKey(dateStr: string): string {
  return dateStr.substring(0, 7);
}

/**
 * Get the period key for a date based on frequency
 */
function getPeriodKey(dateStr: string, frequency: HabitFrequency): string {
  switch (frequency) {
    case 'daily':
      return dateStr;
    case 'weekly':
      return getWeekKey(dateStr);
    case 'monthly':
      return getMonthKey(dateStr);
  }
}

/**
 * Get current period key based on frequency
 */
function getCurrentPeriodKey(frequency: HabitFrequency): string {
  const today = getTodayDateString();
  return getPeriodKey(today, frequency);
}

/**
 * Get previous period key based on frequency
 */
function getPreviousPeriodKey(frequency: HabitFrequency): string {
  const today = getTodayDateString();
  switch (frequency) {
    case 'daily':
      return getYesterdayDateString();
    case 'weekly': {
      // Get last week
      const lastWeek = addDays(today, -7);
      return getWeekKey(lastWeek);
    }
    case 'monthly': {
      // Get last month
      const date = new Date(today);
      date.setMonth(date.getMonth() - 1);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }
  }
}

/**
 * Check if two period keys are consecutive based on frequency
 */
function arePeriodsConsecutive(period1: string, period2: string, frequency: HabitFrequency): boolean {
  if (frequency === 'daily') {
    // For daily, use the existing date-based consecutive check
    return areDatesConsecutive(period1, period2);
  }

  if (frequency === 'weekly') {
    // Parse week keys (YYYY-Wnn)
    const match1 = period1.match(/^(\d{4})-W(\d{2})$/);
    const match2 = period2.match(/^(\d{4})-W(\d{2})$/);
    if (!match1 || !match2) return false;

    const [, year1, week1] = match1;
    const [, year2, week2] = match2;

    const y1 = parseInt(year1);
    const w1 = parseInt(week1);
    const y2 = parseInt(year2);
    const w2 = parseInt(week2);

    // Same year, consecutive weeks
    if (y1 === y2) {
      return Math.abs(w1 - w2) === 1;
    }

    // Different years (end of year transition)
    if (y2 === y1 + 1 && w2 === 1) {
      // Check if w1 is last week of year (usually 52 or 53)
      return w1 >= 52;
    }
    if (y1 === y2 + 1 && w1 === 1) {
      return w2 >= 52;
    }

    return false;
  }

  if (frequency === 'monthly') {
    // Parse month keys (YYYY-MM)
    const [year1, month1] = period1.split('-').map(Number);
    const [year2, month2] = period2.split('-').map(Number);

    // Same year, consecutive months
    if (year1 === year2) {
      return Math.abs(month1 - month2) === 1;
    }

    // Year transition
    if (year2 === year1 + 1 && month1 === 12 && month2 === 1) {
      return true;
    }
    if (year1 === year2 + 1 && month2 === 12 && month1 === 1) {
      return true;
    }

    return false;
  }

  return false;
}

// ============================================================================
// Core Streak Calculation Functions
// ============================================================================

/**
 * Calculate streak data for a single habit
 *
 * @param habitId - The habit ID
 * @returns Promise with streak data or error
 *
 * @example
 * ```ts
 * const result = await calculateStreakForHabit('habit_123');
 * if (result.success && result.data) {
 *   console.log(`Current streak: ${result.data.currentStreak} days`);
 * }
 * ```
 */
export async function calculateStreakForHabit(
  habitId: string
): Promise<StreakServiceResult<StreakData>> {
  if (!habitId || typeof habitId !== 'string') {
    return {
      success: false,
      error: new StreakServiceError(
        'Invalid habit ID',
        StreakServiceErrorCode.INVALID_INPUT
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();

    // Get the habit to determine its type
    const habit = await db.habits.findOne(habitId).exec();
    if (!habit) {
      return {
        success: false,
        error: new StreakServiceError(
          `Habit with ID "${habitId}" not found`,
          StreakServiceErrorCode.HABIT_NOT_FOUND
        ),
      };
    }

    const habitData = habit.toJSON() as HabitDocType;
    const habitType = habitData.type;
    // Negative habits are always treated as daily for streak calculations
    const frequency = habitType === 'negative' ? 'daily' : (habitData.frequency || 'daily');

    // Get all logs for this habit, sorted by date ascending
    const logs = await db.habit_logs
      .find({
        selector: { habitId },
      })
      .exec();

    const logsData = logs
      .map((doc) => doc.toJSON() as HabitLogDocType)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate streaks based on frequency
    const streakData = calculateStreaksFromLogs(logsData, habitType, frequency);

    return {
      success: true,
      data: {
        habitId,
        ...streakData,
      },
    };
  } catch (error) {
    if (error instanceof StreakServiceError) {
      return { success: false, error };
    }
    return {
      success: false,
      error: new StreakServiceError(
        'Failed to calculate streak',
        StreakServiceErrorCode.OPERATION_FAILED,
        error
      ),
    };
  }
}

/**
 * Calculate streaks from an array of logs
 * Internal function that does the heavy lifting
 */
function calculateStreaksFromLogs(
  logs: HabitLogDocType[],
  habitType: HabitType,
  frequency: HabitFrequency = 'daily'
): Omit<StreakData, 'habitId'> {
  const currentPeriod = getCurrentPeriodKey(frequency);
  const previousPeriod = getPreviousPeriodKey(frequency);

  // Default empty streak data
  const emptyData: Omit<StreakData, 'habitId'> = {
    currentStreak: 0,
    longestStreak: 0,
    currentStreakStartDate: null,
    currentStreakEndDate: null,
    longestStreakStartDate: null,
    longestStreakEndDate: null,
    isStreakActive: false,
    lastActivityDate: null,
  };

  if (logs.length === 0) {
    return emptyData;
  }

  // For daily frequency, use the original date-based calculation
  if (frequency === 'daily') {
    return calculateDailyStreaksFromLogs(logs, habitType);
  }

  // For weekly/monthly, aggregate by period
  // Create a map of period -> success status (any success in that period counts)
  const periodSuccessMap = new Map<string, { success: boolean; firstDate: string; lastDate: string }>();

  for (const log of logs) {
    const periodKey = getPeriodKey(log.date, frequency);
    const success = isSuccessForHabitType(log.completed, habitType);

    const existing = periodSuccessMap.get(periodKey);
    if (existing) {
      // If any log in the period is successful, mark the period as successful
      existing.success = existing.success || success;
      existing.lastDate = log.date > existing.lastDate ? log.date : existing.lastDate;
    } else {
      periodSuccessMap.set(periodKey, { success, firstDate: log.date, lastDate: log.date });
    }
  }

  // Find all successful periods and sort them
  const successPeriods = Array.from(periodSuccessMap.entries())
    .filter(([, data]) => data.success)
    .map(([period, data]) => ({ period, ...data }))
    .sort((a, b) => a.period.localeCompare(b.period));

  if (successPeriods.length === 0) {
    return emptyData;
  }

  // Calculate streak periods based on consecutive periods
  const streakPeriods = calculatePeriodStreaks(successPeriods, frequency);

  if (streakPeriods.length === 0) {
    return emptyData;
  }

  // Find longest streak
  let longestStreak = streakPeriods[0];
  for (const streak of streakPeriods) {
    if (streak.length > longestStreak.length) {
      longestStreak = streak;
    }
  }

  // Determine current streak
  const mostRecentStreak = streakPeriods[streakPeriods.length - 1];
  const lastSuccessDate = successPeriods[successPeriods.length - 1].lastDate;
  const lastSuccessPeriod = successPeriods[successPeriods.length - 1].period;

  let currentStreak = 0;
  let currentStreakStartDate: string | null = null;
  let currentStreakEndDate: string | null = null;
  let isStreakActive = false;

  // Check if the most recent streak is still "active"
  // A streak is active if it includes the current period or previous period
  if (lastSuccessPeriod === currentPeriod || lastSuccessPeriod === previousPeriod) {
    currentStreak = mostRecentStreak.length;
    currentStreakStartDate = mostRecentStreak.startDate;
    currentStreakEndDate = mostRecentStreak.endDate;
    isStreakActive = true;
  } else if (arePeriodsConsecutive(lastSuccessPeriod, currentPeriod, frequency)) {
    // If streak ended in the previous period, it's still considered active
    currentStreak = mostRecentStreak.length;
    currentStreakStartDate = mostRecentStreak.startDate;
    currentStreakEndDate = mostRecentStreak.endDate;
    isStreakActive = true;
  }

  return {
    currentStreak,
    longestStreak: longestStreak.length,
    currentStreakStartDate,
    currentStreakEndDate,
    longestStreakStartDate: longestStreak.startDate,
    longestStreakEndDate: longestStreak.endDate,
    isStreakActive,
    lastActivityDate: lastSuccessDate,
  };
}

/**
 * Calculate daily streaks from logs (original algorithm)
 */
function calculateDailyStreaksFromLogs(
  logs: HabitLogDocType[],
  habitType: HabitType
): Omit<StreakData, 'habitId'> {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const emptyData: Omit<StreakData, 'habitId'> = {
    currentStreak: 0,
    longestStreak: 0,
    currentStreakStartDate: null,
    currentStreakEndDate: null,
    longestStreakStartDate: null,
    longestStreakEndDate: null,
    isStreakActive: false,
    lastActivityDate: null,
  };

  // Create a map of date -> success status
  const dateSuccessMap = new Map<string, boolean>();
  for (const log of logs) {
    const success = isSuccessForHabitType(log.completed, habitType);
    dateSuccessMap.set(log.date, success);
  }

  // Find all success dates and sort them
  const successDates = Array.from(dateSuccessMap.entries())
    .filter(([, success]) => success)
    .map(([date]) => date)
    .sort();

  if (successDates.length === 0) {
    return emptyData;
  }

  // Calculate all streak periods
  const streakPeriods = calculateStreakPeriods(successDates);

  if (streakPeriods.length === 0) {
    return emptyData;
  }

  // Find longest streak
  let longestStreak = streakPeriods[0];
  for (const streak of streakPeriods) {
    if (streak.length > longestStreak.length) {
      longestStreak = streak;
    }
  }

  // Determine current streak
  const mostRecentStreak = streakPeriods[streakPeriods.length - 1];
  const lastSuccessDate = successDates[successDates.length - 1];

  let currentStreak = 0;
  let currentStreakStartDate: string | null = null;
  let currentStreakEndDate: string | null = null;
  let isStreakActive = false;

  if (mostRecentStreak.endDate === today || mostRecentStreak.endDate === yesterday) {
    currentStreak = mostRecentStreak.length;
    currentStreakStartDate = mostRecentStreak.startDate;
    currentStreakEndDate = mostRecentStreak.endDate;
    isStreakActive = true;
  } else if (daysBetween(mostRecentStreak.endDate, today) === 1) {
    currentStreak = mostRecentStreak.length;
    currentStreakStartDate = mostRecentStreak.startDate;
    currentStreakEndDate = mostRecentStreak.endDate;
    isStreakActive = true;
  }

  return {
    currentStreak,
    longestStreak: longestStreak.length,
    currentStreakStartDate,
    currentStreakEndDate,
    longestStreakStartDate: longestStreak.startDate,
    longestStreakEndDate: longestStreak.endDate,
    isStreakActive,
    lastActivityDate: lastSuccessDate,
  };
}

/**
 * Calculate streak periods based on consecutive periods (weeks or months)
 */
function calculatePeriodStreaks(
  successPeriods: Array<{ period: string; firstDate: string; lastDate: string }>,
  frequency: HabitFrequency
): StreakPeriod[] {
  if (successPeriods.length === 0) {
    return [];
  }

  const streaks: StreakPeriod[] = [];
  let streakStart = successPeriods[0];
  let streakEnd = successPeriods[0];
  let streakLength = 1;

  for (let i = 1; i < successPeriods.length; i++) {
    const current = successPeriods[i];
    const previous = successPeriods[i - 1];

    if (arePeriodsConsecutive(previous.period, current.period, frequency)) {
      // Extend current streak
      streakEnd = current;
      streakLength++;
    } else {
      // End current streak and start new one
      streaks.push({
        startDate: streakStart.firstDate,
        endDate: streakEnd.lastDate,
        length: streakLength,
      });
      streakStart = current;
      streakEnd = current;
      streakLength = 1;
    }
  }

  // Don't forget the last streak
  streaks.push({
    startDate: streakStart.firstDate,
    endDate: streakEnd.lastDate,
    length: streakLength,
  });

  return streaks;
}

/**
 * Calculate streak periods from sorted success dates
 */
function calculateStreakPeriods(sortedDates: string[]): StreakPeriod[] {
  if (sortedDates.length === 0) {
    return [];
  }

  const streaks: StreakPeriod[] = [];
  let streakStart = sortedDates[0];
  let streakEnd = sortedDates[0];

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i];
    const previousDate = sortedDates[i - 1];

    // Check if dates are consecutive
    if (areDatesConsecutive(previousDate, currentDate)) {
      // Extend current streak
      streakEnd = currentDate;
    } else {
      // End current streak and start new one
      streaks.push({
        startDate: streakStart,
        endDate: streakEnd,
        length: daysBetween(streakStart, streakEnd) + 1,
      });
      streakStart = currentDate;
      streakEnd = currentDate;
    }
  }

  // Don't forget the last streak
  streaks.push({
    startDate: streakStart,
    endDate: streakEnd,
    length: daysBetween(streakStart, streakEnd) + 1,
  });

  return streaks;
}

/**
 * Calculate streak data for multiple habits at once
 *
 * @param habitIds - Array of habit IDs
 * @returns Promise with map of habit ID to streak data
 */
export async function calculateStreaksForHabits(
  habitIds: string[]
): Promise<StreakServiceResult<Map<string, StreakData>>> {
  if (!Array.isArray(habitIds)) {
    return {
      success: false,
      error: new StreakServiceError(
        'Habit IDs must be an array',
        StreakServiceErrorCode.INVALID_INPUT
      ),
    };
  }

  try {
    const results = new Map<string, StreakData>();

    for (const habitId of habitIds) {
      const result = await calculateStreakForHabit(habitId);
      if (result.success && result.data) {
        results.set(habitId, result.data);
      }
    }

    return { success: true, data: results };
  } catch (error) {
    return {
      success: false,
      error: new StreakServiceError(
        'Failed to calculate streaks for habits',
        StreakServiceErrorCode.OPERATION_FAILED,
        error
      ),
    };
  }
}

/**
 * Calculate streak data for all active habits
 *
 * @returns Promise with map of habit ID to streak data
 */
export async function calculateStreaksForAllActiveHabits(): Promise<
  StreakServiceResult<Map<string, StreakData>>
> {
  try {
    const db = await getDatabaseOrThrow();

    // Get all non-archived habits
    const habits = await db.habits
      .find({
        selector: { isArchived: false },
      })
      .exec();

    const habitIds = habits.map((h) => h.id);
    return calculateStreaksForHabits(habitIds);
  } catch (error) {
    return {
      success: false,
      error: new StreakServiceError(
        'Failed to calculate streaks for active habits',
        StreakServiceErrorCode.OPERATION_FAILED,
        error
      ),
    };
  }
}

// ============================================================================
// Streak History Functions
// ============================================================================

/**
 * Get complete streak history for a habit
 *
 * @param habitId - The habit ID
 * @returns Promise with streak history or error
 */
export async function getStreakHistory(
  habitId: string
): Promise<StreakServiceResult<StreakHistory>> {
  if (!habitId || typeof habitId !== 'string') {
    return {
      success: false,
      error: new StreakServiceError(
        'Invalid habit ID',
        StreakServiceErrorCode.INVALID_INPUT
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();

    // Get the habit to determine its type
    const habit = await db.habits.findOne(habitId).exec();
    if (!habit) {
      return {
        success: false,
        error: new StreakServiceError(
          `Habit with ID "${habitId}" not found`,
          StreakServiceErrorCode.HABIT_NOT_FOUND
        ),
      };
    }

    const habitData = habit.toJSON() as HabitDocType;
    const habitType = habitData.type;
    // Negative habits are always treated as daily for streak calculations
    const frequency = habitType === 'negative' ? 'daily' : (habitData.frequency || 'daily');

    // Get all logs for this habit, sorted by date ascending
    const logs = await db.habit_logs
      .find({
        selector: { habitId },
      })
      .exec();

    const logsData = logs
      .map((doc) => doc.toJSON() as HabitLogDocType)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (logsData.length === 0) {
      return {
        success: true,
        data: {
          habitId,
          streaks: [],
          totalSuccessDays: 0,
          totalTrackedDays: 0,
          successRate: 0,
        },
      };
    }

    // Create a map of date -> success status
    const dateSuccessMap = new Map<string, boolean>();
    for (const log of logsData) {
      const success = isSuccessForHabitType(log.completed, habitType);
      dateSuccessMap.set(log.date, success);
    }

    // Find all success dates and sort them
    const successDates = Array.from(dateSuccessMap.entries())
      .filter(([, success]) => success)
      .map(([date]) => date)
      .sort();

    // Calculate streak periods based on frequency
    let streakPeriods: StreakPeriod[];
    if (frequency === 'daily') {
      streakPeriods = calculateStreakPeriods(successDates);
    } else {
      // For weekly/monthly, aggregate by period
      const periodSuccessMap = new Map<string, { firstDate: string; lastDate: string }>();
      for (const date of successDates) {
        const periodKey = getPeriodKey(date, frequency);
        const existing = periodSuccessMap.get(periodKey);
        if (existing) {
          existing.lastDate = date > existing.lastDate ? date : existing.lastDate;
        } else {
          periodSuccessMap.set(periodKey, { firstDate: date, lastDate: date });
        }
      }

      const successPeriods = Array.from(periodSuccessMap.entries())
        .map(([period, data]) => ({ period, ...data }))
        .sort((a, b) => a.period.localeCompare(b.period));

      streakPeriods = calculatePeriodStreaks(successPeriods, frequency);
    }

    // Reverse to get most recent first
    streakPeriods.reverse();

    // Calculate statistics
    // For weekly/monthly habits, count periods instead of days
    let totalTrackedCount: number;
    let totalSuccessCount: number;

    if (frequency === 'daily') {
      totalTrackedCount = logsData.length;
      totalSuccessCount = successDates.length;
    } else {
      // Count unique periods tracked and successful
      const trackedPeriods = new Set<string>();
      const successPeriods = new Set<string>();

      for (const log of logsData) {
        const periodKey = getPeriodKey(log.date, frequency);
        trackedPeriods.add(periodKey);
        if (isSuccessForHabitType(log.completed, habitType)) {
          successPeriods.add(periodKey);
        }
      }

      totalTrackedCount = trackedPeriods.size;
      totalSuccessCount = successPeriods.size;
    }

    const successRate =
      totalTrackedCount > 0
        ? Math.round((totalSuccessCount / totalTrackedCount) * 100)
        : 0;

    return {
      success: true,
      data: {
        habitId,
        streaks: streakPeriods,
        totalSuccessDays: totalSuccessCount,
        totalTrackedDays: totalTrackedCount,
        successRate,
      },
    };
  } catch (error) {
    if (error instanceof StreakServiceError) {
      return { success: false, error };
    }
    return {
      success: false,
      error: new StreakServiceError(
        'Failed to get streak history',
        StreakServiceErrorCode.OPERATION_FAILED,
        error
      ),
    };
  }
}

// ============================================================================
// Statistics Functions
// ============================================================================

/**
 * Get the best streak ever across all habits
 *
 * @returns Promise with the best streak data
 */
export async function getBestStreakEver(): Promise<
  StreakServiceResult<{ habitId: string; streak: StreakPeriod } | null>
> {
  try {
    const result = await calculateStreaksForAllActiveHabits();
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    let bestStreak: { habitId: string; streak: StreakPeriod } | null = null;

    for (const [habitId, streakData] of result.data.entries()) {
      if (
        streakData.longestStreak > 0 &&
        streakData.longestStreakStartDate &&
        streakData.longestStreakEndDate
      ) {
        const streak: StreakPeriod = {
          startDate: streakData.longestStreakStartDate,
          endDate: streakData.longestStreakEndDate,
          length: streakData.longestStreak,
        };

        if (!bestStreak || streak.length > bestStreak.streak.length) {
          bestStreak = { habitId, streak };
        }
      }
    }

    return { success: true, data: bestStreak };
  } catch (error) {
    return {
      success: false,
      error: new StreakServiceError(
        'Failed to get best streak ever',
        StreakServiceErrorCode.OPERATION_FAILED,
        error
      ),
    };
  }
}

/**
 * Get all habits with active streaks
 *
 * @returns Promise with array of habit IDs with active streaks
 */
export async function getHabitsWithActiveStreaks(): Promise<
  StreakServiceResult<Array<{ habitId: string; streak: number }>>
> {
  try {
    const result = await calculateStreaksForAllActiveHabits();
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const activeStreaks: Array<{ habitId: string; streak: number }> = [];

    for (const [habitId, streakData] of result.data.entries()) {
      if (streakData.isStreakActive && streakData.currentStreak > 0) {
        activeStreaks.push({
          habitId,
          streak: streakData.currentStreak,
        });
      }
    }

    // Sort by streak length descending
    activeStreaks.sort((a, b) => b.streak - a.streak);

    return { success: true, data: activeStreaks };
  } catch (error) {
    return {
      success: false,
      error: new StreakServiceError(
        'Failed to get habits with active streaks',
        StreakServiceErrorCode.OPERATION_FAILED,
        error
      ),
    };
  }
}

/**
 * Calculate completion rate for a habit within a date range
 *
 * @param habitId - The habit ID
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Promise with completion rate (0-100)
 */
export async function calculateCompletionRate(
  habitId: string,
  startDate: string,
  endDate: string
): Promise<StreakServiceResult<number>> {
  if (!habitId || typeof habitId !== 'string') {
    return {
      success: false,
      error: new StreakServiceError(
        'Invalid habit ID',
        StreakServiceErrorCode.INVALID_INPUT
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();

    // Get the habit to determine its type
    const habit = await db.habits.findOne(habitId).exec();
    if (!habit) {
      return {
        success: false,
        error: new StreakServiceError(
          `Habit with ID "${habitId}" not found`,
          StreakServiceErrorCode.HABIT_NOT_FOUND
        ),
      };
    }

    const habitData = habit.toJSON() as HabitDocType;
    const habitType = habitData.type;

    // Get logs within date range
    const logs = await db.habit_logs
      .find({
        selector: {
          habitId,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      })
      .exec();

    const logsData = logs.map((doc) => doc.toJSON() as HabitLogDocType);

    // Calculate total days in range
    const totalDays = daysBetween(startDate, endDate) + 1;

    if (totalDays <= 0) {
      return { success: true, data: 0 };
    }

    // Count success days
    let successDays = 0;
    for (const log of logsData) {
      if (isSuccessForHabitType(log.completed, habitType)) {
        successDays++;
      }
    }

    const rate = Math.round((successDays / totalDays) * 100);
    return { success: true, data: rate };
  } catch (error) {
    return {
      success: false,
      error: new StreakServiceError(
        'Failed to calculate completion rate',
        StreakServiceErrorCode.OPERATION_FAILED,
        error
      ),
    };
  }
}
