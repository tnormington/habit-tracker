'use client';

/**
 * React hooks for real-time streak data
 * Provides reactive streak calculations that update when habit logs change
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDatabase } from './useDatabase';
import {
  calculateStreakForHabit,
  calculateStreaksForHabits,
  calculateStreaksForAllActiveHabits,
  getStreakHistory,
  getHabitsWithActiveStreaks,
  getBestStreakEver,
  type StreakData,
  type StreakHistory,
  type StreakPeriod,
} from './streakService';

// ============================================================================
// Types
// ============================================================================

export interface UseStreakResult {
  /** Streak data for the habit */
  streakData: StreakData | null;
  /** Whether the streak data is loading */
  isLoading: boolean;
  /** Error if any occurred */
  error: Error | null;
  /** Manually refresh the streak data */
  refresh: () => Promise<void>;
}

export interface UseStreaksResult {
  /** Map of habit ID to streak data */
  streaksMap: Map<string, StreakData>;
  /** Whether the streak data is loading */
  isLoading: boolean;
  /** Error if any occurred */
  error: Error | null;
  /** Manually refresh all streak data */
  refresh: () => Promise<void>;
}

export interface UseStreakHistoryResult {
  /** Complete streak history for the habit */
  history: StreakHistory | null;
  /** Whether the history is loading */
  isLoading: boolean;
  /** Error if any occurred */
  error: Error | null;
  /** Manually refresh the history */
  refresh: () => Promise<void>;
}

export interface UseActiveStreaksResult {
  /** Array of habits with active streaks, sorted by streak length */
  activeStreaks: Array<{ habitId: string; streak: number }>;
  /** Whether the data is loading */
  isLoading: boolean;
  /** Error if any occurred */
  error: Error | null;
  /** Manually refresh the data */
  refresh: () => Promise<void>;
}

