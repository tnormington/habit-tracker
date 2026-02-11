'use client';

/**
 * Habit Log Service Functions
 * Service layer for creating, reading, updating, and deleting daily habit logs
 * with proper validation, error handling, and TypeScript types
 */

import { getDatabase } from './database';
import type {
  HabitLogDocType,
  HabitLogDocument,
  HabitTrackerDatabase,
} from './types';

// ============================================================================
// Types
// ============================================================================

/**
 * Input for creating a new habit log
 */
export interface CreateHabitLogData {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed?: boolean;
  notes?: string;
}

/**
 * Input for updating an existing habit log
 */
export interface UpdateHabitLogData {
  completed?: boolean;
  notes?: string;
}

/**
 * Query options for finding habit logs
 */
export interface HabitLogQueryOptions {
  habitId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  completed?: boolean;
  sortBy?: 'date' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  skip?: number;
}

/**
 * Bulk operation input for toggling multiple habits
 */
export interface BulkToggleInput {
  habitId: string;
  date: string;
  completed: boolean;
}

/**
 * Bulk operation input for creating logs
 */
export interface BulkCreateLogInput {
  habitId: string;
  date: string;
  completed?: boolean;
  notes?: string;
}

/**
 * Result of a habit log service operation
 */
export interface HabitLogServiceResult<T> {
  success: boolean;
  data?: T;
  error?: HabitLogServiceError;
}

/**
 * Custom error class for habit log service operations
 */
export class HabitLogServiceError extends Error {
  constructor(
    message: string,
    public readonly code: HabitLogServiceErrorCode,
    public readonly field?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'HabitLogServiceError';
  }
}

/**
 * Error codes for habit log service operations
 */
export enum HabitLogServiceErrorCode {
  DATABASE_NOT_INITIALIZED = 'DATABASE_NOT_INITIALIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_LOG = 'DUPLICATE_LOG',
  OPERATION_FAILED = 'OPERATION_FAILED',
  HABIT_NOT_FOUND = 'HABIT_NOT_FOUND',
}

// ============================================================================
// Constants
// ============================================================================

/** Maximum notes length */
const MAX_NOTES_LENGTH = 1000;

/** Date format pattern for validation */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate habitId
 */
export function validateHabitId(habitId: unknown): string | null {
  if (typeof habitId !== 'string') {
    return 'Habit ID must be a string';
  }
  const trimmed = habitId.trim();
  if (trimmed.length === 0) {
    return 'Habit ID is required';
  }
  return null;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDate(date: unknown): string | null {
  if (typeof date !== 'string') {
    return 'Date must be a string';
  }
  if (!DATE_PATTERN.test(date)) {
    return 'Date must be in YYYY-MM-DD format';
  }
  // Validate that it's a real date
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return 'Date is not valid';
  }
  return null;
}

/**
 * Validate notes
 */
export function validateNotes(notes: unknown): string | null {
  if (notes === undefined || notes === null) {
    return null; // Optional field
  }
  if (typeof notes !== 'string') {
    return 'Notes must be a string';
  }
  if (notes.length > MAX_NOTES_LENGTH) {
    return `Notes must be ${MAX_NOTES_LENGTH} characters or less`;
  }
  return null;
}

/**
 * Validate create habit log input
 */
export function validateCreateHabitLogData(data: unknown): HabitLogServiceError | null {
  if (!data || typeof data !== 'object') {
    return new HabitLogServiceError(
      'Invalid input data',
      HabitLogServiceErrorCode.VALIDATION_ERROR
    );
  }

  const input = data as Record<string, unknown>;

  // Validate habitId (required)
  const habitIdError = validateHabitId(input.habitId);
  if (habitIdError) {
    return new HabitLogServiceError(
      habitIdError,
      HabitLogServiceErrorCode.VALIDATION_ERROR,
      'habitId'
    );
  }

  // Validate date (required)
  const dateError = validateDate(input.date);
  if (dateError) {
    return new HabitLogServiceError(
      dateError,
      HabitLogServiceErrorCode.VALIDATION_ERROR,
      'date'
    );
  }

  // Validate completed (optional, defaults to false)
  if (input.completed !== undefined && typeof input.completed !== 'boolean') {
    return new HabitLogServiceError(
      'Completed must be a boolean',
      HabitLogServiceErrorCode.VALIDATION_ERROR,
      'completed'
    );
  }

  // Validate notes (optional)
  const notesError = validateNotes(input.notes);
  if (notesError) {
    return new HabitLogServiceError(
      notesError,
      HabitLogServiceErrorCode.VALIDATION_ERROR,
      'notes'
    );
  }

  return null;
}

