'use client';

/**
 * Habit Service Functions
 * Service layer for creating, reading, updating, and deleting habits
 * with proper validation, error handling, and TypeScript types
 */

import { getDatabase } from './database';
import type {
  HabitDocType,
  HabitDocument,
  HabitType,
  HabitCategory,
  HabitColor,
  HabitFrequency,
  HabitTrackerDatabase,
} from './types';

// ============================================================================
// Types
// ============================================================================

/**
 * Input for creating a new habit
 */
export interface CreateHabitData {
  name: string;
  description?: string;
  type: HabitType;
  category: HabitCategory;
  color: HabitColor;
  frequency?: HabitFrequency;
}

/**
 * Input for updating an existing habit
 */
export interface UpdateHabitData {
  name?: string;
  description?: string;
  type?: HabitType;
  category?: HabitCategory;
  color?: HabitColor;
  frequency?: HabitFrequency;
  isArchived?: boolean;
}

/**
 * Query options for finding habits
 */
export interface HabitQueryOptions {
  type?: HabitType;
  category?: HabitCategory;
  frequency?: HabitFrequency;
  isArchived?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  skip?: number;
}

/**
 * Result of a habit service operation
 */
export interface HabitServiceResult<T> {
  success: boolean;
  data?: T;
  error?: HabitServiceError;
}

/**
 * Custom error class for habit service operations
 */
export class HabitServiceError extends Error {
  constructor(
    message: string,
    public readonly code: HabitServiceErrorCode,
    public readonly field?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'HabitServiceError';
  }
}

/**
 * Error codes for habit service operations
 */
export enum HabitServiceErrorCode {
  DATABASE_NOT_INITIALIZED = 'DATABASE_NOT_INITIALIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_NAME = 'DUPLICATE_NAME',
  OPERATION_FAILED = 'OPERATION_FAILED',
}

// ============================================================================
// Constants
// ============================================================================

/** Valid habit types */
export const VALID_HABIT_TYPES: HabitType[] = ['positive', 'negative'];

/** Valid habit categories */
export const VALID_HABIT_CATEGORIES: HabitCategory[] = [
  'health',
  'fitness',
  'productivity',
  'mindfulness',
  'learning',
  'social',
  'finance',
  'creativity',
  'other',
];

/** Valid habit colors */
export const VALID_HABIT_COLORS: HabitColor[] = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'gray',
];

/** Valid habit frequencies */
export const VALID_HABIT_FREQUENCIES: HabitFrequency[] = ['daily', 'weekly', 'monthly'];

/** Maximum name length */
const MAX_NAME_LENGTH = 200;

/** Maximum description length */
const MAX_DESCRIPTION_LENGTH = 1000;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate habit name
 */