export interface UseBestStreakResult {
  /** Best streak ever achieved */
  bestStreak: { habitId: string; streak: StreakPeriod } | null;
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
 * Hook to get real-time streak data for a single habit
 *
 * @param habitId - The habit ID to get streak data for
 * @returns Streak data, loading state, error, and refresh function
 *
 * @example
 * ```tsx
 * function HabitStreakDisplay({ habitId }: { habitId: string }) {
 *   const { streakData, isLoading, error } = useStreak(habitId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!streakData) return null;
 *
 *   return (
 *     <div>
 *       <span>Current streak: {streakData.currentStreak} days</span>
 *       <span>Longest streak: {streakData.longestStreak} days</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useStreak(habitId: string | null | undefined): UseStreakResult {
  const { database, isReady } = useDatabase();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!habitId || !isReady || !database) {
      setStreakData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await calculateStreakForHabit(habitId);
      if (result.success && result.data) {
        setStreakData(result.data);
      } else {
        setError(result.error ?? new Error('Failed to calculate streak'));
        setStreakData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStreakData(null);
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
        // Recalculate streak when logs change
        refresh();
      });

    return () => subscription.unsubscribe();
  }, [database, isReady, habitId, refresh]);

  return { streakData, isLoading, error, refresh };
}

/**
 * Hook to get real-time streak data for multiple habits
 *
 * @param habitIds - Array of habit IDs to get streak data for
 * @returns Map of streak data, loading state, error, and refresh function
 */
export function useStreaks(habitIds: string[]): UseStreaksResult {
  const { database, isReady } = useDatabase();
  const [streaksMap, setStreaksMap] = useState<Map<string, StreakData>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize habitIds to prevent unnecessary re-renders
  const habitIdsKey = useMemo(() => habitIds.sort().join(','), [habitIds]);

  const refresh = useCallback(async () => {
    if (!isReady || !database || habitIds.length === 0) {
      setStreaksMap(new Map());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await calculateStreaksForHabits(habitIds);
      if (result.success && result.data) {
        setStreaksMap(result.data);
      } else {
        setError(result.error ?? new Error('Failed to calculate streaks'));
        setStreaksMap(new Map());
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStreaksMap(new Map());
    } finally {
      setIsLoading(false);
    }
  }, [isReady, database, habitIdsKey]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to habit log changes for any of these habits
  useEffect(() => {
    if (!database || !isReady || habitIds.length === 0) return;

    const subscription = database.habit_logs
      .find({
        selector: {
          habitId: { $in: habitIds },
        },
      })
      .$.subscribe(() => {
        // Recalculate streaks when logs change
        refresh();
      });

    return () => subscription.unsubscribe();
  }, [database, isReady, habitIdsKey, refresh]);

  return { streaksMap, isLoading, error, refresh };
}

/**
 * Hook to get real-time streak data for all active habits
 *
 * @returns Map of streak data, loading state, error, and refresh function
 */
export function useAllActiveStreaks(): UseStreaksResult {
  const { database, isReady } = useDatabase();
  const [streaksMap, setStreaksMap] = useState<Map<string, StreakData>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!isReady || !database) {
      setStreaksMap(new Map());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await calculateStreaksForAllActiveHabits();
      if (result.success && result.data) {
        setStreaksMap(result.data);
      } else {
        setError(result.error ?? new Error('Failed to calculate streaks'));
        setStreaksMap(new Map());
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStreaksMap(new Map());
    } finally {
      setIsLoading(false);
    }
  }, [isReady, database]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to all habit log changes
  useEffect(() => {
    if (!database || !isReady) return;

    const subscription = database.habit_logs.find().$.subscribe(() => {
      // Recalculate all streaks when any log changes
      refresh();
    });

    return () => subscription.unsubscribe();
  }, [database, isReady, refresh]);

  return { streaksMap, isLoading, error, refresh };
}

/**
 * Hook to get complete streak history for a habit
 *
 * @param habitId - The habit ID to get history for
 * @returns Streak history, loading state, error, and refresh function
 */
export function useStreakHistory(
  habitId: string | null | undefined
): UseStreakHistoryResult {
  const { database, isReady } = useDatabase();
  const [history, setHistory] = useState<StreakHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!habitId || !isReady || !database) {
      setHistory(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getStreakHistory(habitId);
      if (result.success && result.data) {
        setHistory(result.data);
      } else {
        setError(result.error ?? new Error('Failed to get streak history'));
        setHistory(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setHistory(null);
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
        // Recalculate history when logs change
        refresh();
      });

    return () => subscription.unsubscribe();
  }, [database, isReady, habitId, refresh]);

  return { history, isLoading, error, refresh };
}

/**
 * Hook to get all habits with active streaks
 *
 * @returns Active streaks array, loading state, error, and refresh function
 */
export function useActiveStreaks(): UseActiveStreaksResult {
  const { database, isReady } = useDatabase();
  const [activeStreaks, setActiveStreaks] = useState<
    Array<{ habitId: string; streak: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!isReady || !database) {
      setActiveStreaks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getHabitsWithActiveStreaks();
      if (result.success && result.data) {
        setActiveStreaks(result.data);
      } else {
        setError(result.error ?? new Error('Failed to get active streaks'));
        setActiveStreaks([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setActiveStreaks([]);
    } finally {
      setIsLoading(false);
    }
  }, [isReady, database]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to all habit log changes
  useEffect(() => {
    if (!database || !isReady) return;

    const subscription = database.habit_logs.find().$.subscribe(() => {
      refresh();
    });

    return () => subscription.unsubscribe();
  }, [database, isReady, refresh]);

  return { activeStreaks, isLoading, error, refresh };
}

/**
 * Hook to get the best streak ever achieved
 *
 * @returns Best streak data, loading state, error, and refresh function
 */
export function useBestStreak(): UseBestStreakResult {
  const { database, isReady } = useDatabase();
  const [bestStreak, setBestStreak] = useState<{
    habitId: string;
    streak: StreakPeriod;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!isReady || !database) {
      setBestStreak(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getBestStreakEver();
      if (result.success) {
        setBestStreak(result.data ?? null);
      } else {
        setError(result.error ?? new Error('Failed to get best streak'));
        setBestStreak(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setBestStreak(null);
    } finally {
      setIsLoading(false);
    }
  }, [isReady, database]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Subscribe to all habit log changes
  useEffect(() => {
    if (!database || !isReady) return;

    const subscription = database.habit_logs.find().$.subscribe(() => {
      refresh();
    });

    return () => subscription.unsubscribe();
  }, [database, isReady, refresh]);

  return { bestStreak, isLoading, error, refresh };
}
