'use client';

/**
 * React Hook for Habit Logs Collection
 * Provides reactive queries and CRUD operations for daily habit tracking with optimistic updates
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDatabase } from './useDatabase';
import type { HabitLogDocType, HabitLogDocument } from './types';
import type { RxQuery, MangoQuery } from 'rxdb';

/** Input type for creating a new habit log */
export interface CreateHabitLogInput {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  notes?: string;
}

/** Input type for updating a habit log */
export interface UpdateHabitLogInput {
  completed?: boolean;
  notes?: string;
}

/** Filter options for querying habit logs */
export interface HabitLogsFilter {
  habitId?: string;
  date?: string; // YYYY-MM-DD format
  startDate?: string; // YYYY-MM-DD format (inclusive)
  endDate?: string; // YYYY-MM-DD format (inclusive)
  completed?: boolean;
}

/** Sort options for habit logs */
export interface HabitLogsSort {
  field: 'date' | 'createdAt';
  direction: 'asc' | 'desc';
}

/** Result type for useHabitLogs hook */
export interface UseHabitLogsResult {
  /** Array of habit logs matching the current filter/sort */
  logs: HabitLogDocType[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether data is ready to use */
  isReady: boolean;
  /** Create a new habit log with optimistic update */
  createLog: (input: CreateHabitLogInput) => Promise<HabitLogDocument>;
  /** Update an existing habit log with optimistic update */
  updateLog: (id: string, input: UpdateHabitLogInput) => Promise<HabitLogDocument | null>;
  /** Delete a habit log */
  deleteLog: (id: string) => Promise<boolean>;
  /** Get a single habit log by ID */
  getLog: (id: string) => Promise<HabitLogDocument | null>;
  /** Toggle completion status for a habit on a date */
  toggleCompletion: (habitId: string, date: string) => Promise<HabitLogDocument>;
  /** Get logs grouped by date */
  logsByDate: Map<string, HabitLogDocType[]>;
  /** Refresh data manually */
  refresh: () => void;
}

/** Generate a unique ID for habit logs */
function generateId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Hook to access and manage habit logs with reactive queries
 *
 * @param filter - Optional filter options
 * @param sort - Optional sort options (defaults to date desc)
 * @returns UseHabitLogsResult with logs data and CRUD operations
 *
 * @example
 * ```tsx
 * // Basic usage - get all logs
 * const { logs, createLog, toggleCompletion } = useHabitLogs();
 *
 * // With filter - logs for a specific habit
 * const { logs } = useHabitLogs({
 *   filter: { habitId: 'habit_123' }
 * });
 *
 * // With date range filter
 * const { logs } = useHabitLogs({
 *   filter: { startDate: '2025-01-01', endDate: '2025-01-31' }
 * });
 *
 * // Get logs for today
 * const today = new Date().toISOString().split('T')[0];
 * const { logs } = useHabitLogs({
 *   filter: { date: today }
 * });
 * ```
 */
export function useHabitLogs(options?: {
  filter?: HabitLogsFilter;
  sort?: HabitLogsSort;
}): UseHabitLogsResult {
  const { database, isReady: isDatabaseReady, error: dbError } = useDatabase();
  const [logs, setLogs] = useState<HabitLogDocType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track subscription for cleanup
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Extract options with defaults
  const filter = options?.filter;
  const sort = options?.sort ?? { field: 'date', direction: 'desc' };

  // Setup reactive query subscription
  useEffect(() => {
    if (!isDatabaseReady || !database) {
      setIsLoading(!dbError);
      return;
    }

    // Build query based on filter
    const selector: MangoQuery<HabitLogDocType>['selector'] = {};

    if (filter?.habitId !== undefined) {
      selector.habitId = filter.habitId;
    }
    if (filter?.date !== undefined) {
      selector.date = filter.date;
    }
    if (filter?.completed !== undefined) {
      selector.completed = filter.completed;
    }

    // Handle date range filtering
    if (filter?.startDate !== undefined || filter?.endDate !== undefined) {
      selector.date = {};
      if (filter?.startDate !== undefined) {
        (selector.date as { $gte?: string }).$gte = filter.startDate;
      }
      if (filter?.endDate !== undefined) {
        (selector.date as { $lte?: string }).$lte = filter.endDate;
      }
    }

    // Create the query
    let query: RxQuery<HabitLogDocType, HabitLogDocument[]>;

    if (Object.keys(selector).length > 0) {
      query = database.habit_logs.find({ selector });
    } else {
      query = database.habit_logs.find();
    }

    // Apply sorting
    if (sort.direction === 'asc') {
      query = query.sort(sort.field);
    } else {
      query = query.sort({ [sort.field]: 'desc' as const });
    }

    // Subscribe to query results with reactive updates
    setIsLoading(true);
    const subscription = query.$.subscribe({
      next: (results) => {
        // Map RxDocuments to plain objects for React state
        const logData = results.map((doc) => doc.toJSON() as HabitLogDocType);
        setLogs(logData);
        setIsLoading(false);
        setError(null);
      },
      error: (err) => {
        console.error('Habit logs query error:', err);
        setError(err instanceof Error ? err : new Error('Query failed'));
        setIsLoading(false);
      },
    });

    subscriptionRef.current = subscription;

    // Cleanup subscription on unmount or dependency change
    return () => {
      subscription.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [
    database,
    isDatabaseReady,
    dbError,
    filter?.habitId,
    filter?.date,
    filter?.startDate,
    filter?.endDate,
    filter?.completed,
    sort.field,
    sort.direction,
  ]);

  // Compute logs grouped by date
  const logsByDate = useMemo(() => {
    const grouped = new Map<string, HabitLogDocType[]>();
    for (const log of logs) {
      const existing = grouped.get(log.date) ?? [];
      existing.push(log);
      grouped.set(log.date, existing);
    }
    return grouped;
  }, [logs]);

  // Create a new habit log with optimistic update
  const createLog = useCallback(
    async (input: CreateHabitLogInput): Promise<HabitLogDocument> => {
      if (!database) {
        throw new Error('Database not initialized');
      }

      const now = Date.now();
      const newLog: HabitLogDocType = {
        id: generateId(),
        habitId: input.habitId,
        date: input.date,
        completed: input.completed,
        notes: input.notes ?? '',
        createdAt: now,
      };

      // Optimistic update
      setLogs((prev) => [newLog, ...prev]);

      try {
        const doc = await database.habit_logs.insert(newLog);
        return doc;
      } catch (err) {
        // Rollback on error
        setLogs((prev) => prev.filter((l) => l.id !== newLog.id));
        throw err;
      }
    },
    [database]
  );

  // Update an existing habit log with optimistic update
  const updateLog = useCallback(
    async (
      id: string,
      input: UpdateHabitLogInput
    ): Promise<HabitLogDocument | null> => {
      if (!database) {
        throw new Error('Database not initialized');
      }

      const doc = await database.habit_logs.findOne(id).exec();
      if (!doc) {
        return null;
      }

      const previousData = doc.toJSON() as HabitLogDocType;

      // Optimistic update
      setLogs((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...input } : l))
      );

      try {
        const updated = await doc.patch(input);
        return updated;
      } catch (err) {
        // Rollback on error
        setLogs((prev) =>
          prev.map((l) => (l.id === id ? previousData : l))
        );
        throw err;
      }
    },
    [database]
  );

  // Delete a habit log
  const deleteLog = useCallback(
    async (id: string): Promise<boolean> => {
      if (!database) {
        throw new Error('Database not initialized');
      }

      const doc = await database.habit_logs.findOne(id).exec();
      if (!doc) {
        return false;
      }

      const previousData = doc.toJSON() as HabitLogDocType;

      // Optimistic update
      setLogs((prev) => prev.filter((l) => l.id !== id));

      try {
        await doc.remove();
        return true;
      } catch (err) {
        // Rollback on error
        setLogs((prev) => [...prev, previousData]);
        throw err;
      }
    },
    [database]
  );

  // Get a single habit log by ID
  const getLog = useCallback(
    async (id: string): Promise<HabitLogDocument | null> => {
      if (!database) {
        throw new Error('Database not initialized');
      }

      return database.habit_logs.findOne(id).exec();
    },
    [database]
  );

  // Toggle completion status for a habit on a specific date
  const toggleCompletion = useCallback(
    async (habitId: string, date: string): Promise<HabitLogDocument> => {
      if (!database) {
        throw new Error('Database not initialized');
      }

      // Find existing log for this habit and date
      const existingLog = await database.habit_logs
        .findOne({
          selector: {
            habitId,
            date,
          },
        })
        .exec();

      if (existingLog) {
        // Toggle existing log
        const currentCompleted = existingLog.completed;
        const previousData = existingLog.toJSON() as HabitLogDocType;

        // Optimistic update
        setLogs((prev) =>
          prev.map((l) =>
            l.id === existingLog.id ? { ...l, completed: !currentCompleted } : l
          )
        );

        try {
          const updated = await existingLog.patch({
            completed: !currentCompleted,
          });
          return updated;
        } catch (err) {
          // Rollback on error
          setLogs((prev) =>
            prev.map((l) => (l.id === existingLog.id ? previousData : l))
          );
          throw err;
        }
      } else {
        // Create new log with completed=true
        return createLog({
          habitId,
          date,
          completed: true,
        });
      }
    },
    [database, createLog]
  );

  // Manual refresh - re-execute the query
  const refresh = useCallback(() => {
    if (subscriptionRef.current) {
      // The subscription will automatically update when data changes
      // This is mainly for forcing a re-render if needed
      setIsLoading(true);
      setIsLoading(false);
    }
  }, []);

  return {
    logs,
    isLoading: isLoading || !isDatabaseReady,
    error: error ?? dbError,
    isReady: isDatabaseReady && !isLoading && !error,
    createLog,
    updateLog,
    deleteLog,
    getLog,
    toggleCompletion,
    logsByDate,
    refresh,
  };
}

/**
 * Hook to get habit logs for a specific habit with reactive updates
 *
 * @param habitId - The habit ID to get logs for
 * @param dateRange - Optional date range filter
 * @returns Logs for the habit plus loading/error states
 */
export function useHabitLogsForHabit(
  habitId: string | null,
  dateRange?: { startDate?: string; endDate?: string }
): {
  logs: HabitLogDocType[];
  isLoading: boolean;
  error: Error | null;
  completedDates: Set<string>;
} {
  const { logs, isLoading, error } = useHabitLogs(
    habitId
      ? {
          filter: {
            habitId,
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
          },
          sort: { field: 'date', direction: 'desc' },
        }
      : undefined
  );

  // Compute set of completed dates for easy lookup
  const completedDates = useMemo(() => {
    const dates = new Set<string>();
    for (const log of logs) {
      if (log.completed) {
        dates.add(log.date);
      }
    }
    return dates;
  }, [logs]);

  return {
    logs: habitId ? logs : [],
    isLoading,
    error,
    completedDates,
  };
}

/**
 * Hook to get habit logs for a specific date with reactive updates
 *
 * @param date - The date in YYYY-MM-DD format
 * @returns Logs for the date plus loading/error states
 */
export function useHabitLogsForDate(date: string | null): {
  logs: HabitLogDocType[];
  isLoading: boolean;
  error: Error | null;
  completedHabitIds: Set<string>;
} {
  const { logs, isLoading, error } = useHabitLogs(
    date
      ? {
          filter: { date },
          sort: { field: 'createdAt', direction: 'asc' },
        }
      : undefined
  );

  // Compute set of completed habit IDs for easy lookup
  const completedHabitIds = useMemo(() => {
    const ids = new Set<string>();
    for (const log of logs) {
      if (log.completed) {
        ids.add(log.habitId);
      }
    }
    return ids;
  }, [logs]);

  return {
    logs: date ? logs : [],
    isLoading,
    error,
    completedHabitIds,
  };
}

/**
 * Hook to get a single habit log by habit ID and date
 *
 * @param habitId - The habit ID
 * @param date - The date in YYYY-MM-DD format
 * @returns The habit log or null
 */
export function useHabitLog(
  habitId: string | null,
  date: string | null
): {
  log: HabitLogDocType | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { database, isReady: isDatabaseReady, error: dbError } = useDatabase();
  const [log, setLog] = useState<HabitLogDocType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isDatabaseReady || !database || !habitId || !date) {
      setIsLoading(!dbError && !!habitId && !!date);
      if (!habitId || !date) setLog(null);
      return;
    }

    setIsLoading(true);
    const subscription = database.habit_logs
      .findOne({
        selector: {
          habitId,
          date,
        },
      })
      .$.subscribe({
        next: (doc) => {
          setLog(doc ? (doc.toJSON() as HabitLogDocType) : null);
          setIsLoading(false);
          setError(null);
        },
        error: (err) => {
          console.error('Habit log query error:', err);
          setError(err instanceof Error ? err : new Error('Query failed'));
          setIsLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [database, isDatabaseReady, dbError, habitId, date]);

  return {
    log,
    isLoading: isLoading || !isDatabaseReady,
    error: error ?? dbError,
  };
}