export function validateHabitName(name: unknown): string | null {
  if (typeof name !== 'string') {
    return 'Name must be a string';
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return 'Name is required';
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Name must be ${MAX_NAME_LENGTH} characters or less`;
  }
  return null;
}

/**
 * Validate habit description
 */
export function validateHabitDescription(description: unknown): string | null {
  if (description === undefined || description === null) {
    return null; // Optional field
  }
  if (typeof description !== 'string') {
    return 'Description must be a string';
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
  }
  return null;
}

/**
 * Validate habit type
 */
export function validateHabitType(type: unknown): string | null {
  if (!VALID_HABIT_TYPES.includes(type as HabitType)) {
    return `Type must be one of: ${VALID_HABIT_TYPES.join(', ')}`;
  }
  return null;
}

/**
 * Validate habit category
 */
export function validateHabitCategory(category: unknown): string | null {
  if (!VALID_HABIT_CATEGORIES.includes(category as HabitCategory)) {
    return `Category must be one of: ${VALID_HABIT_CATEGORIES.join(', ')}`;
  }
  return null;
}

/**
 * Validate habit color
 */
export function validateHabitColor(color: unknown): string | null {
  if (!VALID_HABIT_COLORS.includes(color as HabitColor)) {
    return `Color must be one of: ${VALID_HABIT_COLORS.join(', ')}`;
  }
  return null;
}

/**
 * Validate habit frequency
 */
export function validateHabitFrequency(frequency: unknown): string | null {
  if (frequency === undefined || frequency === null) {
    return null; // Optional field, defaults to 'daily'
  }
  if (!VALID_HABIT_FREQUENCIES.includes(frequency as HabitFrequency)) {
    return `Frequency must be one of: ${VALID_HABIT_FREQUENCIES.join(', ')}`;
  }
  return null;
}

/**
 * Validate create habit input
 */
export function validateCreateHabitData(data: unknown): HabitServiceError | null {
  if (!data || typeof data !== 'object') {
    return new HabitServiceError(
      'Invalid input data',
      HabitServiceErrorCode.VALIDATION_ERROR
    );
  }

  const input = data as Record<string, unknown>;

  // Validate name (required)
  const nameError = validateHabitName(input.name);
  if (nameError) {
    return new HabitServiceError(
      nameError,
      HabitServiceErrorCode.VALIDATION_ERROR,
      'name'
    );
  }

  // Validate description (optional)
  const descError = validateHabitDescription(input.description);
  if (descError) {
    return new HabitServiceError(
      descError,
      HabitServiceErrorCode.VALIDATION_ERROR,
      'description'
    );
  }

  // Validate type (required)
  const typeError = validateHabitType(input.type);
  if (typeError) {
    return new HabitServiceError(
      typeError,
      HabitServiceErrorCode.VALIDATION_ERROR,
      'type'
    );
  }

  // Validate category (required)
  const categoryError = validateHabitCategory(input.category);
  if (categoryError) {
    return new HabitServiceError(
      categoryError,
      HabitServiceErrorCode.VALIDATION_ERROR,
      'category'
    );
  }

  // Validate color (required)
  const colorError = validateHabitColor(input.color);
  if (colorError) {
    return new HabitServiceError(
      colorError,
      HabitServiceErrorCode.VALIDATION_ERROR,
      'color'
    );
  }

  // Validate frequency (optional, defaults to 'daily')
  const frequencyError = validateHabitFrequency(input.frequency);
  if (frequencyError) {
    return new HabitServiceError(
      frequencyError,
      HabitServiceErrorCode.VALIDATION_ERROR,
      'frequency'
    );
  }

  return null;
}

/**
 * Validate update habit input
 */
export function validateUpdateHabitData(data: unknown): HabitServiceError | null {
  if (!data || typeof data !== 'object') {
    return new HabitServiceError(
      'Invalid input data',
      HabitServiceErrorCode.VALIDATION_ERROR
    );
  }

  const input = data as Record<string, unknown>;

  // Validate name if provided
  if (input.name !== undefined) {
    const nameError = validateHabitName(input.name);
    if (nameError) {
      return new HabitServiceError(
        nameError,
        HabitServiceErrorCode.VALIDATION_ERROR,
        'name'
      );
    }
  }

  // Validate description if provided
  if (input.description !== undefined) {
    const descError = validateHabitDescription(input.description);
    if (descError) {
      return new HabitServiceError(
        descError,
        HabitServiceErrorCode.VALIDATION_ERROR,
        'description'
      );
    }
  }

  // Validate type if provided
  if (input.type !== undefined) {
    const typeError = validateHabitType(input.type);
    if (typeError) {
      return new HabitServiceError(
        typeError,
        HabitServiceErrorCode.VALIDATION_ERROR,
        'type'
      );
    }
  }

  // Validate category if provided
  if (input.category !== undefined) {
    const categoryError = validateHabitCategory(input.category);
    if (categoryError) {
      return new HabitServiceError(
        categoryError,
        HabitServiceErrorCode.VALIDATION_ERROR,
        'category'
      );
    }
  }

  // Validate color if provided
  if (input.color !== undefined) {
    const colorError = validateHabitColor(input.color);
    if (colorError) {
      return new HabitServiceError(
        colorError,
        HabitServiceErrorCode.VALIDATION_ERROR,
        'color'
      );
    }
  }

  // Validate frequency if provided
  if (input.frequency !== undefined) {
    const frequencyError = validateHabitFrequency(input.frequency);
    if (frequencyError) {
      return new HabitServiceError(
        frequencyError,
        HabitServiceErrorCode.VALIDATION_ERROR,
        'frequency'
      );
    }
  }

  // Validate isArchived if provided
  if (input.isArchived !== undefined && typeof input.isArchived !== 'boolean') {
    return new HabitServiceError(
      'isArchived must be a boolean',
      HabitServiceErrorCode.VALIDATION_ERROR,
      'isArchived'
    );
  }

  return null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a unique ID for habits
 */
function generateHabitId(): string {
  return `habit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get database instance with error handling
 */
async function getDatabaseOrThrow(): Promise<HabitTrackerDatabase> {
  try {
    return await getDatabase();
  } catch (error) {
    throw new HabitServiceError(
      'Database not initialized',
      HabitServiceErrorCode.DATABASE_NOT_INITIALIZED,
      undefined,
      error
    );
  }
}

/**
 * Convert RxDocument to plain object
 */
function documentToHabit(doc: HabitDocument): HabitDocType {
  return doc.toJSON() as HabitDocType;
}

// ============================================================================
// CRUD Service Functions
// ============================================================================

/**
 * Create a new habit
 *
 * @param data - The habit data to create
 * @returns Promise with the created habit or error
 *
 * @example
 * ```ts
 * const result = await createHabit({
 *   name: 'Exercise',
 *   type: 'positive',
 *   category: 'fitness',
 *   color: 'green',
 * });
 *
 * if (result.success) {
 *   console.log('Created habit:', result.data);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 */
export async function createHabit(
  data: CreateHabitData
): Promise<HabitServiceResult<HabitDocType>> {
  // Validate input
  const validationError = validateCreateHabitData(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const db = await getDatabaseOrThrow();
    const now = Date.now();

    const habitDoc: HabitDocType = {
      id: generateHabitId(),
      name: data.name.trim(),
      description: data.description?.trim() ?? '',
      type: data.type,
      category: data.category,
      color: data.color,
      frequency: data.frequency ?? 'daily',
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    };

    const doc = await db.habits.insert(habitDoc);
    return { success: true, data: documentToHabit(doc) };
  } catch (error) {
    return {
      success: false,
      error: new HabitServiceError(
        'Failed to create habit',
        HabitServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Get a habit by ID
 *
 * @param id - The habit ID
 * @returns Promise with the habit or null if not found
 *
 * @example
 * ```ts
 * const result = await getHabitById('habit_123');
 * if (result.success && result.data) {
 *   console.log('Found habit:', result.data.name);
 * }
 * ```
 */
export async function getHabitById(
  id: string
): Promise<HabitServiceResult<HabitDocType | null>> {
  if (!id || typeof id !== 'string') {
    return {
      success: false,
      error: new HabitServiceError(
        'Invalid habit ID',
        HabitServiceErrorCode.VALIDATION_ERROR,
        'id'
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();
    const doc = await db.habits.findOne(id).exec();

    if (!doc) {
      return { success: true, data: null };
    }

    return { success: true, data: documentToHabit(doc) };
  } catch (error) {
    return {
      success: false,
      error: new HabitServiceError(
        'Failed to get habit',
        HabitServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Get all habits with optional filtering and sorting
 *
 * @param options - Query options for filtering and sorting
 * @returns Promise with array of habits
 *
 * @example
 * ```ts
 * // Get all active positive habits in the health category
 * const result = await getHabits({
 *   type: 'positive',
 *   category: 'health',
 *   isArchived: false,
 *   sortBy: 'name',
 *   sortDirection: 'asc',
 * });
 * ```
 */
export async function getHabits(
  options?: HabitQueryOptions
): Promise<HabitServiceResult<HabitDocType[]>> {
  try {
    const db = await getDatabaseOrThrow();

    // Build selector
    const selector: Record<string, unknown> = {};

    if (options?.type !== undefined) {
      selector.type = options.type;
    }
    if (options?.category !== undefined) {
      selector.category = options.category;
    }
    if (options?.frequency !== undefined) {
      selector.frequency = options.frequency;
    }
    if (options?.isArchived !== undefined) {
      selector.isArchived = options.isArchived;
    }

    // Create query
    let query = Object.keys(selector).length > 0
      ? db.habits.find({ selector })
      : db.habits.find();

    // Apply sorting
    const sortField = options?.sortBy ?? 'createdAt';
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
    const habits = docs.map(documentToHabit);

    return { success: true, data: habits };
  } catch (error) {
    return {
      success: false,
      error: new HabitServiceError(
        'Failed to get habits',
        HabitServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Get all active (non-archived) habits
 *
 * @returns Promise with array of active habits
 */
export async function getActiveHabits(): Promise<HabitServiceResult<HabitDocType[]>> {
  return getHabits({ isArchived: false });
}

/**
 * Get all archived habits
 *
 * @returns Promise with array of archived habits
 */
export async function getArchivedHabits(): Promise<HabitServiceResult<HabitDocType[]>> {
  return getHabits({ isArchived: true });
}

/**
 * Get habits by type
 *
 * @param type - The habit type to filter by
 * @returns Promise with array of habits
 */
export async function getHabitsByType(
  type: HabitType
): Promise<HabitServiceResult<HabitDocType[]>> {
  const typeError = validateHabitType(type);
  if (typeError) {
    return {
      success: false,
      error: new HabitServiceError(
        typeError,
        HabitServiceErrorCode.VALIDATION_ERROR,
        'type'
      ),
    };
  }

  return getHabits({ type, isArchived: false });
}

/**
 * Get habits by category
 *
 * @param category - The habit category to filter by
 * @returns Promise with array of habits
 */
export async function getHabitsByCategory(
  category: HabitCategory
): Promise<HabitServiceResult<HabitDocType[]>> {
  const categoryError = validateHabitCategory(category);
  if (categoryError) {
    return {
      success: false,
      error: new HabitServiceError(
        categoryError,
        HabitServiceErrorCode.VALIDATION_ERROR,
        'category'
      ),
    };
  }

  return getHabits({ category, isArchived: false });
}

/**
 * Update a habit
 *
 * @param id - The habit ID to update
 * @param data - The fields to update
 * @returns Promise with the updated habit or error
 *
 * @example
 * ```ts
 * const result = await updateHabit('habit_123', {
 *   name: 'Morning Exercise',
 *   color: 'blue',
 * });
 * ```
 */
export async function updateHabit(
  id: string,
  data: UpdateHabitData
): Promise<HabitServiceResult<HabitDocType>> {
  // Validate ID
  if (!id || typeof id !== 'string') {
    return {
      success: false,
      error: new HabitServiceError(
        'Invalid habit ID',
        HabitServiceErrorCode.VALIDATION_ERROR,
        'id'
      ),
    };
  }

  // Validate update data
  const validationError = validateUpdateHabitData(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const db = await getDatabaseOrThrow();
    const doc = await db.habits.findOne(id).exec();

    if (!doc) {
      return {
        success: false,
        error: new HabitServiceError(
          `Habit with ID "${id}" not found`,
          HabitServiceErrorCode.NOT_FOUND
        ),
      };
    }

    // Prepare update data
    const updates: Partial<HabitDocType> = {
      updatedAt: Date.now(),
    };

    if (data.name !== undefined) {
      updates.name = data.name.trim();
    }
    if (data.description !== undefined) {
      updates.description = data.description.trim();
    }
    if (data.type !== undefined) {
      updates.type = data.type;
    }
    if (data.category !== undefined) {
      updates.category = data.category;
    }
    if (data.color !== undefined) {
      updates.color = data.color;
    }
    if (data.frequency !== undefined) {
      updates.frequency = data.frequency;
    }
    if (data.isArchived !== undefined) {
      updates.isArchived = data.isArchived;
    }

    const updatedDoc = await doc.patch(updates);
    return { success: true, data: documentToHabit(updatedDoc) };
  } catch (error) {
    return {
      success: false,
      error: new HabitServiceError(
        'Failed to update habit',
        HabitServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Archive a habit (soft delete)
 *
 * @param id - The habit ID to archive
 * @returns Promise with the archived habit or error
 */
export async function archiveHabit(
  id: string
): Promise<HabitServiceResult<HabitDocType>> {
  return updateHabit(id, { isArchived: true });
}

/**
 * Restore an archived habit
 *
 * @param id - The habit ID to restore
 * @returns Promise with the restored habit or error
 */
export async function restoreHabit(
  id: string
): Promise<HabitServiceResult<HabitDocType>> {
  return updateHabit(id, { isArchived: false });
}

/**
 * Permanently delete a habit
 *
 * @param id - The habit ID to delete
 * @returns Promise with success status
 *
 * @example
 * ```ts
 * const result = await deleteHabit('habit_123');
 * if (result.success) {
 *   console.log('Habit deleted');
 * }
 * ```
 */
export async function deleteHabit(
  id: string
): Promise<HabitServiceResult<boolean>> {
  // Validate ID
  if (!id || typeof id !== 'string') {
    return {
      success: false,
      error: new HabitServiceError(
        'Invalid habit ID',
        HabitServiceErrorCode.VALIDATION_ERROR,
        'id'
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();
    const doc = await db.habits.findOne(id).exec();

    if (!doc) {
      return {
        success: false,
        error: new HabitServiceError(
          `Habit with ID "${id}" not found`,
          HabitServiceErrorCode.NOT_FOUND
        ),
      };
    }

    await doc.remove();
    return { success: true, data: true };
  } catch (error) {
    return {
      success: false,
      error: new HabitServiceError(
        'Failed to delete habit',
        HabitServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Count habits with optional filtering
 *
 * @param options - Query options for filtering
 * @returns Promise with the count
 */
export async function countHabits(
  options?: Pick<HabitQueryOptions, 'type' | 'category' | 'frequency' | 'isArchived'>
): Promise<HabitServiceResult<number>> {
  try {
    const db = await getDatabaseOrThrow();

    // Build selector
    const selector: Record<string, unknown> = {};

    if (options?.type !== undefined) {
      selector.type = options.type;
    }
    if (options?.category !== undefined) {
      selector.category = options.category;
    }
    if (options?.frequency !== undefined) {
      selector.frequency = options.frequency;
    }
    if (options?.isArchived !== undefined) {
      selector.isArchived = options.isArchived;
    }

    // Create and execute query
    const query = Object.keys(selector).length > 0
      ? db.habits.count({ selector })
      : db.habits.count();

    const count = await query.exec();
    return { success: true, data: count };
  } catch (error) {
    return {
      success: false,
      error: new HabitServiceError(
        'Failed to count habits',
        HabitServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Check if a habit exists by ID
 *
 * @param id - The habit ID to check
 * @returns Promise with boolean indicating existence
 */
export async function habitExists(
  id: string
): Promise<HabitServiceResult<boolean>> {
  const result = await getHabitById(id);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data !== null };
}

/**
 * Bulk delete multiple habits
 *
 * @param ids - Array of habit IDs to delete
 * @returns Promise with count of deleted habits
 */
export async function bulkDeleteHabits(
  ids: string[]
): Promise<HabitServiceResult<number>> {
  if (!Array.isArray(ids)) {
    return {
      success: false,
      error: new HabitServiceError(
        'IDs must be an array',
        HabitServiceErrorCode.VALIDATION_ERROR
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();
    let deletedCount = 0;

    for (const id of ids) {
      if (typeof id === 'string' && id.length > 0) {
        const doc = await db.habits.findOne(id).exec();
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
      error: new HabitServiceError(
        'Failed to bulk delete habits',
        HabitServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Bulk archive multiple habits
 *
 * @param ids - Array of habit IDs to archive
 * @returns Promise with count of archived habits
 */
export async function bulkArchiveHabits(
  ids: string[]
): Promise<HabitServiceResult<number>> {
  if (!Array.isArray(ids)) {
    return {
      success: false,
      error: new HabitServiceError(
        'IDs must be an array',
        HabitServiceErrorCode.VALIDATION_ERROR
      ),
    };
  }

  try {
    const db = await getDatabaseOrThrow();
    let archivedCount = 0;

    for (const id of ids) {
      if (typeof id === 'string' && id.length > 0) {
        const doc = await db.habits.findOne(id).exec();
        if (doc && !doc.isArchived) {
          await doc.patch({
            isArchived: true,
            updatedAt: Date.now(),
          });
          archivedCount++;
        }
      }
    }

    return { success: true, data: archivedCount };
  } catch (error) {
    return {
      success: false,
      error: new HabitServiceError(
        'Failed to bulk archive habits',
        HabitServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}