/**
 * Validate update habit log input
 */
export function validateUpdateHabitLogData(data: unknown): HabitLogServiceError | null {
  if (!data || typeof data !== 'object') {
    return new HabitLogServiceError(
      'Invalid input data',
      HabitLogServiceErrorCode.VALIDATION_ERROR
    );
  }

  const input = data as Record<string, unknown>;

  // Validate completed if provided
  if (input.completed !== undefined && typeof input.completed !== 'boolean') {
    return new HabitLogServiceError(
      'Completed must be a boolean',
      HabitLogServiceErrorCode.VALIDATION_ERROR,
      'completed'
    );
  }

  // Validate notes if provided
  if (input.notes !== undefined) {
    const notesError = validateNotes(input.notes);
    if (notesError) {
      return new HabitLogServiceError(
        notesError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'notes'
      );
    }
  }

  return null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique ID for habit logs
 */
function generateHabitLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get database instance with error handling
 */
async function getDatabaseOrThrow(): Promise<HabitTrackerDatabase> {
  try {
    return await getDatabase();
  } catch (error) {
    throw new HabitLogServiceError(
      'Database not initialized',
      HabitLogServiceErrorCode.DATABASE_NOT_INITIALIZED,
      undefined,
      error
    );
  }
}

/**
 * Convert RxDocument to plain object
 */
function documentToHabitLog(doc: HabitLogDocument): HabitLogDocType {
  return doc.toJSON() as HabitLogDocType;
}

/**
 * Get today's date in YYYY-MM-DD format using local timezone
 * This ensures habits reset at midnight in the user's local time
 */
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object to YYYY-MM-DD string using local timezone
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ============================================================================
// CRUD Service Functions
// ============================================================================

/**
 * Create a new habit log
 *
 * @param data - The habit log data to create
 * @returns Promise with the created habit log or error
 *
 * @example
 * ```ts
 * const result = await createHabitLog({
 *   habitId: 'habit_123',
 *   date: '2025-01-15',
 *   completed: true,
 *   notes: 'Completed morning exercise',
 * });
 * ```
 */
export async function createHabitLog(
  data: CreateHabitLogData
): Promise<HabitLogServiceResult<HabitLogDocType>> {
  // Validate input
  const validationError = validateCreateHabitLogData(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const db = await getDatabaseOrThrow();
    const now = Date.now();

    // Check if log already exists for this habit and date
    const existing = await db.habit_logs
      .findOne({
        selector: {
          habitId: data.habitId,
          date: data.date,
        },
      })
      .exec();

    if (existing) {
      return {
        success: false,
        error: new HabitLogServiceError(
          `Log already exists for habit on ${data.date}`,
          HabitLogServiceErrorCode.DUPLICATE_LOG
        ),
      };
    }

    const logDoc: HabitLogDocType = {
      id: generateHabitLogId(),
      habitId: data.habitId,
      date: data.date,
      completed: data.completed ?? false,
      notes: data.notes ?? '',
      createdAt: now,
    };

    const doc = await db.habit_logs.insert(logDoc);
    return { success: true, data: documentToHabitLog(doc) };
  } catch (error) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Failed to create habit log',
        HabitLogServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Get a habit log by ID
 *
 * @param id - The habit log ID
 * @returns Promise with the habit log or null if not found
 */
export async function getHabitLogById(
  id: string
): Promise<HabitLogServiceResult<HabitLogDocType | null>> {
  if (!id || typeof id !== 'string') {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Invalid habit log ID',
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'id'
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();
    const doc = await db.habit_logs.findOne(id).exec();

    if (!doc) {
      return { success: true, data: null };
    }

    return { success: true, data: documentToHabitLog(doc) };
  } catch (error) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Failed to get habit log',
        HabitLogServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Get habit log for a specific habit and date
 *
 * @param habitId - The habit ID
 * @param date - The date in YYYY-MM-DD format
 * @returns Promise with the habit log or null if not found
 */
export async function getHabitLogByHabitAndDate(
  habitId: string,
  date: string
): Promise<HabitLogServiceResult<HabitLogDocType | null>> {
  // Validate inputs
  const habitIdError = validateHabitId(habitId);
  if (habitIdError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        habitIdError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'habitId'
      ),
    };
  }

  const dateError = validateDate(date);
  if (dateError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        dateError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'date'
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();
    const doc = await db.habit_logs
      .findOne({
        selector: {
          habitId,
          date,
        },
      })
      .exec();

    if (!doc) {
      return { success: true, data: null };
    }

    return { success: true, data: documentToHabitLog(doc) };
  } catch (error) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Failed to get habit log',
        HabitLogServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Get all habit logs with optional filtering and sorting
 *
 * @param options - Query options for filtering and sorting
 * @returns Promise with array of habit logs
 */
export async function getHabitLogs(
  options?: HabitLogQueryOptions
): Promise<HabitLogServiceResult<HabitLogDocType[]>> {
  try {
    const db = await getDatabaseOrThrow();

    // Build selector
    const selector: Record<string, unknown> = {};

    if (options?.habitId !== undefined) {
      selector.habitId = options.habitId;
    }
    if (options?.date !== undefined) {
      selector.date = options.date;
    }
    if (options?.completed !== undefined) {
      selector.completed = options.completed;
    }

    // Handle date range filtering
    if (options?.startDate !== undefined || options?.endDate !== undefined) {
      const dateSelector: Record<string, string> = {};
      if (options?.startDate !== undefined) {
        dateSelector.$gte = options.startDate;
      }
      if (options?.endDate !== undefined) {
        dateSelector.$lte = options.endDate;
      }
      selector.date = dateSelector;
    }

    // Create query
    let query = Object.keys(selector).length > 0
      ? db.habit_logs.find({ selector })
      : db.habit_logs.find();

    // Apply sorting
    const sortField = options?.sortBy ?? 'date';
    const sortDirection = options?.sortDirection ?? 'desc';

    if (sortDirection === 'asc') {
      query = query.sort(sortField);
    } else {
      query = query.sort({ [sortField]: 'desc' as const });
    }

    // Apply pagination
    if (options?.skip !== undefined && options.skip > 0) {
      query = query.skip(options.skip);
    }
    if (options?.limit !== undefined && options.limit > 0) {
      query = query.limit(options.limit);
    }

    // Execute query
    const docs = await query.exec();
    const logs = docs.map(documentToHabitLog);

    return { success: true, data: logs };
  } catch (error) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Failed to get habit logs',
        HabitLogServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Get habit logs by date range
 *
 * @param startDate - Start date in YYYY-MM-DD format (inclusive)
 * @param endDate - End date in YYYY-MM-DD format (inclusive)
 * @param habitId - Optional habit ID to filter by
 * @returns Promise with array of habit logs
 */
export async function getHabitLogsByDateRange(
  startDate: string,
  endDate: string,
  habitId?: string
): Promise<HabitLogServiceResult<HabitLogDocType[]>> {
  // Validate dates
  const startDateError = validateDate(startDate);
  if (startDateError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        startDateError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'startDate'
      ),
    };
  }

  const endDateError = validateDate(endDate);
  if (endDateError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        endDateError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'endDate'
      ),
    };
  }

  // Validate habitId if provided
  if (habitId !== undefined) {
    const habitIdError = validateHabitId(habitId);
    if (habitIdError) {
      return {
        success: false,
        error: new HabitLogServiceError(
          habitIdError,
          HabitLogServiceErrorCode.VALIDATION_ERROR,
          'habitId'
        ),
      };
    }
  }

  return getHabitLogs({
    startDate,
    endDate,
    habitId,
    sortBy: 'date',
    sortDirection: 'asc',
  });
}

