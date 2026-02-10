'use client';

/**
 * React hooks for real-time habit statistics
 * Provides reactive statistics calculations that update when habits or logs change
 */

import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from './useDatabase';
import {
  getHabitStatistics,
  getDashboardStatistics,
  getWeeklyTrends,
  getCompletionStatsForDate,
  getPeriodStatistics,
  type HabitStatistics,
  type DashboardStatistics,
  type WeeklyTrendPoint,
  type StatisticsPeriod,
  type PeriodStatistics,
} from './statisticsService';

// ============================================================================
// Types
// ============================================================================

export interface UseHabitStatisticsResult {
  /** Statistics for the habit */
  statistics: HabitStatistics | null;
  /** Whether the statistics are loading */
  isLoading: boolean;
  /** Error if any occurred */
  error: Error | null;
  /** Manually refresh the statistics */
  refresh: () => Promise<void>;
}

export interface UseDashboardStatisticsResult {
  /** Aggregated dashboard statistics */
  statistics: DashboardStatistics | null;
  /** Whether the statistics are loading */
  isLoading: boolean;
  /** Error if any occurred */
  error: Error | null;
  /** Manually refresh the statistics */
  refresh: () => Promise<void>;
}

export interface UseWeeklyTrendsResult {
  /** Weekly trend data */
  trends: WeeklyTrendPoint[];
  /** Whether the data is loading */
  isLoading: boolean;
  /** Error if any occurred */
  error: Error | null;
  /** Manually refresh the data */
  refresh: () => Promise<void>;
}

export interface UseDateCompletionStatsResult {
  /** Completion stats for the date */
  stats: {
    completed: number;
    total: number;
    rate: number;
    habits: Array<{ habitId: string; habitName: string; completed: boolean }>;
  } | null;
  /** Whether the data is loading */
  isLoading: boolean;
  /** Error if any occurred */
  error: Error | null;
  /** Manually refresh the data */
  refresh: () => Promise<void>;
}

