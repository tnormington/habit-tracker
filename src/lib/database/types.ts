/**
 * RxDB Database Types
 * Type definitions for the habit tracker database
 */

import type { RxDatabase, RxCollection, RxDocument } from 'rxdb';

/**
 * Habit type - determines if completing the habit is positive or negative
 * - positive: Habits you want to build (e.g., exercise, reading)
 * - negative: Habits you want to break (e.g., smoking, excessive screen time)
 */
export type HabitType = 'positive' | 'negative';

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

// RxDB document types
export type HabitDocument = RxDocument<HabitDocType>;
export type HabitCompletionDocument = RxDocument<HabitCompletionDocType>;

// RxDB collection types
export type HabitCollection = RxCollection<HabitDocType>;
export type HabitCompletionCollection = RxCollection<HabitCompletionDocType>;

// Database collections interface
export interface DatabaseCollections {
  habits: HabitCollection;
  habit_completions: HabitCompletionCollection;
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
