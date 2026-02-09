'use client';

/**
 * RxDB Database Service
 * Singleton database initialization service with proper error handling
 *
 * This module is client-only as RxDB with IndexedDB only works in the browser.
 */

import type {
  HabitTrackerDatabase,
  DatabaseInitOptions,
} from './types';
import {
  DatabaseError,
  DatabaseErrorCode,
} from './types';
import { habitSchema, habitCompletionSchema, habitLogSchema } from './schemas';

// Database singleton instance
let databaseInstance: HabitTrackerDatabase | null = null;
let initializationPromise: Promise<HabitTrackerDatabase> | null = null;
let pluginsInitialized = false;

// Default database name
const DEFAULT_DATABASE_NAME = 'habit-tracker-db';

/**
 * Initialize RxDB plugins (only once)
 * Uses dynamic imports to ensure client-side only loading
 */
async function initializePlugins(): Promise<void> {
  if (pluginsInitialized) {
    return;
  }

  const { addRxPlugin } = await import('rxdb');

  // Add update plugin for document updates
  const { RxDBUpdatePlugin } = await import('rxdb/plugins/update');
  addRxPlugin(RxDBUpdatePlugin);

  // Add query-builder plugin for advanced queries
  const { RxDBQueryBuilderPlugin } = await import('rxdb/plugins/query-builder');
  addRxPlugin(RxDBQueryBuilderPlugin);

  // Note: dev-mode plugin is skipped as it can cause bundling issues with Next.js
  // Error validation is still available through RxDB's built-in error handling

  pluginsInitialized = true;
}

/**
 * Check if IndexedDB is available in the current environment
 */
function isIndexedDBAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Create and configure the RxDB database
 */
async function createDatabase(
  options: DatabaseInitOptions = {}
): Promise<HabitTrackerDatabase> {
  const { name = DEFAULT_DATABASE_NAME } = options;

  // Verify IndexedDB availability
  if (!isIndexedDBAvailable()) {
    throw new DatabaseError(
      'IndexedDB is not available in this environment',
      DatabaseErrorCode.STORAGE_NOT_AVAILABLE
    );
  }

  // Initialize plugins before creating database
  await initializePlugins();

  try {
    // Dynamic import RxDB core
    const { createRxDatabase } = await import('rxdb');
    const { getRxStorageDexie } = await import('rxdb/plugins/storage-dexie');

    // Create the database with Dexie storage (IndexedDB adapter)
    // Note: ignoreDuplicate is not used - we rely on singleton pattern instead
    // multiInstance enables multi-tab support for browser environments
    const db = await createRxDatabase<HabitTrackerDatabase>({
      name,
      storage: getRxStorageDexie(),
      multiInstance: true, // Enable multi-tab support
      eventReduce: true, // Enable event-reduce for better performance
    });

    // Create collections
    await db.addCollections({
      habits: {
        schema: habitSchema,
      },
      habit_completions: {
        schema: habitCompletionSchema,
      },
      habit_logs: {
        schema: habitLogSchema,
      },
    });

    return db;
  } catch (error) {
    // Handle specific RxDB errors
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        throw new DatabaseError(
          'Database already exists',
          DatabaseErrorCode.ALREADY_INITIALIZED,
          error
        );
      }
      if (error.message.includes('collection')) {
        throw new DatabaseError(
          'Failed to create database collections',
          DatabaseErrorCode.COLLECTION_CREATION_FAILED,
          error
        );
      }
    }

    throw new DatabaseError(
      'Failed to initialize database',
      DatabaseErrorCode.INITIALIZATION_FAILED,
      error
    );
  }
}

/**
 * Get the database instance (singleton pattern)
 * Creates the database if it doesn't exist
 */
export async function getDatabase(
  options?: DatabaseInitOptions
): Promise<HabitTrackerDatabase> {
  // Return existing instance if available
  if (databaseInstance) {
    return databaseInstance;
  }

  // Return existing initialization promise if in progress
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = createDatabase(options)
    .then((db) => {
      databaseInstance = db;
      return db;
    })
    .catch((error) => {
      // Reset state on failure to allow retry
      initializationPromise = null;
      throw error;
    });

  return initializationPromise;
}

/**
 * Check if database is initialized
 */
export function isDatabaseInitialized(): boolean {
  return databaseInstance !== null;
}

/**
 * Get the database instance without initializing
 * Returns null if not initialized
 */
export function getDatabaseSync(): HabitTrackerDatabase | null {
  return databaseInstance;
}

/**
 * Close the database instance
 * Useful for testing or cleanup
 */
export async function destroyDatabase(): Promise<void> {
  if (databaseInstance) {
    await databaseInstance.close();
    databaseInstance = null;
    initializationPromise = null;
  }
}

/**
 * Remove the database completely (including all data)
 * Warning: This will delete all data!
 */
export async function removeDatabase(
  name: string = DEFAULT_DATABASE_NAME
): Promise<void> {
  // Destroy instance first if exists
  await destroyDatabase();

  if (!isIndexedDBAvailable()) {
    throw new DatabaseError(
      'IndexedDB is not available',
      DatabaseErrorCode.STORAGE_NOT_AVAILABLE
    );
  }

  try {
    const { removeRxDatabase } = await import('rxdb');
    const { getRxStorageDexie } = await import('rxdb/plugins/storage-dexie');
    await removeRxDatabase(name, getRxStorageDexie());
  } catch (error) {
    throw new DatabaseError(
      'Failed to remove database',
      DatabaseErrorCode.UNKNOWN,
      error
    );
  }
}
