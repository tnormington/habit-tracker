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
  HabitFrequency,
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
export { habitSchema, habitCompletionSchema, habitLogSchema, notificationSettingsSchema } from './schemas';

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
  // Migration functions
  migrateNegativeHabitsToDaily,
  // Validation functions
  validateHabitName,
  validateHabitDescription,
  validateHabitType,
  validateHabitCategory,
  validateHabitColor,
  validateHabitFrequency,
  validateCreateHabitData,
  validateUpdateHabitData,
  // Constants
  VALID_HABIT_TYPES,
  VALID_HABIT_CATEGORIES,
  VALID_HABIT_COLORS,
  VALID_HABIT_FREQUENCIES,
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

// Habit Log Service Functions
export {
  // CRUD operations
  createHabitLog,
  getHabitLogById,
  getHabitLogByHabitAndDate,
  getHabitLogs,
  getHabitLogsByDateRange,
  getHabitLogsByDate,
  getHabitLogsByHabitId,
  updateHabitLog,
  toggleHabitCompletion,
  setHabitCompletion,
  updateHabitLogNotes,
  deleteHabitLog,
  deleteHabitLogByHabitAndDate,
  // Bulk operations
  bulkCreateHabitLogs,
  bulkToggleCompletion,
  bulkDeleteHabitLogs,
  deleteAllLogsForHabit,
  // Statistics / Query helpers
  countHabitLogs,
  getCompletedDatesForHabit,
  isHabitCompletedForDate,
  // Validation functions
  validateHabitId,
  validateDate,
  validateNotes,
  validateCreateHabitLogData,
  validateUpdateHabitLogData,
  // Helper functions
  getTodayDate,
  formatDate,
  // Error class and codes
  HabitLogServiceError,
  HabitLogServiceErrorCode,
} from './habitLogService';

export type {
  CreateHabitLogData,
  UpdateHabitLogData,
  HabitLogQueryOptions,
  BulkToggleInput,
  BulkCreateLogInput,
  HabitLogServiceResult,
} from './habitLogService';

// Streak Service Functions
export {
  // Core streak calculation
  calculateStreakForHabit,
  calculateStreaksForHabits,
  calculateStreaksForAllActiveHabits,
  // Streak history
  getStreakHistory,
  // Statistics
  getBestStreakEver,
  getHabitsWithActiveStreaks,
  calculateCompletionRate,
  // Helper functions
  getTodayDateString,
  getYesterdayDateString,
  // Error class and codes
  StreakServiceError,
  StreakServiceErrorCode,
} from './streakService';

export type {
  StreakData,
  StreakPeriod,
  StreakHistory,
  StreakServiceResult,
} from './streakService';

// React hooks - Streaks
export {
  useStreak,
  useStreaks,
  useAllActiveStreaks,
  useStreakHistory,
  useActiveStreaks,
  useBestStreak,
} from './useStreak';

export type {
  UseStreakResult,
  UseStreaksResult,
  UseStreakHistoryResult,
  UseActiveStreaksResult,
  UseBestStreakResult,
} from './useStreak';

// Statistics Service Functions
export {
  // Single habit statistics
  getHabitStatistics,
  getStatisticsForHabits,
  // Dashboard statistics
  getDashboardStatistics,
  // Trends
  getWeeklyTrends,
  // Date-specific stats
  getCompletionStatsForDate,
  // Period statistics
  getPeriodStatistics,
  // Constants
  DAY_NAMES,
  DAY_NAMES_SHORT,
  // Error class and codes
  StatisticsServiceError,
  StatisticsServiceErrorCode,
} from './statisticsService';

export type {
  DayOfWeek,
  HabitStatistics,
  DashboardStatistics,
  WeeklyTrendPoint,
  StatisticsServiceResult,
  StatisticsPeriod,
  PeriodStatistics,
} from './statisticsService';

// React hooks - Statistics
export {
  useHabitStatistics,
  useDashboardStatistics,
  useWeeklyTrends,
  useDateCompletionStats,
  usePeriodStatistics,
} from './useStatistics';

export type {
  UseHabitStatisticsResult,
  UseDashboardStatisticsResult,
  UseWeeklyTrendsResult,
  UseDateCompletionStatsResult,
  UsePeriodStatisticsResult,
} from './useStatistics';

// Notification Settings Types
export type {
  NotificationSettingsDocType,
  NotificationSettingsDocument,
  NotificationSettingsCollection,
} from './types';

// Notification Service Functions
export {
  // Settings CRUD
  getNotificationSettings,
  updateNotificationSettings,
  enableNotifications,
  disableNotifications,
  // Browser notifications
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showTestNotification,
  showReminderNotification,
  // Validation
  validateTimeFormat,
  validateTimezone,
  // Helpers
  getUserTimezone,
  getDefaultSettings,
  getMillisecondsUntilReminder,
  formatTimeForDisplay,
  convertTo24Hour,
  // Error class and codes
  NotificationServiceError,
  NotificationServiceErrorCode,
} from './notificationService';

export type {
  UpdateNotificationSettingsData,
  NotificationServiceResult,
} from './notificationService';

// React hooks - Notification Settings
export {
  useNotificationSettings,
  useNotificationScheduler,
} from './useNotificationSettings';

export type {
  UseNotificationSettingsResult,
} from './useNotificationSettings';

// Timezone Utilities
// Note: getUserTimezone is already exported from notificationService above
export {
  formatDateInTimezone,
  getTodayInTimezone,
  getLocalTodayDate,
  getYesterdayInTimezone,
  getLocalYesterdayDate,
  parseDateString,
  addDaysToDate,
  getStartOfWeek,
  getEndOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  daysBetween,
  areDatesConsecutive,
  getDayOfWeek as getDayOfWeekFromDate,
  generateDateRange,
  getWeekKey,
  getMonthKey,
  isValidTimezone,
} from './timezoneUtils';
