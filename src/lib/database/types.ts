/**
 * RxDB Database Types
 * Type definitions for the habit tracker database
 */

import type { RxDatabase, RxCollection, RxDocument } from 'rxdb';

/**
 * Habit type - determines if completing the habit is positive, negative, or neutral
 * - positive: Habits you want to build (e.g., exercise, reading)
 * - neutral: Habits you want to track without judgment (e.g., hours slept, meals eaten)
 * - negative: Habits you want to break (e.g., smoking, excessive screen time)
 */
export type HabitType = 'positive' | 'neutral' | 'negative';

/**
 * Pre-defined habit categories for organization
 */
export type HabitCategory =
  | 'health'
  | 'fitness'
  | 'productivity'
  | 'mindfulness'
  | 'learning'
  | 'social'
  | 'finance'
  | 'creativity'
  | 'other';

/**
 * Valid color options for habits
 * Using a constrained set for consistent UI
 */
export type HabitColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'gray';

/**
 * Habit frequency - determines how often the habit should be tracked
 * - daily: Track every day
 * - weekly: Track once per week
 * - monthly: Track once per month
 */
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

// Habit document type
export interface HabitDocType {
  /** Unique identifier for the habit */
  id: string;
  /** Display name of the habit */
  name: string;
  /** Optional longer description of the habit */
  description: string;
  /** Whether this is a positive habit to build or negative habit to break */
  type: HabitType;
  /** Category for organizing habits */
  category: HabitCategory;
  /** Color for visual identification */
  color: HabitColor;
  /** How often the habit should be tracked (daily, weekly, monthly) */
  frequency: HabitFrequency;
  /** Timestamp when the habit was created (ms since epoch) */
  createdAt: number;
  /** Timestamp when the habit was last updated (ms since epoch) */
  updatedAt: number;
  /** Whether the habit is archived (hidden from active view) */
  isArchived: boolean;
}

// Habit completion record type
export interface HabitCompletionDocType {
  id: string;
  habitId: string;
  completedAt: number;
  count: number;
  notes: string;
}

/**
 * Habit log record type - daily tracking of habit completion
 * Designed for efficient querying by date and habit
 */
export interface HabitLogDocType {
  /** Unique identifier for the log entry */
  id: string;
  /** Reference to the habit being tracked */
  habitId: string;
  /** Date of the log entry in YYYY-MM-DD format for efficient querying */
  date: string;
  /** Whether the habit was completed on this date */
  completed: boolean;
  /** Optional notes about the completion */
  notes: string;
  /** Timestamp when the log entry was created (ms since epoch) */
  createdAt: number;
}

// RxDB document types
export type HabitDocument = RxDocument<HabitDocType>;
export type HabitCompletionDocument = RxDocument<HabitCompletionDocType>;
export type HabitLogDocument = RxDocument<HabitLogDocType>;

// RxDB collection types
export type HabitCollection = RxCollection<HabitDocType>;
export type HabitCompletionCollection = RxCollection<HabitCompletionDocType>;
export type HabitLogCollection = RxCollection<HabitLogDocType>;

// Database collections interface
export interface DatabaseCollections {
  habits: HabitCollection;
  habit_completions: HabitCompletionCollection;
  habit_logs: HabitLogCollection;
  notification_settings: NotificationSettingsCollection;
}

// Full database type
export type HabitTrackerDatabase = RxDatabase<DatabaseCollections>;

// Database initialization options
export interface DatabaseInitOptions {
  name?: string;
}

// Database error types
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: DatabaseErrorCode,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export enum DatabaseErrorCode {
  INITIALIZATION_FAILED = 'INITIALIZATION_FAILED',
  COLLECTION_CREATION_FAILED = 'COLLECTION_CREATION_FAILED',
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
  STORAGE_NOT_AVAILABLE = 'STORAGE_NOT_AVAILABLE',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Notification settings document type
 * Stores user preferences for daily habit reminders
 */
export interface NotificationSettingsDocType {
  /** Unique identifier - always 'default' for singleton settings */
  id: string;
  /** Whether notifications are enabled */
  enabled: boolean;
  /** Time to send daily reminder in HH:MM format (24-hour) */
  reminderTime: string;
  /** User's timezone for scheduling (e.g., 'America/New_York') */
  timezone: string;
  /** Whether browser notification permission has been granted */
  permissionGranted: boolean;
  /** Timestamp when settings were last updated (ms since epoch) */
  updatedAt: number;
}

// RxDB document type for notification settings
export type NotificationSettingsDocument = RxDocument<NotificationSettingsDocType>;

// RxDB collection type for notification settings
export type NotificationSettingsCollection = RxCollection<NotificationSettingsDocType>;
