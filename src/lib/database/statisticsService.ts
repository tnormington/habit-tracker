'use client';

/**
 * Statistics Service Functions
 * Service layer for calculating habit statistics including completion rate,
 * total completions, streaks, and completion patterns by day of week.
 */

import { getDatabase } from './database';
import type {
  HabitDocType,
  HabitLogDocType,
  HabitTrackerDatabase,
  HabitType,
  HabitCategory,
  HabitFrequency,
} from './types';
import {
  calculateStreakForHabit,
  calculateStreaksForAllActiveHabits,
  type StreakData,
} from './streakService';

// ============================================================================
// Types
// ============================================================================

/**
 * Day of week (0 = Sunday, 6 = Saturday)
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Day names for display
 */
export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

/**
 * Short day names for display
 */
export const DAY_NAMES_SHORT: Record<DayOfWeek, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

/**
 * Statistics for a single habit
 */
export interface HabitStatistics {
  /** The habit ID */
  habitId: string;
  /** The habit name */
  habitName: string;
  /** The habit type (positive/negative) */
  habitType: HabitType;
  /** The habit category */
  habitCategory: HabitCategory;
  /** The habit frequency */
  habitFrequency: HabitFrequency;
  /** Target completions per period (for non-daily habits) */
  targetCount: number;
  /** Total number of completions */
  totalCompletions: number;
  /** Total number of tracked days/periods (days with any log entry) */
  totalTrackedDays: number;
  /** Completion rate as percentage (0-100) */
  completionRate: number;
  /** Current streak (days/weeks/months based on frequency) */
  currentStreak: number;
  /** Best streak ever (days/weeks/months based on frequency) */
  bestStreak: number;
  /** Whether the streak is currently active */
  isStreakActive: boolean;
  /** Completions by day of week */
  completionsByDayOfWeek: Record<DayOfWeek, number>;
  /** Completion rate by day of week (0-100) */
  completionRateByDayOfWeek: Record<DayOfWeek, number>;
  /** Date of first log entry */
  firstLogDate: string | null;
  /** Date of most recent log entry */
  lastLogDate: string | null;
  /** Date of last completion */
  lastCompletionDate: string | null;
  /** Current period progress (for non-daily habits) - how many completions this week/month */
  currentPeriodCompletions: number;
}

/**
 * Aggregated statistics for the dashboard
 */
export interface DashboardStatistics {
  /** Total number of habits */
  totalHabits: number;
  /** Number of active (non-archived) habits */
  activeHabits: number;
  /** Number of positive habits */
  positiveHabits: number;
  /** Number of negative habits */
  negativeHabits: number;
  /** Total completions across all habits */
  totalCompletions: number;
  /** Overall completion rate across all habits (0-100) */
  overallCompletionRate: number;
  /** Total current active streaks */
  totalActiveStreaks: number;
  /** Sum of all current active streak lengths */
  combinedActiveStreakDays: number;
  /** Best current streak */
  bestCurrentStreak: { habitId: string; habitName: string; days: number } | null;
  /** Best streak ever */
  bestStreakEver: { habitId: string; habitName: string; days: number } | null;
  /** Most consistent habit (highest completion rate with minimum 7 tracked days) */
  mostConsistentHabit: { habitId: string; habitName: string; rate: number } | null;
  /** Completions by day of week (aggregated across all habits) */
  completionsByDayOfWeek: Record<DayOfWeek, number>;
  /** Average completion rate by day of week (0-100) */
  avgCompletionRateByDayOfWeek: Record<DayOfWeek, number>;
  /** Best day for completions */
  bestDayOfWeek: { day: DayOfWeek; name: string; completions: number } | null;
  /** Habits by category count */
  habitsByCategory: Record<HabitCategory, number>;
  /** Today's completion status */
  todayStats: {
    completed: number;
    total: number;
    rate: number;
  };
  /** This week's completion status */
  thisWeekStats: {
    completed: number;
    total: number;
    rate: number;
  };
  /** This month's completion status */
  thisMonthStats: {
    completed: number;
    total: number;
    rate: number;
  };
}

/**
 * Weekly trend data point
 */
export interface WeeklyTrendPoint {
  /** Week start date (YYYY-MM-DD) */
  weekStart: string;
  /** Week end date (YYYY-MM-DD) */
  weekEnd: string;
  /** Number of completions */
  completions: number;
  /** Total possible completions (habits * days) */
  totalPossible: number;
  /** Completion rate (0-100) */
  rate: number;
}

/**
 * Time period for filtering statistics
 */
