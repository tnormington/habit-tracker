/**
 * RxDB Database Types
 * Type definitions for the habit tracker database
 */

import type { RxDatabase, RxCollection, RxDocument } from 'rxdb';

// Habit document type
export interface HabitDocType {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  color: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
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