/**
 * Get habit logs for a specific date
 *
 * @param date - The date in YYYY-MM-DD format
 * @returns Promise with array of habit logs for that date
 */
export async function getHabitLogsByDate(
  date: string
): Promise<HabitLogServiceResult<HabitLogDocType[]>> {
  const dateError = validateDate(date);
  if (dateError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        dateError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'date'
      ),
    };
  }

  return getHabitLogs({ date });
}

/**
 * Get all logs for a specific habit
 *
 * @param habitId - The habit ID
 * @returns Promise with array of habit logs for that habit
 */
export async function getHabitLogsByHabitId(
  habitId: string
): Promise<HabitLogServiceResult<HabitLogDocType[]>> {
  const habitIdError = validateHabitId(habitId);
  if (habitIdError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        habitIdError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'habitId'
      ),
    };
  }

  return getHabitLogs({ habitId });
}

/**
 * Update a habit log
 *
 * @param id - The habit log ID to update
 * @param data - The fields to update
 * @returns Promise with the updated habit log or error
 */
export async function updateHabitLog(
  id: string,
  data: UpdateHabitLogData
): Promise<HabitLogServiceResult<HabitLogDocType>> {
  // Validate ID
  if (!id || typeof id !== 'string') {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Invalid habit log ID',
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'id'
      ),
    };
  }

  // Validate update data
  const validationError = validateUpdateHabitLogData(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const db = await getDatabaseOrThrow();
    const doc = await db.habit_logs.findOne(id).exec();

    if (!doc) {
      return {
        success: false,
        error: new HabitLogServiceError(
          `Habit log with ID "${id}" not found`,
          HabitLogServiceErrorCode.NOT_FOUND
        ),
      };
    }

    // Prepare update data
    const updates: Partial<HabitLogDocType> = {};

    if (data.completed !== undefined) {
      updates.completed = data.completed;
    }
    if (data.notes !== undefined) {
      updates.notes = data.notes;
    }

    const updatedDoc = await doc.patch(updates);
    return { success: true, data: documentToHabitLog(updatedDoc) };
  } catch (error) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Failed to update habit log',
        HabitLogServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Toggle completion status for a habit on a specific date
 * If no log exists, creates one with completed=true
 * If log exists, toggles the completion status
 *
 * @param habitId - The habit ID
 * @param date - The date in YYYY-MM-DD format
 * @returns Promise with the toggled habit log
 */
