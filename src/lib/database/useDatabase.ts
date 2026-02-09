'use client';

/**
 * React Hook for Database Access
 * Provides easy access to the RxDB database in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { getDatabase, isDatabaseInitialized, destroyDatabase } from './database';
import type { HabitTrackerDatabase } from './types';
import { DatabaseError, DatabaseErrorCode } from './types';

export interface UseDatabaseResult {
  database: HabitTrackerDatabase | null;
  isLoading: boolean;
  error: DatabaseError | null;
  isReady: boolean;
  retry: () => void;
}

/**
 * Hook to access the RxDB database instance
 * Handles initialization, loading states, and errors
 */
export function useDatabase(): UseDatabaseResult {
  const [database, setDatabase] = useState<HabitTrackerDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<DatabaseError | null>(null);

  const initializeDatabase = useCallback(async () => {
    // Skip on server-side
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const db = await getDatabase();
      setDatabase(db);
    } catch (err) {
      if (err instanceof DatabaseError) {
        setError(err);
      } else {
        setError(
          new DatabaseError(
            err instanceof Error ? err.message : 'Unknown database error',
            DatabaseErrorCode.UNKNOWN,
            err
          )
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeDatabase();

    // Cleanup on unmount (optional - depends on app requirements)
    // Uncomment if you want to destroy database when component unmounts
    // return () => { destroyDatabase(); };
  }, [initializeDatabase]);

  const retry = useCallback(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  return {
    database,
    isLoading,
    error,
    isReady: database !== null && !isLoading && !error,
    retry,
  };
}

/**
 * Hook to check if database is available
 * Lightweight check without triggering initialization
 */
export function useDatabaseStatus(): {
  isInitialized: boolean;
  isAvailable: boolean;
} {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return;
    }

    setIsAvailable('indexedDB' in window);
    setIsInitialized(isDatabaseInitialized());

    // Periodically check initialization status
    const interval = setInterval(() => {
      setIsInitialized(isDatabaseInitialized());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { isInitialized, isAvailable };
}