export type StatisticsPeriod = 'week' | 'month' | 'year' | 'all';

/**
 * Statistics for a time period
 */
export interface PeriodStatistics {
  /** The time period */
  period: StatisticsPeriod;
  /** Start date of the period */
  startDate: string;
  /** End date of the period */
  endDate: string;
  /** Total completions in the period */
  totalCompletions: number;
  /** Total possible completions */
  totalPossible: number;
  /** Completion rate (0-100) */
  completionRate: number;
  /** Completions by day of week */
  completionsByDayOfWeek: Record<DayOfWeek, number>;
  /** Tracked days by day of week */
  trackedDaysByDayOfWeek: Record<DayOfWeek, number>;
  /** Best performing habits */
  bestPerformingHabits: Array<{
    habitId: string;
    habitName: string;
    completionRate: number;
    totalCompletions: number;
    totalTracked: number;
  }>;
  /** Worst performing habits (for improvement) */
  needsImprovementHabits: Array<{
    habitId: string;
    habitName: string;
    completionRate: number;
    totalCompletions: number;
    totalTracked: number;
  }>;
  /** Habits by category performance */
  categoryPerformance: Record<HabitCategory, { completions: number; total: number; rate: number }>;
  /** Daily completion trend */
  dailyTrend: Array<{ date: string; completions: number; total: number; rate: number }>;
  /** Total active days (days with any activity) */
  totalActiveDays: number;
  /** Average daily completion rate */
  avgDailyCompletionRate: number;
}

/**
 * Result of a statistics service operation
 */
export interface StatisticsServiceResult<T> {
  success: boolean;
  data?: T;
  error?: StatisticsServiceError;
}

/**
 * Custom error class for statistics service operations
 */
export class StatisticsServiceError extends Error {
  constructor(
    message: string,
    public readonly code: StatisticsServiceErrorCode,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'StatisticsServiceError';
  }
}

/**
 * Error codes for statistics service operations
 */
export enum StatisticsServiceErrorCode {
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
    throw new StatisticsServiceError(
      'Database not initialized',
      StatisticsServiceErrorCode.DATABASE_NOT_INITIALIZED,
      error
    );
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get the day of week from a date string
 */
function getDayOfWeek(dateStr: string): DayOfWeek {
  return new Date(dateStr).getDay() as DayOfWeek;
}

/**
 * Get the start of the current week (Sunday)
 */
function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.toISOString().split('T')[0];
}

/**
 * Get the start of the current month
 */
function getMonthStart(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(1);
  return d.toISOString().split('T')[0];
}

/**
 * Add days to a date string
 */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Check if habit log counts as success based on habit type
 */
function isSuccess(completed: boolean, habitType: HabitType): boolean {
  return habitType === 'positive' ? completed : !completed;
}

/**
 * Initialize empty day of week counts
 */