export async function toggleHabitCompletion(
  habitId: string,
  date: string
): Promise<HabitLogServiceResult<HabitLogDocType>> {
  // Validate inputs
  const habitIdError = validateHabitId(habitId);
  if (habitIdError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        habitIdError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'habitId'
      ),
    };
  }

  const dateError = validateDate(date);
  if (dateError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        dateError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'date'
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();

    // Find existing log
    const existingDoc = await db.habit_logs
      .findOne({
        selector: {
          habitId,
          date,
        },
      })
      .exec();

    if (existingDoc) {
      // Toggle existing log
      const updatedDoc = await existingDoc.patch({
        completed: !existingDoc.completed,
      });
      return { success: true, data: documentToHabitLog(updatedDoc) };
    } else {
      // Create new log with completed=true
      const now = Date.now();
      const logDoc: HabitLogDocType = {
        id: generateHabitLogId(),
        habitId,
        date,
        completed: true,
        notes: '',
        createdAt: now,
      };

      const doc = await db.habit_logs.insert(logDoc);
      return { success: true, data: documentToHabitLog(doc) };
    }
  } catch (error) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Failed to toggle habit completion',
        HabitLogServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Set completion status for a habit on a specific date
 * Creates log if it doesn't exist, updates if it does
 *
 * @param habitId - The habit ID
 * @param date - The date in YYYY-MM-DD format
 * @param completed - The completion status to set
 * @returns Promise with the updated/created habit log
 */
export async function setHabitCompletion(
  habitId: string,
  date: string,
  completed: boolean
): Promise<HabitLogServiceResult<HabitLogDocType>> {
  // Validate inputs
  const habitIdError = validateHabitId(habitId);
  if (habitIdError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        habitIdError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'habitId'
      ),
    };
  }

  const dateError = validateDate(date);
  if (dateError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        dateError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'date'
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();

    // Find existing log
    const existingDoc = await db.habit_logs
      .findOne({
        selector: {
          habitId,
          date,
        },
      })
      .exec();

    if (existingDoc) {
      // Update existing log
      const updatedDoc = await existingDoc.patch({ completed });
      return { success: true, data: documentToHabitLog(updatedDoc) };
    } else {
      // Create new log
      const now = Date.now();
      const logDoc: HabitLogDocType = {
        id: generateHabitLogId(),
        habitId,
        date,
        completed,
        notes: '',
        createdAt: now,
      };

      const doc = await db.habit_logs.insert(logDoc);
      return { success: true, data: documentToHabitLog(doc) };
    }
  } catch (error) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Failed to set habit completion',
        HabitLogServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Add or update notes for a habit log
 * Creates log if it doesn't exist
 *
 * @param habitId - The habit ID
 * @param date - The date in YYYY-MM-DD format
 * @param notes - The notes to add/update
 * @returns Promise with the updated/created habit log
 */
