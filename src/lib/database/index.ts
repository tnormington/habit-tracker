/**
 * Database module exports
 * Re-exports all database functionality for easy imports
 */

// Database service
export {
  getDatabase,
  isDatabaseInitialized,
  getDatabaseSync,
  destroyDatabase,
  removeDatabase,
} from './database';

// React hooks
export { useDatabase, useDatabaseStatus } from './useDatabase';
export type { UseDatabaseResult } from './useDatabase';

// Types
export type {
  HabitType,
  HabitCategory,
  HabitColor,
  HabitDocType,
  HabitCompletionDocType,
  HabitLogDocType,
  HabitDocument,
  HabitCompletionDocument,
  HabitLogDocument,
  HabitCollection,
  HabitCompletionCollection,
  HabitLogCollection,
  DatabaseCollections,
  HabitTrackerDatabase,
  DatabaseInitOptions,
} from './types';

export { DatabaseError, DatabaseErrorCode } from './types';

// Schemas
export { habitSchema, habitCompletionSchema, habitLogSchema } from './schemas';