function initDayOfWeekCounts(): Record<DayOfWeek, number> {
  return { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
}

/**
 * Get the week number for a date
 */
function getWeekKey(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const firstDay = new Date(year, 0, 1);
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

// ============================================================================
// Statistics Functions
// ============================================================================

/**
 * Calculate statistics for a single habit
 *
 * @param habitId - The habit ID
 * @returns Promise with habit statistics or error
 */
export async function getHabitStatistics(
  habitId: string
): Promise<StatisticsServiceResult<HabitStatistics>> {
  if (!habitId || typeof habitId !== 'string') {
    return {
      success: false,
      error: new StatisticsServiceError(
        'Invalid habit ID',
        StatisticsServiceErrorCode.INVALID_INPUT
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();

    // Get the habit
    const habit = await db.habits.findOne(habitId).exec();
    if (!habit) {
      return {
        success: false,
        error: new StatisticsServiceError(
          `Habit with ID "${habitId}" not found`,
          StatisticsServiceErrorCode.HABIT_NOT_FOUND
        ),
      };
    }

    const habitData = habit.toJSON() as HabitDocType;

    // Get all logs for this habit
    const logs = await db.habit_logs
      .find({ selector: { habitId } })
      .exec();

    const logsData = logs
      .map((doc) => doc.toJSON() as HabitLogDocType)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get streak data
    const streakResult = await calculateStreakForHabit(habitId);
    const streakData = streakResult.success ? streakResult.data : null;

    // Calculate statistics
    const stats = calculateHabitStatsFromLogs(habitData, logsData, streakData);

    return { success: true, data: stats };
  } catch (error) {
    if (error instanceof StatisticsServiceError) {
      return { success: false, error };
    }
    return {
      success: false,
      error: new StatisticsServiceError(
        'Failed to get habit statistics',
        StatisticsServiceErrorCode.OPERATION_FAILED,
        error
      ),
    };
  }
}

/**
 * Calculate statistics from logs data
 */
function calculateHabitStatsFromLogs(
  habit: HabitDocType,
  logs: HabitLogDocType[],
  streakData: StreakData | null | undefined
): HabitStatistics {
  const completionsByDayOfWeek = initDayOfWeekCounts();
  const trackedDaysByDayOfWeek = initDayOfWeekCounts();
  const frequency = habit.frequency || 'daily';

  let totalCompletions = 0;
  let lastCompletionDate: string | null = null;

  for (const log of logs) {
    const dayOfWeek = getDayOfWeek(log.date);
    trackedDaysByDayOfWeek[dayOfWeek]++;

    if (isSuccess(log.completed, habit.type)) {
      totalCompletions++;
      completionsByDayOfWeek[dayOfWeek]++;
      lastCompletionDate = log.date;
    }
  }

  // For weekly/monthly habits, calculate based on periods
  let totalTrackedDays: number;
  let completionRate: number;

  if (frequency === 'daily') {
    totalTrackedDays = logs.length;
    completionRate = totalTrackedDays > 0
      ? Math.round((totalCompletions / totalTrackedDays) * 100)
      : 0;
  } else {
    // For weekly/monthly, count unique periods and check against target count
    const targetCount = habit.targetCount || 1;
    const trackedPeriods = new Set<string>();
    const periodCompletionCounts = new Map<string, number>();

    for (const log of logs) {
      const periodKey = getPeriodKey(log.date, frequency);
      trackedPeriods.add(periodKey);
      if (isSuccess(log.completed, habit.type)) {
        periodCompletionCounts.set(
          periodKey,
          (periodCompletionCounts.get(periodKey) || 0) + 1
        );
      }
    }

    // A period is successful only if the target count is met
    let successfulPeriods = 0;
    for (const [, count] of periodCompletionCounts) {
      if (count >= targetCount) {
        successfulPeriods++;
      }
    }

    totalTrackedDays = trackedPeriods.size;
    completionRate = totalTrackedDays > 0
      ? Math.round((successfulPeriods / totalTrackedDays) * 100)
      : 0;
    totalCompletions = successfulPeriods;
  }

  // Calculate completion rate by day of week
  const completionRateByDayOfWeek = initDayOfWeekCounts();
  for (let day = 0; day <= 6; day++) {
    const d = day as DayOfWeek;
    if (trackedDaysByDayOfWeek[d] > 0) {
      completionRateByDayOfWeek[d] = Math.round(
        (completionsByDayOfWeek[d] / trackedDaysByDayOfWeek[d]) * 100
      );
    }
  }

  // Calculate current period completions (for non-daily habits)
  let currentPeriodCompletions = 0;
  if (frequency !== 'daily') {
    const today = getTodayDate();
    const currentPeriodKey = getPeriodKey(today, frequency);
    for (const log of logs) {
      const logPeriodKey = getPeriodKey(log.date, frequency);
      if (logPeriodKey === currentPeriodKey && isSuccess(log.completed, habit.type)) {
        currentPeriodCompletions++;
      }
    }
  } else {
    // For daily, current period completion is just whether completed today
    const today = getTodayDate();
    const todayLog = logs.find(l => l.date === today);
    currentPeriodCompletions = todayLog && isSuccess(todayLog.completed, habit.type) ? 1 : 0;
  }

  return {
    habitId: habit.id,
    habitName: habit.name,
    habitType: habit.type,
    habitCategory: habit.category,
    habitFrequency: frequency,
    targetCount: habit.targetCount || 1,
    totalCompletions,
    totalTrackedDays,
    completionRate,
    currentStreak: streakData?.currentStreak ?? 0,
    bestStreak: streakData?.longestStreak ?? 0,
    isStreakActive: streakData?.isStreakActive ?? false,
    completionsByDayOfWeek,
    completionRateByDayOfWeek,
    firstLogDate: logs.length > 0 ? logs[0].date : null,
    lastLogDate: logs.length > 0 ? logs[logs.length - 1].date : null,
    lastCompletionDate,
    currentPeriodCompletions,
  };
}

/**
 * Get statistics for multiple habits
 *
 * @param habitIds - Array of habit IDs
 * @returns Promise with map of habit ID to statistics
 */
export async function getStatisticsForHabits(
  habitIds: string[]
): Promise<StatisticsServiceResult<Map<string, HabitStatistics>>> {
  if (!Array.isArray(habitIds)) {
    return {
      success: false,
      error: new StatisticsServiceError(
        'Habit IDs must be an array',
        StatisticsServiceErrorCode.INVALID_INPUT
      ),
    };
  }

  try {
    const results = new Map<string, HabitStatistics>();

    for (const habitId of habitIds) {
      const result = await getHabitStatistics(habitId);
      if (result.success && result.data) {
        results.set(habitId, result.data);
      }
    }

    return { success: true, data: results };
  } catch (error) {
    return {
      success: false,
      error: new StatisticsServiceError(
        'Failed to get statistics for habits',
        StatisticsServiceErrorCode.OPERATION_FAILED,
        error
      ),
    };
  }
}

/**
 * Get aggregated dashboard statistics
 *
 * @returns Promise with dashboard statistics
 */
export async function getDashboardStatistics(): Promise<
  StatisticsServiceResult<DashboardStatistics>
> {
  try {
    const db = await getDatabaseOrThrow();
    const today = getTodayDate();
    const weekStart = getWeekStart();
    const monthStart = getMonthStart();

    // Get all habits
    const allHabits = await db.habits.find().exec();
    const habitsData = allHabits.map((doc) => doc.toJSON() as HabitDocType);

    // Get active habits
    const activeHabitsData = habitsData.filter((h) => !h.isArchived);
    const activeHabitIds = activeHabitsData.map((h) => h.id);

    // Get all logs
    const allLogs = await db.habit_logs.find().exec();
    const logsData = allLogs.map((doc) => doc.toJSON() as HabitLogDocType);

    // Create maps for quick lookups
    const habitMap = new Map<string, HabitDocType>();
    for (const habit of habitsData) {
      habitMap.set(habit.id, habit);
    }

    // Get streak data for all active habits
    const streaksResult = await calculateStreaksForAllActiveHabits();
    const streaksMap = streaksResult.success ? streaksResult.data : new Map<string, StreakData>();

    // Calculate aggregated statistics
    const stats = calculateDashboardStats(
      habitsData,
      activeHabitsData,
      logsData,
      habitMap,
      streaksMap ?? new Map(),
      today,
      weekStart,
      monthStart
    );

    return { success: true, data: stats };
  } catch (error) {
    if (error instanceof StatisticsServiceError) {
      return { success: false, error };
    }
    return {
      success: false,
      error: new StatisticsServiceError(
        'Failed to get dashboard statistics',
        StatisticsServiceErrorCode.OPERATION_FAILED,
        error
      ),
    };
  }
}

/**
 * Calculate dashboard statistics from data
 */
function calculateDashboardStats(
  allHabits: HabitDocType[],
  activeHabits: HabitDocType[],
  logs: HabitLogDocType[],
  habitMap: Map<string, HabitDocType>,
  streaksMap: Map<string, StreakData>,
  today: string,
  weekStart: string,
  monthStart: string
): DashboardStatistics {
  // Basic counts
  const totalHabits = allHabits.length;
  const activeHabitsCount = activeHabits.length;
  const positiveHabits = activeHabits.filter((h) => h.type === 'positive').length;
  const negativeHabits = activeHabits.filter((h) => h.type === 'negative').length;

  // Habits by category
  const habitsByCategory: Record<HabitCategory, number> = {
    health: 0,
    fitness: 0,
    productivity: 0,
    mindfulness: 0,
    learning: 0,
    social: 0,
    finance: 0,
    creativity: 0,
    other: 0,
  };
  for (const habit of activeHabits) {
    habitsByCategory[habit.category]++;
  }

  // Filter logs for active habits only
  const activeHabitIds = new Set(activeHabits.map((h) => h.id));
  const activeLogs = logs.filter((log) => activeHabitIds.has(log.habitId));

  // Calculate total completions
  let totalCompletions = 0;
  const completionsByDayOfWeek = initDayOfWeekCounts();
  const trackedDaysByDayOfWeek = initDayOfWeekCounts();

  for (const log of activeLogs) {
    const habit = habitMap.get(log.habitId);
    if (!habit) continue;

    const dayOfWeek = getDayOfWeek(log.date);
    trackedDaysByDayOfWeek[dayOfWeek]++;

    if (isSuccess(log.completed, habit.type)) {
      totalCompletions++;
      completionsByDayOfWeek[dayOfWeek]++;
    }
  }

  // Calculate overall completion rate
  const overallCompletionRate = activeLogs.length > 0
    ? Math.round((totalCompletions / activeLogs.length) * 100)
    : 0;

  // Calculate avg completion rate by day of week
  const avgCompletionRateByDayOfWeek = initDayOfWeekCounts();
  for (let day = 0; day <= 6; day++) {
    const d = day as DayOfWeek;
    if (trackedDaysByDayOfWeek[d] > 0) {
      avgCompletionRateByDayOfWeek[d] = Math.round(
        (completionsByDayOfWeek[d] / trackedDaysByDayOfWeek[d]) * 100
      );
    }
  }

  // Find best day of week
  let bestDayOfWeek: { day: DayOfWeek; name: string; completions: number } | null = null;
  for (let day = 0; day <= 6; day++) {
    const d = day as DayOfWeek;
    if (!bestDayOfWeek || completionsByDayOfWeek[d] > bestDayOfWeek.completions) {
      bestDayOfWeek = {
        day: d,
        name: DAY_NAMES[d],
        completions: completionsByDayOfWeek[d],
      };
    }
  }

  // Calculate streak stats
  let totalActiveStreaks = 0;
  let combinedActiveStreakDays = 0;
  let bestCurrentStreak: { habitId: string; habitName: string; days: number } | null = null;
  let bestStreakEver: { habitId: string; habitName: string; days: number } | null = null;

  for (const [habitId, streakData] of streaksMap.entries()) {
    const habit = habitMap.get(habitId);
    if (!habit) continue;

    if (streakData.isStreakActive && streakData.currentStreak > 0) {
      totalActiveStreaks++;
      combinedActiveStreakDays += streakData.currentStreak;

      if (!bestCurrentStreak || streakData.currentStreak > bestCurrentStreak.days) {
        bestCurrentStreak = {
          habitId,
          habitName: habit.name,
          days: streakData.currentStreak,
        };
      }
    }

    if (streakData.longestStreak > 0) {
      if (!bestStreakEver || streakData.longestStreak > bestStreakEver.days) {
        bestStreakEver = {
          habitId,
          habitName: habit.name,
          days: streakData.longestStreak,
        };
      }
    }
  }

  // Find most consistent habit (min 7 tracked days)
  let mostConsistentHabit: { habitId: string; habitName: string; rate: number } | null = null;
  const habitStatsMap = new Map<string, { completions: number; total: number }>();

  for (const log of activeLogs) {
    const habit = habitMap.get(log.habitId);
    if (!habit) continue;

    const stats = habitStatsMap.get(log.habitId) ?? { completions: 0, total: 0 };
    stats.total++;
    if (isSuccess(log.completed, habit.type)) {
      stats.completions++;
    }
    habitStatsMap.set(log.habitId, stats);
  }

  for (const [habitId, stats] of habitStatsMap.entries()) {
    if (stats.total >= 7) {
      const rate = Math.round((stats.completions / stats.total) * 100);
      const habit = habitMap.get(habitId);
      if (habit && (!mostConsistentHabit || rate > mostConsistentHabit.rate)) {
        mostConsistentHabit = {
          habitId,
          habitName: habit.name,
          rate,
        };
      }
    }
  }

  // Calculate today's stats (only for daily habits, or weekly/monthly if their period includes today)
  const todayLogs = activeLogs.filter((log) => log.date === today);
  let todayCompleted = 0;
  // Count habits that should be tracked today
  const todayWeekKey = getWeekKey(today);
  const todayMonthKey = getMonthKey(today);
  let todayHabitsTotal = 0;

  for (const habit of activeHabits) {
    const frequency = habit.frequency || 'daily';
    // For daily habits, always count
    if (frequency === 'daily') {
      todayHabitsTotal++;
    }
    // For weekly habits, check if we've logged this week
    else if (frequency === 'weekly') {
      todayHabitsTotal++;
    }
    // For monthly habits, check if we've logged this month
    else if (frequency === 'monthly') {
      todayHabitsTotal++;
    }
  }

  for (const log of todayLogs) {
    const habit = habitMap.get(log.habitId);
    if (habit && isSuccess(log.completed, habit.type)) {
      todayCompleted++;
    }
  }

  // Also count weekly/monthly habits completed in their respective periods
  for (const habit of activeHabits) {
    const frequency = habit.frequency || 'daily';
    if (frequency === 'weekly') {
      // Check if habit was completed this week (but not necessarily today)
      const weekLogs = activeLogs.filter(
        (log) => log.habitId === habit.id && getWeekKey(log.date) === todayWeekKey
      );
      const wasCompletedThisWeek = weekLogs.some((log) => isSuccess(log.completed, habit.type));
      // Only add if not already counted from today's logs
      const todayLog = todayLogs.find((log) => log.habitId === habit.id);
      if (wasCompletedThisWeek && !todayLog) {
        todayCompleted++;
      }
    } else if (frequency === 'monthly') {
      // Check if habit was completed this month (but not necessarily today)
      const monthLogs = activeLogs.filter(
        (log) => log.habitId === habit.id && getMonthKey(log.date) === todayMonthKey
      );
      const wasCompletedThisMonth = monthLogs.some((log) => isSuccess(log.completed, habit.type));
      const todayLog = todayLogs.find((log) => log.habitId === habit.id);
      if (wasCompletedThisMonth && !todayLog) {
        todayCompleted++;
      }
    }
  }

  const todayStats = {
    completed: todayCompleted,
    total: todayHabitsTotal,
    rate: todayHabitsTotal > 0 ? Math.round((todayCompleted / todayHabitsTotal) * 100) : 0,
  };

  // Calculate this week's stats
  const weekEnd = addDays(weekStart, 6);
  const thisWeekLogs = activeLogs.filter(
    (log) => log.date >= weekStart && log.date <= weekEnd
  );
  let thisWeekCompleted = 0;
  for (const log of thisWeekLogs) {
    const habit = habitMap.get(log.habitId);
    if (habit && isSuccess(log.completed, habit.type)) {
      thisWeekCompleted++;
    }
  }
  const thisWeekTotal = activeHabitsCount * 7;
  const thisWeekStats = {
    completed: thisWeekCompleted,
    total: thisWeekTotal,
    rate: thisWeekTotal > 0 ? Math.round((thisWeekCompleted / thisWeekTotal) * 100) : 0,
  };

  // Calculate this month's stats
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const monthEnd = addDays(monthStart, daysInMonth - 1);
  const thisMonthLogs = activeLogs.filter(
    (log) => log.date >= monthStart && log.date <= monthEnd
  );
  let thisMonthCompleted = 0;
  for (const log of thisMonthLogs) {
    const habit = habitMap.get(log.habitId);
    if (habit && isSuccess(log.completed, habit.type)) {
      thisMonthCompleted++;
    }
  }
  const thisMonthTotal = activeHabitsCount * daysInMonth;
  const thisMonthStats = {
    completed: thisMonthCompleted,
    total: thisMonthTotal,
    rate: thisMonthTotal > 0 ? Math.round((thisMonthCompleted / thisMonthTotal) * 100) : 0,
  };

  return {
    totalHabits,
    activeHabits: activeHabitsCount,
    positiveHabits,
    negativeHabits,
    totalCompletions,
    overallCompletionRate,
    totalActiveStreaks,
    combinedActiveStreakDays,
    bestCurrentStreak,
    bestStreakEver,
    mostConsistentHabit,
    completionsByDayOfWeek,
    avgCompletionRateByDayOfWeek,
    bestDayOfWeek,
    habitsByCategory,
    todayStats,
    thisWeekStats,
    thisMonthStats,
  };
}

/**
 * Get weekly trend data for the last N weeks
 *
 * @param weeks - Number of weeks to include (default 12)
 * @returns Promise with weekly trend data
 */
export async function getWeeklyTrends(
  weeks: number = 12
): Promise<StatisticsServiceResult<WeeklyTrendPoint[]>> {
  if (weeks < 1 || weeks > 52) {
    return {
      success: false,
      error: new StatisticsServiceError(
        'Weeks must be between 1 and 52',
        StatisticsServiceErrorCode.INVALID_INPUT
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();

    // Get active habits
    const activeHabits = await db.habits
      .find({ selector: { isArchived: false } })
      .exec();
    const habitsData = activeHabits.map((doc) => doc.toJSON() as HabitDocType);
    const habitMap = new Map<string, HabitDocType>();
    for (const habit of habitsData) {
      habitMap.set(habit.id, habit);
    }

    // Calculate date range
    const today = new Date();
    const currentWeekStart = getWeekStart(today);
    const startDate = addDays(currentWeekStart, -(weeks - 1) * 7);

    // Get all logs in range
    const logs = await db.habit_logs
      .find({
        selector: {
          date: {
            $gte: startDate,
            $lte: getTodayDate(),
          },
        },
      })
      .exec();
    const logsData = logs.map((doc) => doc.toJSON() as HabitLogDocType);

    // Group logs by week
    const weeklyData: WeeklyTrendPoint[] = [];

    for (let i = 0; i < weeks; i++) {
      const weekStart = addDays(startDate, i * 7);
      const weekEnd = addDays(weekStart, 6);

      const weekLogs = logsData.filter(
        (log) => log.date >= weekStart && log.date <= weekEnd
      );

      let completions = 0;
      for (const log of weekLogs) {
        const habit = habitMap.get(log.habitId);
        if (habit && isSuccess(log.completed, habit.type)) {
          completions++;
        }
      }

      const totalPossible = habitsData.length * 7;
      const rate = totalPossible > 0
        ? Math.round((completions / totalPossible) * 100)
        : 0;

      weeklyData.push({
        weekStart,
        weekEnd,
        completions,
        totalPossible,
        rate,
      });
    }

    return { success: true, data: weeklyData };
  } catch (error) {
    return {
      success: false,
      error: new StatisticsServiceError(
        'Failed to get weekly trends',
        StatisticsServiceErrorCode.OPERATION_FAILED,
        error
      ),
    };
  }
}

/**
 * Get completion stats for a specific date
 *
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise with completion stats for that date
 */
export async function getCompletionStatsForDate(
  date: string
): Promise<StatisticsServiceResult<{ completed: number; total: number; rate: number; habits: Array<{ habitId: string; habitName: string; completed: boolean }> }>> {
  try {
    const db = await getDatabaseOrThrow();

    // Get active habits
    const activeHabits = await db.habits
      .find({ selector: { isArchived: false } })
      .exec();
    const habitsData = activeHabits.map((doc) => doc.toJSON() as HabitDocType);

    // Get logs for the date
    const logs = await db.habit_logs
      .find({ selector: { date } })
      .exec();
    const logsData = logs.map((doc) => doc.toJSON() as HabitLogDocType);

    // Create a map of habitId -> log
    const logMap = new Map<string, HabitLogDocType>();
    for (const log of logsData) {
      logMap.set(log.habitId, log);
    }

    // Calculate stats
    let completed = 0;
    const habits: Array<{ habitId: string; habitName: string; completed: boolean }> = [];

    for (const habit of habitsData) {
      const log = logMap.get(habit.id);
      const isCompleted = log ? isSuccess(log.completed, habit.type) : false;

      if (isCompleted) {
        completed++;
      }

      habits.push({
        habitId: habit.id,
        habitName: habit.name,
        completed: isCompleted,
      });
    }

    const total = habitsData.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      success: true,
      data: { completed, total, rate, habits },
    };
  } catch (error) {
    return {
      success: false,
      error: new StatisticsServiceError(
        'Failed to get completion stats for date',
        StatisticsServiceErrorCode.OPERATION_FAILED,
        error
      ),
    };
  }
}

/**
 * Get the start date for a given period
 */
function getPeriodStartDate(period: StatisticsPeriod): string {
  const now = new Date();

  switch (period) {
    case 'week': {
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      return startOfWeek.toISOString().split('T')[0];
    }
    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return startOfMonth.toISOString().split('T')[0];
    }
    case 'year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return startOfYear.toISOString().split('T')[0];
    }
    case 'all':
    default:
      return '1970-01-01';
  }
}

/**
 * Get the number of days in the period (for calculating possible completions)
 */
function getDaysInPeriod(period: StatisticsPeriod, startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Get statistics for a specific time period
 *
 * @param period - The time period to calculate statistics for
 * @returns Promise with period statistics
 */
export async function getPeriodStatistics(
  period: StatisticsPeriod
): Promise<StatisticsServiceResult<PeriodStatistics>> {
  try {
    const db = await getDatabaseOrThrow();
    const today = getTodayDate();
    const startDate = period === 'all' ? '' : getPeriodStartDate(period);
    const endDate = today;

    // Get active habits
    const activeHabits = await db.habits
      .find({ selector: { isArchived: false } })
      .exec();
    const habitsData = activeHabits.map((doc) => doc.toJSON() as HabitDocType);
    const habitMap = new Map<string, HabitDocType>();
    for (const habit of habitsData) {
      habitMap.set(habit.id, habit);
    }

    // Get logs for the period
    const logsQuery = period === 'all'
      ? db.habit_logs.find()
      : db.habit_logs.find({
          selector: {
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        });

    const logs = await logsQuery.exec();
    const logsData = logs.map((doc) => doc.toJSON() as HabitLogDocType);

    // Filter logs for active habits only
    const activeHabitIds = new Set(habitsData.map((h) => h.id));
    const activeLogs = logsData.filter((log) => activeHabitIds.has(log.habitId));

    // Calculate statistics
    const completionsByDayOfWeek = initDayOfWeekCounts();
    const trackedDaysByDayOfWeek = initDayOfWeekCounts();
    const habitStats = new Map<string, { completions: number; total: number }>();
    const categoryStats = new Map<HabitCategory, { completions: number; total: number }>();
    const dailyStats = new Map<string, { completions: number; total: number }>();
    const activeDates = new Set<string>();

    let totalCompletions = 0;

    for (const log of activeLogs) {
      const habit = habitMap.get(log.habitId);
      if (!habit) continue;

      const dayOfWeek = getDayOfWeek(log.date);
      trackedDaysByDayOfWeek[dayOfWeek]++;
      activeDates.add(log.date);

      // Habit stats
      const hs = habitStats.get(log.habitId) ?? { completions: 0, total: 0 };
      hs.total++;

      // Category stats
      const cs = categoryStats.get(habit.category) ?? { completions: 0, total: 0 };
      cs.total++;

      // Daily stats
      const ds = dailyStats.get(log.date) ?? { completions: 0, total: 0 };
      ds.total++;

      if (isSuccess(log.completed, habit.type)) {
        totalCompletions++;
        completionsByDayOfWeek[dayOfWeek]++;
        hs.completions++;
        cs.completions++;
        ds.completions++;
      }

      habitStats.set(log.habitId, hs);
      categoryStats.set(habit.category, cs);
      dailyStats.set(log.date, ds);
    }

    // Calculate total possible and completion rate
    const actualStartDate = period === 'all'
      ? (activeLogs.length > 0 ? activeLogs.reduce((min, l) => l.date < min ? l.date : min, activeLogs[0].date) : today)
      : startDate;
    const totalPossible = activeLogs.length;
    const completionRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;

    // Calculate best and worst performing habits
    const habitPerformance = Array.from(habitStats.entries())
      .map(([habitId, stats]) => ({
        habitId,
        habitName: habitMap.get(habitId)?.name ?? 'Unknown',
        completionRate: stats.total > 0 ? Math.round((stats.completions / stats.total) * 100) : 0,
        totalCompletions: stats.completions,
        totalTracked: stats.total,
      }))
      .filter((h) => h.totalTracked >= 1);

    const bestPerformingHabits = [...habitPerformance]
      .sort((a, b) => b.completionRate - a.completionRate || b.totalCompletions - a.totalCompletions)
      .slice(0, 5);

    const needsImprovementHabits = [...habitPerformance]
      .sort((a, b) => a.completionRate - b.completionRate || a.totalCompletions - b.totalCompletions)
      .slice(0, 5);

    // Calculate category performance
    const categoryPerformance: Record<HabitCategory, { completions: number; total: number; rate: number }> = {
      health: { completions: 0, total: 0, rate: 0 },
      fitness: { completions: 0, total: 0, rate: 0 },
      productivity: { completions: 0, total: 0, rate: 0 },
      mindfulness: { completions: 0, total: 0, rate: 0 },
      learning: { completions: 0, total: 0, rate: 0 },
      social: { completions: 0, total: 0, rate: 0 },
      finance: { completions: 0, total: 0, rate: 0 },
      creativity: { completions: 0, total: 0, rate: 0 },
      other: { completions: 0, total: 0, rate: 0 },
    };

    for (const [category, stats] of categoryStats.entries()) {
      categoryPerformance[category] = {
        completions: stats.completions,
        total: stats.total,
        rate: stats.total > 0 ? Math.round((stats.completions / stats.total) * 100) : 0,
      };
    }

    // Calculate daily trend
    const dailyTrend = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        completions: stats.completions,
        total: stats.total,
        rate: stats.total > 0 ? Math.round((stats.completions / stats.total) * 100) : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate average daily completion rate
    const avgDailyCompletionRate = dailyTrend.length > 0
      ? Math.round(dailyTrend.reduce((sum, d) => sum + d.rate, 0) / dailyTrend.length)
      : 0;

    return {
      success: true,
      data: {
        period,
        startDate: actualStartDate,
        endDate,
        totalCompletions,
        totalPossible,
        completionRate,
        completionsByDayOfWeek,
        trackedDaysByDayOfWeek,
        bestPerformingHabits,
        needsImprovementHabits,
        categoryPerformance,
        dailyTrend,
        totalActiveDays: activeDates.size,
        avgDailyCompletionRate,
      },
    };
  } catch (error) {
    if (error instanceof StatisticsServiceError) {
      return { success: false, error };
    }
    return {
      success: false,
      error: new StatisticsServiceError(
        'Failed to get period statistics',
        StatisticsServiceErrorCode.OPERATION_FAILED,
        error
      ),
    };
  }
}