export async function updateHabitLogNotes(
  habitId: string,
  date: string,
  notes: string
): Promise<HabitLogServiceResult<HabitLogDocType>> {
  // Validate inputs
  const habitIdError = validateHabitId(habitId);
  if (habitIdError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        habitIdError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'habitId'
      ),
    };
  }

  const dateError = validateDate(date);
  if (dateError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        dateError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'date'
      ),
    };
  }

  const notesError = validateNotes(notes);
  if (notesError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        notesError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'notes'
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();

    // Find existing log
    const existingDoc = await db.habit_logs
      .findOne({
        selector: {
          habitId,
          date,
        },
      })
      .exec();

    if (existingDoc) {
      // Update existing log
      const updatedDoc = await existingDoc.patch({ notes });
      return { success: true, data: documentToHabitLog(updatedDoc) };
    } else {
      // Create new log with notes
      const now = Date.now();
      const logDoc: HabitLogDocType = {
        id: generateHabitLogId(),
        habitId,
        date,
        completed: false,
        notes,
        createdAt: now,
      };

      const doc = await db.habit_logs.insert(logDoc);
      return { success: true, data: documentToHabitLog(doc) };
    }
  } catch (error) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Failed to update habit log notes',
        HabitLogServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Delete a habit log
 *
 * @param id - The habit log ID to delete
 * @returns Promise with success status
 */
export async function deleteHabitLog(
  id: string
): Promise<HabitLogServiceResult<boolean>> {
  // Validate ID
  if (!id || typeof id !== 'string') {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Invalid habit log ID',
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'id'
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();
    const doc = await db.habit_logs.findOne(id).exec();

    if (!doc) {
      return {
        success: false,
        error: new HabitLogServiceError(
          `Habit log with ID "${id}" not found`,
          HabitLogServiceErrorCode.NOT_FOUND
        ),
      };
    }

    await doc.remove();
    return { success: true, data: true };
  } catch (error) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Failed to delete habit log',
        HabitLogServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Delete habit log by habit and date
 *
 * @param habitId - The habit ID
 * @param date - The date in YYYY-MM-DD format
 * @returns Promise with success status
 */
export async function deleteHabitLogByHabitAndDate(
  habitId: string,
  date: string
): Promise<HabitLogServiceResult<boolean>> {
  // Validate inputs
  const habitIdError = validateHabitId(habitId);
  if (habitIdError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        habitIdError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'habitId'
      ),
    };
  }

  const dateError = validateDate(date);
  if (dateError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        dateError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'date'
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();
    const doc = await db.habit_logs
      .findOne({
        selector: {
          habitId,
          date,
        },
      })
      .exec();

    if (!doc) {
      return { success: true, data: false }; // No log to delete
    }

    await doc.remove();
    return { success: true, data: true };
  } catch (error) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Failed to delete habit log',
        HabitLogServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Bulk create habit logs for multiple habits on a date
 *
 * @param inputs - Array of habit logs to create
 * @returns Promise with array of created logs and any errors
 */
export async function bulkCreateHabitLogs(
  inputs: BulkCreateLogInput[]
): Promise<HabitLogServiceResult<{ created: HabitLogDocType[]; errors: { input: BulkCreateLogInput; error: string }[] }>> {
  if (!Array.isArray(inputs)) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Inputs must be an array',
        HabitLogServiceErrorCode.VALIDATION_ERROR
      ),
    };
  }

  const created: HabitLogDocType[] = [];
  const errors: { input: BulkCreateLogInput; error: string }[] = [];

  for (const input of inputs) {
    const result = await createHabitLog(input);
    if (result.success && result.data) {
      created.push(result.data);
    } else {
      errors.push({
        input,
        error: result.error?.message ?? 'Unknown error',
      });
    }
  }

  return {
    success: true,
    data: { created, errors },
  };
}

/**
 * Bulk toggle completion for multiple habits
 *
 * @param inputs - Array of { habitId, date, completed } to toggle
 * @returns Promise with count of toggled logs
 */
export async function bulkToggleCompletion(
  inputs: BulkToggleInput[]
): Promise<HabitLogServiceResult<{ updated: number; errors: { input: BulkToggleInput; error: string }[] }>> {
  if (!Array.isArray(inputs)) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Inputs must be an array',
        HabitLogServiceErrorCode.VALIDATION_ERROR
      ),
    };
  }

  let updated = 0;
  const errors: { input: BulkToggleInput; error: string }[] = [];

  for (const input of inputs) {
    const result = await setHabitCompletion(input.habitId, input.date, input.completed);
    if (result.success) {
      updated++;
    } else {
      errors.push({
        input,
        error: result.error?.message ?? 'Unknown error',
      });
    }
  }

  return {
    success: true,
    data: { updated, errors },
  };
}

