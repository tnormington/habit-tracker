'use client';

/**
 * React Hook for Habits Collection
 * Provides reactive queries and CRUD operations for habits with optimistic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDatabase } from './useDatabase';
import type {
  HabitDocType,
  HabitDocument,
  HabitType,
  HabitCategory,
  HabitColor,
} from './types';
import type { RxQuery, MangoQuery } from 'rxdb';

/** Input type for creating a new habit */
export interface CreateHabitInput {
  name: string;
  description?: string;
  type: HabitType;
  category: HabitCategory;
  color: HabitColor;
}

/** Input type for updating a habit */
export interface UpdateHabitInput {
  name?: string;
  description?: string;
  type?: HabitType;
  category?: HabitCategory;
  color?: HabitColor;
  isArchived?: boolean;
}

/** Filter options for querying habits */
export interface HabitsFilter {
  type?: HabitType;
  category?: HabitCategory;
  isArchived?: boolean;
}

/** Sort options for habits */
export interface HabitsSort {
  field: 'name' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

/** Result type for useHabits hook */
export interface UseHabitsResult {
  /** Array of habits matching the current filter/sort */
  habits: HabitDocType[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether data is ready to use */
  isReady: boolean;
  /** Create a new habit with optimistic update */
  createHabit: (input: CreateHabitInput) => Promise<HabitDocument>;
  /** Update an existing habit with optimistic update */
  updateHabit: (id: string, input: UpdateHabitInput) => Promise<HabitDocument | null>;
  /** Delete a habit (soft delete by archiving) */
  archiveHabit: (id: string) => Promise<HabitDocument | null>;
  /** Permanently delete a habit */
  deleteHabit: (id: string) => Promise<boolean>;
  /** Get a single habit by ID */
  getHabit: (id: string) => Promise<HabitDocument | null>;
  /** Refresh data manually */
  refresh: () => void;
}

/** Generate a unique ID for habits */
function generateId(): string {
  return `habit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Hook to access and manage habits with reactive queries
 *
 * @param filter - Optional filter options
 * @param sort - Optional sort options (defaults to createdAt desc)
 * @returns UseHabitsResult with habits data and CRUD operations
 *
 * @example
 * ```tsx
 * // Basic usage - get all active habits
 * const { habits, createHabit, isLoading } = useHabits();
 *
 * // With filter - only positive habits in health category
 * const { habits } = useHabits({
 *   filter: { type: 'positive', category: 'health', isArchived: false }
 * });
 *
 * // With custom sort
 * const { habits } = useHabits({
 *   sort: { field: 'name', direction: 'asc' }
 * });
 * ```
 */
export function useHabits(options?: {
  filter?: HabitsFilter;
  sort?: HabitsSort;
}): UseHabitsResult {
  const { database, isReady: isDatabaseReady, error: dbError } = useDatabase();
  const [habits, setHabits] = useState<HabitDocType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track subscription for cleanup
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Extract options with defaults
  const filter = options?.filter;
  const sort = options?.sort ?? { field: 'createdAt', direction: 'desc' };

  // Setup reactive query subscription
  useEffect(() => {
    if (!isDatabaseReady || !database) {
      setIsLoading(!dbError);
      return;
    }

    // Build query based on filter
    const selector: MangoQuery<HabitDocType>['selector'] = {};

    if (filter?.type !== undefined) {
      selector.type = filter.type;
    }
    if (filter?.category !== undefined) {
      selector.category = filter.category;
    }
    if (filter?.isArchived !== undefined) {
      selector.isArchived = filter.isArchived;
    }

    // Create the query
    let query: RxQuery<HabitDocType, HabitDocument[]>;

    if (Object.keys(selector).length > 0) {
      query = database.habits.find({ selector });
    } else {
      query = database.habits.find();
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
        const habitData = results.map((doc) => doc.toJSON() as HabitDocType);
        setHabits(habitData);
        setIsLoading(false);
        setError(null);
      },
      error: (err) => {
        console.error('Habits query error:', err);
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
    filter?.type,
    filter?.category,
    filter?.isArchived,
    sort.field,
    sort.direction,
  ]);

  // Create a new habit with optimistic update
  const createHabit = useCallback(
    async (input: CreateHabitInput): Promise<HabitDocument> => {
      if (!database) {
        throw new Error('Database not initialized');
      }

      const now = Date.now();
      const newHabit: HabitDocType = {
        id: generateId(),
        name: input.name,
        description: input.description ?? '',
        type: input.type,
        category: input.category,
        color: input.color,
        createdAt: now,
        updatedAt: now,
        isArchived: false,
      };

      // Optimistic update
      setHabits((prev) => [newHabit, ...prev]);

      try {
        const doc = await database.habits.insert(newHabit);
        return doc;
      } catch (err) {
        // Rollback on error
        setHabits((prev) => prev.filter((h) => h.id !== newHabit.id));
        throw err;
      }
    },
    [database]
  );

  // Update an existing habit with optimistic update
  const updateHabit = useCallback(
    async (
      id: string,
      input: UpdateHabitInput
    ): Promise<HabitDocument | null> => {
      if (!database) {
        throw new Error('Database not initialized');
      }

      const doc = await database.habits.findOne(id).exec();
      if (!doc) {
        return null;
      }

      const previousData = doc.toJSON() as HabitDocType;
      const updates = {
        ...input,
        updatedAt: Date.now(),
      };

      // Optimistic update
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
      );

      try {
        const updated = await doc.patch(updates);
        return updated;
      } catch (err) {
        // Rollback on error
        setHabits((prev) =>
          prev.map((h) => (h.id === id ? previousData : h))
        );
        throw err;
      }
    },
    [database]
  );

  // Soft delete (archive) a habit
  const archiveHabit = useCallback(
    async (id: string): Promise<HabitDocument | null> => {
      return updateHabit(id, { isArchived: true });
    },
    [updateHabit]
  );

  // Permanently delete a habit
  const deleteHabit = useCallback(
    async (id: string): Promise<boolean> => {
      if (!database) {
        throw new Error('Database not initialized');
      }

      const doc = await database.habits.findOne(id).exec();
      if (!doc) {
        return false;
      }

      const previousData = doc.toJSON() as HabitDocType;

      // Optimistic update
      setHabits((prev) => prev.filter((h) => h.id !== id));

      try {
        await doc.remove();
        return true;
      } catch (err) {
        // Rollback on error
        setHabits((prev) => [...prev, previousData]);
        throw err;
      }
    },
    [database]
  );

  // Get a single habit by ID
  const getHabit = useCallback(
    async (id: string): Promise<HabitDocument | null> => {
      if (!database) {
        throw new Error('Database not initialized');
      }

      return database.habits.findOne(id).exec();
    },
    [database]
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
    habits,
    isLoading: isLoading || !isDatabaseReady,
    error: error ?? dbError,
    isReady: isDatabaseReady && !isLoading && !error,
    createHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
    getHabit,
    refresh,
  };
}

/**
 * Hook to get a single habit by ID with reactive updates
 *
 * @param id - The habit ID to watch
 * @returns The habit data or null, plus loading/error states
 */
export function useHabit(id: string | null): {
  habit: HabitDocType | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { database, isReady: isDatabaseReady, error: dbError } = useDatabase();
  const [habit, setHabit] = useState<HabitDocType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isDatabaseReady || !database || !id) {
      setIsLoading(!dbError && !!id);
      if (!id) setHabit(null);
      return;
    }

    setIsLoading(true);
    const subscription = database.habits.findOne(id).$.subscribe({
      next: (doc) => {
        setHabit(doc ? (doc.toJSON() as HabitDocType) : null);
        setIsLoading(false);
        setError(null);
      },
      error: (err) => {
        console.error('Habit query error:', err);
        setError(err instanceof Error ? err : new Error('Query failed'));
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [database, isDatabaseReady, dbError, id]);

  return {
    habit,
    isLoading: isLoading || !isDatabaseReady,
    error: error ?? dbError,
  };
}
