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

// Habit Service Functions
export {
  // CRUD operations
  createHabit,
  getHabitById,
  getHabits,
  getActiveHabits,
  getArchivedHabits,
  getHabitsByType,
  getHabitsByCategory,
  updateHabit,
  archiveHabit,
  restoreHabit,
  deleteHabit,
  countHabits,
  habitExists,
  bulkDeleteHabits,
  bulkArchiveHabits,
  // Validation functions
  validateHabitName,
  validateHabitDescription,
  validateHabitType,
  validateHabitCategory,
  validateHabitColor,
  validateCreateHabitData,
  validateUpdateHabitData,
  // Constants
  VALID_HABIT_TYPES,
  VALID_HABIT_CATEGORIES,
  VALID_HABIT_COLORS,
  // Error class and codes
  HabitServiceError,
  HabitServiceErrorCode,
} from './habitService';

export type {
  CreateHabitData,
  UpdateHabitData,
  HabitQueryOptions,
  HabitServiceResult,
} from './habitService';
