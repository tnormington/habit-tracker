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
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayDateString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Add days to a date string and return new date string
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
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

    // Get all logs for this habit, sorted by date ascending
    const logs = await db.habit_logs
      .find({
        selector: { habitId },
      })
      .exec();

    const logsData = logs
      .map((doc) => doc.toJSON() as HabitLogDocType)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate streaks
    const streakData = calculateStreaksFromLogs(logsData, habitType);

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
  habitType: HabitType
): Omit<StreakData, 'habitId'> {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

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
  // Current streak is active if the most recent streak includes today or yesterday
  const mostRecentStreak = streakPeriods[streakPeriods.length - 1];
  const lastSuccessDate = successDates[successDates.length - 1];

  let currentStreak = 0;
  let currentStreakStartDate: string | null = null;
  let currentStreakEndDate: string | null = null;
  let isStreakActive = false;

  // Check if the most recent streak is still "active"
  // A streak is active if it ends today or yesterday (allowing for today's entry to be pending)
  if (mostRecentStreak.endDate === today || mostRecentStreak.endDate === yesterday) {
    currentStreak = mostRecentStreak.length;
    currentStreakStartDate = mostRecentStreak.startDate;
    currentStreakEndDate = mostRecentStreak.endDate;
    isStreakActive = true;
  } else if (daysBetween(mostRecentStreak.endDate, today) === 1) {
    // If streak ended yesterday (exactly 1 day gap to today), it's still considered active
    // because user might not have logged today yet
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

    // Calculate streak periods
    const streakPeriods = calculateStreakPeriods(successDates);

    // Reverse to get most recent first
    streakPeriods.reverse();

    // Calculate statistics
    const totalTrackedDays = logsData.length;
    const totalSuccessDays = successDates.length;
    const successRate =
      totalTrackedDays > 0
        ? Math.round((totalSuccessDays / totalTrackedDays) * 100)
        : 0;

    return {
      success: true,
      data: {
        habitId,
        streaks: streakPeriods,
        totalSuccessDays,
        totalTrackedDays,
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
