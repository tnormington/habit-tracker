/**
 * RxDB Schemas
 * JSON Schema definitions for database collections
 *
 * These schemas define the structure and validation rules for all
 * documents stored in the RxDB database.
 */

import type { RxJsonSchema } from 'rxdb';
import type { HabitDocType, HabitCompletionDocType, HabitLogDocType, NotificationSettingsDocType } from './types';

/**
 * Valid habit types
 * - positive: Habits you want to build
 * - neutral: Habits you want to track without judgment
 * - negative: Habits you want to break
 */
const HABIT_TYPES = ['positive', 'neutral', 'negative'] as const;

/**
 * Valid habit categories for organization
 */
const HABIT_CATEGORIES = [
  'health',
  'fitness',
  'productivity',
  'mindfulness',
  'learning',
  'social',
  'finance',
  'creativity',
  'other',
] as const;

/**
 * Valid color options for habits
 */
const HABIT_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'gray',
] as const;

/**
 * Valid frequency options for habits
 * - daily: Track every day
 * - weekly: Track once per week
 * - monthly: Track once per month
 */
const HABIT_FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;

/**
 * Habit Schema
 *
 * Defines the structure for habit documents including:
 * - Basic info: id, name, description
 * - Classification: type (positive/negative), category
 * - Display: color
 * - Metadata: createdAt, updatedAt, isArchived
 */
export const habitSchema: RxJsonSchema<HabitDocType> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
      // ID should be non-empty
      minLength: 1,
    },
    name: {
      type: 'string',
      // Name must be between 1 and 200 characters
      minLength: 1,
      maxLength: 200,
    },
    description: {
      type: 'string',
      // Description can be empty but has max length
      maxLength: 1000,
    },
    type: {
      type: 'string',
      // Must be one of the defined habit types
      enum: [...HABIT_TYPES],
    },
    category: {
      type: 'string',
      // Must be one of the defined categories
      enum: [...HABIT_CATEGORIES],
    },
    color: {
      type: 'string',
      // Must be one of the defined colors
      enum: [...HABIT_COLORS],
    },
    frequency: {
      type: 'string',
      // Must be one of the defined frequencies
      enum: [...HABIT_FREQUENCIES],
    },
    createdAt: {
      type: 'integer',
      // Timestamp in milliseconds since epoch
      minimum: 0,
      maximum: 9999999999999,
    },
    updatedAt: {
      type: 'integer',
      // Timestamp in milliseconds since epoch
      minimum: 0,
      maximum: 9999999999999,
    },
    isArchived: {
      type: 'boolean',
    },
  },
  required: [
    'id',
    'name',
    'description',
    'type',
    'category',
    'color',
    'frequency',
    'createdAt',
    'updatedAt',
    'isArchived',
  ],
  // Indexes for common query patterns
  indexes: [
    'createdAt',      // For sorting by creation date
    'isArchived',     // For filtering active vs archived habits
    'type',           // For filtering by positive/negative
    'frequency',      // For filtering by frequency
    'category',       // For filtering by category
  ],
};

export const habitCompletionSchema: RxJsonSchema<HabitCompletionDocType> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    habitId: {
      type: 'string',
      maxLength: 100,
    },
    completedAt: {
      type: 'integer',
      minimum: 0,
      maximum: 9999999999999,
    },
    count: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
    },
    notes: {
      type: 'string',
      maxLength: 500,
    },
  },
  required: ['id', 'habitId', 'completedAt', 'count', 'notes'],
  indexes: ['habitId', 'completedAt'],
};

/**
 * Habit Log Schema
 *
 * Daily habit tracking logs with fields:
 * - id: Unique identifier for the log entry
 * - habitId: Reference to the habit being tracked (relationship)
 * - date: Date in YYYY-MM-DD format for efficient querying
 * - completed: Boolean indicating if habit was completed
 * - notes: Optional notes about the completion
 * - createdAt: Timestamp when the log entry was created
 *
 * Indexes optimized for:
 * - Querying logs by habitId (to get all logs for a habit)
 * - Querying logs by date (to get all habits for a day)
 * - Compound queries by habitId + date (to get specific habit on specific day)
 */
export const habitLogSchema: RxJsonSchema<HabitLogDocType> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
      // ID should be non-empty
      minLength: 1,
    },
    habitId: {
      type: 'string',
      maxLength: 100,
      // Reference to habit collection
      minLength: 1,
      // Note: RxDB doesn't enforce foreign key constraints,
      // but this establishes the relationship semantically
      ref: 'habits',
    },
    date: {
      type: 'string',
      // YYYY-MM-DD format (10 characters)
      minLength: 10,
      maxLength: 10,
      // Pattern for date format validation
      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    },
    completed: {
      type: 'boolean',
    },
    notes: {
      type: 'string',
      // Notes can be empty but have max length
      maxLength: 1000,
    },
    createdAt: {
      type: 'integer',
      // Timestamp in milliseconds since epoch
      minimum: 0,
      maximum: 9999999999999,
    },
  },
  required: ['id', 'habitId', 'date', 'completed', 'notes', 'createdAt'],
  // Indexes for efficient querying patterns
  indexes: [
    'habitId',           // Query logs by habit
    'date',              // Query logs by date
    ['habitId', 'date'], // Compound index for specific habit on specific date
    'createdAt',         // Query logs by creation time
  ],
};

/**
 * Notification Settings Schema
 *
 * Singleton document storing user's notification preferences:
 * - id: Always 'default' for singleton pattern
 * - enabled: Whether daily reminders are turned on
 * - reminderTime: Time in HH:MM format (24-hour)
 * - timezone: User's timezone for scheduling
 * - permissionGranted: Whether browser permission was granted
 * - updatedAt: Last modification timestamp
 */
export const notificationSettingsSchema: RxJsonSchema<NotificationSettingsDocType> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
      minLength: 1,
    },
    enabled: {
      type: 'boolean',
    },
    reminderTime: {
      type: 'string',
      // HH:MM format (5 characters)
      minLength: 5,
      maxLength: 5,
      // Pattern for 24-hour time format
      pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
    },
    timezone: {
      type: 'string',
      // Timezone string (e.g., 'America/New_York')
      minLength: 1,
      maxLength: 100,
    },
    permissionGranted: {
      type: 'boolean',
    },
    updatedAt: {
      type: 'integer',
      minimum: 0,
      maximum: 9999999999999,
    },
  },
  required: ['id', 'enabled', 'reminderTime', 'timezone', 'permissionGranted', 'updatedAt'],
};