/**
 * Bulk delete habit logs by IDs
 *
 * @param ids - Array of habit log IDs to delete
 * @returns Promise with count of deleted logs
 */
export async function bulkDeleteHabitLogs(
  ids: string[]
): Promise<HabitLogServiceResult<number>> {
  if (!Array.isArray(ids)) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'IDs must be an array',
        HabitLogServiceErrorCode.VALIDATION_ERROR
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();
    let deletedCount = 0;

    for (const id of ids) {
      if (typeof id === 'string' && id.length > 0) {
        const doc = await db.habit_logs.findOne(id).exec();
        if (doc) {
          await doc.remove();
          deletedCount++;
        }
      }
    }

    return { success: true, data: deletedCount };
  } catch (error) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Failed to bulk delete habit logs',
        HabitLogServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Delete all logs for a specific habit
 *
 * @param habitId - The habit ID
 * @returns Promise with count of deleted logs
 */
export async function deleteAllLogsForHabit(
  habitId: string
): Promise<HabitLogServiceResult<number>> {
  const habitIdError = validateHabitId(habitId);
  if (habitIdError) {
    return {
      success: false,
      error: new HabitLogServiceError(
        habitIdError,
        HabitLogServiceErrorCode.VALIDATION_ERROR,
        'habitId'
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();
    const docs = await db.habit_logs
      .find({
        selector: { habitId },
      })
      .exec();

    let deletedCount = 0;
    for (const doc of docs) {
      await doc.remove();
      deletedCount++;
    }

    return { success: true, data: deletedCount };
  } catch (error) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Failed to delete logs for habit',
        HabitLogServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

// ============================================================================
// Statistics / Query Helpers
// ============================================================================

/**
 * Count habit logs with optional filtering
 *
 * @param options - Query options for filtering
 * @returns Promise with the count
 */
export async function countHabitLogs(
  options?: Pick<HabitLogQueryOptions, 'habitId' | 'date' | 'startDate' | 'endDate' | 'completed'>
): Promise<HabitLogServiceResult<number>> {
  try {
    const db = await getDatabaseOrThrow();

    // Build selector
    const selector: Record<string, unknown> = {};

    if (options?.habitId !== undefined) {
      selector.habitId = options.habitId;
    }
    if (options?.date !== undefined) {
      selector.date = options.date;
    }
    if (options?.completed !== undefined) {
      selector.completed = options.completed;
    }

    // Handle date range filtering
    if (options?.startDate !== undefined || options?.endDate !== undefined) {
      const dateSelector: Record<string, string> = {};
      if (options?.startDate !== undefined) {
        dateSelector.$gte = options.startDate;
      }
      if (options?.endDate !== undefined) {
        dateSelector.$lte = options.endDate;
      }
      selector.date = dateSelector;
    }

    // Create and execute query
    const query = Object.keys(selector).length > 0
      ? db.habit_logs.count({ selector })
      : db.habit_logs.count();

    const count = await query.exec();
    return { success: true, data: count };
  } catch (error) {
    return {
      success: false,
      error: new HabitLogServiceError(
        'Failed to count habit logs',
        HabitLogServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Get completed dates for a habit within a date range
 *
 * @param habitId - The habit ID
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Promise with array of completed dates
 */
export async function getCompletedDatesForHabit(
  habitId: string,
  startDate: string,
  endDate: string
): Promise<HabitLogServiceResult<string[]>> {
  const result = await getHabitLogsByDateRange(startDate, endDate, habitId);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const completedDates = result.data
    ?.filter((log) => log.completed)
    .map((log) => log.date) ?? [];

  return { success: true, data: completedDates };
}

/**
 * Check if habit is completed for a specific date
 *
 * @param habitId - The habit ID
 * @param date - The date in YYYY-MM-DD format
 * @returns Promise with boolean indicating completion
 */
export async function isHabitCompletedForDate(
  habitId: string,
  date: string
): Promise<HabitLogServiceResult<boolean>> {
  const result = await getHabitLogByHabitAndDate(habitId, date);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data?.completed ?? false };
}