export interface UsePeriodStatisticsResult {
  /** Statistics for the selected period */
  statistics: PeriodStatistics | null;
  /** Whether the data is loading */
  isLoading: boolean;
  /** Error if any occurred */
  error: Error | null;
  /** Manually refresh the data */
  refresh: () => Promise<void>;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to get real-time statistics for a single habit
 *
 * @param habitId - The habit ID to get statistics for
 * @returns Statistics, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * function HabitStatsDisplay({ habitId }: { habitId: string }) {
 *   const { statistics, isLoading, error } = useHabitStatistics(habitId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!statistics) return null;
 *
 *   return (
 *     <div>
 *       <span>Completion rate: {statistics.completionRate}%</span>
 *       <span>Current streak: {statistics.currentStreak} days</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useHabitStatistics(
  habitId: string | null | undefined
): UseHabitStatisticsResult {
  const { database, isReady } = useDatabase();
  const [statistics, setStatistics] = useState<HabitStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!habitId || !isReady || !database) {
      setStatistics(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getHabitStatistics(habitId);
      if (result.success && result.data) {
        setStatistics(result.data);
      } else {
        setError(result.error ?? new Error('Failed to get habit statistics'));
        setStatistics(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  }, [habitId, isReady, database]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to habit log changes for this habit
  useEffect(() => {
    if (!database || !isReady || !habitId) return;

    const subscription = database.habit_logs
      .find({
        selector: { habitId },
      })
      .$.subscribe(() => {
        // Recalculate statistics when logs change
        refresh();
      });

    return () => subscription.unsubscribe();
  }, [database, isReady, habitId, refresh]);

  return { statistics, isLoading, error, refresh };
}

/**
 * Hook to get real-time dashboard statistics
 *
 * @returns Dashboard statistics, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * function DashboardStats() {
 *   const { statistics, isLoading, error } = useDashboardStatistics();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!statistics) return null;
 *
 *   return (
 *     <div>
 *       <span>Overall completion rate: {statistics.overallCompletionRate}%</span>
 *       <span>Active streaks: {statistics.totalActiveStreaks}</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDashboardStatistics(): UseDashboardStatisticsResult {
  const { database, isReady } = useDatabase();
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!isReady || !database) {
      setStatistics(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getDashboardStatistics();
      if (result.success && result.data) {
        setStatistics(result.data);
      } else {
        setError(result.error ?? new Error('Failed to get dashboard statistics'));
        setStatistics(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  }, [isReady, database]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to habit and habit log changes
  useEffect(() => {
    if (!database || !isReady) return;

    // Subscribe to habit changes
    const habitsSubscription = database.habits.find().$.subscribe(() => {
      refresh();
    });

    // Subscribe to habit log changes
    const logsSubscription = database.habit_logs.find().$.subscribe(() => {
      refresh();
    });

    return () => {
      habitsSubscription.unsubscribe();
      logsSubscription.unsubscribe();
    };
  }, [database, isReady, refresh]);

  return { statistics, isLoading, error, refresh };
}

/**
 * Hook to get weekly trend data
 *
 * @param weeks - Number of weeks to include (default 12, max 52)
 * @returns Weekly trends, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * function WeeklyTrendsChart() {
 *   const { trends, isLoading, error } = useWeeklyTrends(12);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {trends.map((week) => (
 *         <div key={week.weekStart}>
 *           {week.weekStart}: {week.rate}% ({week.completions} completions)
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWeeklyTrends(weeks: number = 12): UseWeeklyTrendsResult {
  const { database, isReady } = useDatabase();
  const [trends, setTrends] = useState<WeeklyTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!isReady || !database) {
      setTrends([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getWeeklyTrends(weeks);
      if (result.success && result.data) {
        setTrends(result.data);
      } else {
        setError(result.error ?? new Error('Failed to get weekly trends'));
        setTrends([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setTrends([]);
    } finally {
      setIsLoading(false);
    }
  }, [isReady, database, weeks]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to habit log changes
  useEffect(() => {
    if (!database || !isReady) return;

    const subscription = database.habit_logs.find().$.subscribe(() => {
      refresh();
    });

    return () => subscription.unsubscribe();
  }, [database, isReady, refresh]);

  return { trends, isLoading, error, refresh };
}

/**
 * Hook to get completion stats for a specific date
 *
 * @param date - Date in YYYY-MM-DD format (defaults to today)
 * @returns Completion stats, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * function TodayStats() {
 *   const { stats, isLoading, error } = useDateCompletionStats();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!stats) return null;
 *
 *   return (
 *     <div>
 *       Today: {stats.completed}/{stats.total} ({stats.rate}%)
 *     </div>
 *   );
 * }
 * ```
 */
export function useDateCompletionStats(
  date?: string
): UseDateCompletionStatsResult {
  const { database, isReady } = useDatabase();
  const [stats, setStats] = useState<UseDateCompletionStatsResult['stats']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Default to today if no date provided
  const targetDate = date ?? new Date().toISOString().split('T')[0];

  const refresh = useCallback(async () => {
    if (!isReady || !database) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getCompletionStatsForDate(targetDate);
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        setError(result.error ?? new Error('Failed to get completion stats'));
        setStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [isReady, database, targetDate]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to habit and habit log changes
  useEffect(() => {
    if (!database || !isReady) return;

    // Subscribe to habit changes
    const habitsSubscription = database.habits.find().$.subscribe(() => {
      refresh();
    });

    // Subscribe to habit log changes for the target date
    const logsSubscription = database.habit_logs
      .find({
        selector: { date: targetDate },
      })
      .$.subscribe(() => {
        refresh();
      });

    return () => {
      habitsSubscription.unsubscribe();
      logsSubscription.unsubscribe();
    };
  }, [database, isReady, targetDate, refresh]);

  return { stats, isLoading, error, refresh };
}

/**
 * Hook to get statistics for a specific time period
 *
 * @param period - The time period ('week', 'month', 'year', 'all')
 * @returns Period statistics, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * function PeriodStatsDisplay() {
 *   const [period, setPeriod] = useState<StatisticsPeriod>('month');
 *   const { statistics, isLoading, error } = usePeriodStatistics(period);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!statistics) return null;
 *
 *   return (
 *     <div>
 *       <span>Completion rate: {statistics.completionRate}%</span>
 *       <span>Total completions: {statistics.totalCompletions}</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePeriodStatistics(
  period: StatisticsPeriod
): UsePeriodStatisticsResult {
  const { database, isReady } = useDatabase();
  const [statistics, setStatistics] = useState<PeriodStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!isReady || !database) {
      setStatistics(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getPeriodStatistics(period);
      if (result.success && result.data) {
        setStatistics(result.data);
      } else {
        setError(result.error ?? new Error('Failed to get period statistics'));
        setStatistics(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  }, [isReady, database, period]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to habit and habit log changes
  useEffect(() => {
    if (!database || !isReady) return;

    // Subscribe to habit changes
    const habitsSubscription = database.habits.find().$.subscribe(() => {
      refresh();
    });

    // Subscribe to habit log changes
    const logsSubscription = database.habit_logs.find().$.subscribe(() => {
      refresh();
    });

    return () => {
      habitsSubscription.unsubscribe();
      logsSubscription.unsubscribe();
    };
  }, [database, isReady, refresh]);

  return { statistics, isLoading, error, refresh };
}
