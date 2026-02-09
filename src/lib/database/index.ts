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

// React hooks - Database access
export { useDatabase, useDatabaseStatus } from './useDatabase';
export type { UseDatabaseResult } from './useDatabase';

// React hooks - Habits collection
export { useHabits, useHabit } from './useHabits';
export type {
  CreateHabitInput,
  UpdateHabitInput,
  HabitsFilter,
  HabitsSort,
  UseHabitsResult,
} from './useHabits';

// React hooks - Habit Logs collection
export {
  useHabitLogs,
  useHabitLogsForHabit,
  useHabitLogsForDate,
  useHabitLog,
} from './useHabitLogs';
export type {
  CreateHabitLogInput,
  UpdateHabitLogInput,
  HabitLogsFilter,
  HabitLogsSort,
  UseHabitLogsResult,
} from './useHabitLogs';

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
