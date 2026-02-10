'use client';

/**
 * Admin Service Functions
 * Service layer for admin/dev related tasks like creating dummy data, clearing data, etc.
 */

import { getDatabase, removeDatabase } from './database';
import { createHabit, type CreateHabitData } from './habitService';
import { setHabitCompletion } from './habitLogService';
import type {
  HabitType,
  HabitCategory,
  HabitColor,
  HabitFrequency,
  HabitDocType,
} from './types';

// ============================================================================
// Types
// ============================================================================

export interface AdminServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DummyDataOptions {
  habitCount?: number;
  daysOfHistory?: number;
  completionRate?: number; // 0-1, probability of completion
}

// ============================================================================
// Constants
// ============================================================================

const DUMMY_HABITS: CreateHabitData[] = [
  { name: 'Morning Exercise', description: 'Start the day with a workout', type: 'positive', category: 'fitness', color: 'green', frequency: 'daily' },
  { name: 'Read for 30 minutes', description: 'Read books or articles', type: 'positive', category: 'learning', color: 'blue', frequency: 'daily' },
  { name: 'Drink 8 glasses of water', description: 'Stay hydrated', type: 'positive', category: 'health', color: 'blue', frequency: 'daily' },
  { name: 'Meditate', description: '10 minutes of mindfulness', type: 'positive', category: 'mindfulness', color: 'purple', frequency: 'daily' },
  { name: 'Practice coding', description: 'Work on programming skills', type: 'positive', category: 'learning', color: 'orange', frequency: 'daily' },
  { name: 'Write in journal', description: 'Reflect on the day', type: 'positive', category: 'mindfulness', color: 'pink', frequency: 'daily' },
  { name: 'Track expenses', description: 'Log daily spending', type: 'neutral', category: 'finance', color: 'green', frequency: 'daily' },
  { name: 'Social media', description: 'Limit social media usage', type: 'negative', category: 'productivity', color: 'red', frequency: 'daily' },
  { name: 'Processed food', description: 'Avoid junk food', type: 'negative', category: 'health', color: 'red', frequency: 'daily' },
  { name: 'Weekly review', description: 'Review goals and progress', type: 'positive', category: 'productivity', color: 'yellow', frequency: 'weekly' },
  { name: 'Call family', description: 'Stay connected with loved ones', type: 'positive', category: 'social', color: 'pink', frequency: 'weekly' },
  { name: 'Monthly budget review', description: 'Review and plan finances', type: 'positive', category: 'finance', color: 'green', frequency: 'monthly' },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a random subset of items from an array
 */
function getRandomSubset<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Generate dates for the past N days
 */
function getPastDates(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

// ============================================================================
// Admin Functions
// ============================================================================

/**
 * Create dummy habits with completion history
 */
export async function createDummyData(
  options: DummyDataOptions = {}
): Promise<AdminServiceResult<{ habitsCreated: number; logsCreated: number }>> {
  const {
    habitCount = 5,
    daysOfHistory = 30,
    completionRate = 0.7,
  } = options;

  try {
    const habitsToCreate = getRandomSubset(DUMMY_HABITS, habitCount);
    const dates = getPastDates(daysOfHistory);
    const createdHabits: HabitDocType[] = [];
    let logsCreated = 0;

    // Create habits
    for (const habitData of habitsToCreate) {
      const result = await createHabit(habitData);
      if (result.success && result.data) {
        createdHabits.push(result.data);
      }
    }

    // Create completion history
    for (const habit of createdHabits) {
      for (const date of dates) {
        // Only create logs for daily habits on all days, weekly on some days, monthly on first of month
        let shouldCreateLog = false;

        if (habit.frequency === 'daily') {
          shouldCreateLog = true;
        } else if (habit.frequency === 'weekly') {
          // Create log for one day per week
          const dayOfWeek = new Date(date).getDay();
          shouldCreateLog = dayOfWeek === 0; // Sunday
        } else if (habit.frequency === 'monthly') {
          // Create log for first of month
          const dayOfMonth = new Date(date).getDate();
          shouldCreateLog = dayOfMonth === 1;
        }

        if (shouldCreateLog && Math.random() < completionRate) {
          const result = await setHabitCompletion(habit.id, date, true);
          if (result.success) {
            logsCreated++;
          }
        }
      }
    }

    return {
      success: true,
      data: {
        habitsCreated: createdHabits.length,
        logsCreated,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create dummy data',
    };
  }
}

/**
 * Remove all data from the database
 */
export async function clearAllData(): Promise<AdminServiceResult<boolean>> {
  try {
    await removeDatabase();
    return { success: true, data: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear data',
    };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<AdminServiceResult<{
  habits: number;
  habitLogs: number;
  archivedHabits: number;
}>> {
  try {
    const db = await getDatabase();

    const habits = await db.habits.count().exec();
    const habitLogs = await db.habit_logs.count().exec();
    const archivedHabits = await db.habits.count({
      selector: { isArchived: true },
    }).exec();

    return {
      success: true,
      data: {
        habits,
        habitLogs,
        archivedHabits,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get database stats',
    };
  }
}

/**
 * Delete all habits and their logs
 */
export async function deleteAllHabits(): Promise<AdminServiceResult<{ habitsDeleted: number; logsDeleted: number }>> {
  try {
    const db = await getDatabase();

    // Get all habit IDs first
    const habits = await db.habits.find().exec();
    const habitIds = habits.map(h => h.id);

    // Delete all habit logs
    const logs = await db.habit_logs.find().exec();
    let logsDeleted = 0;
    for (const log of logs) {
      await log.remove();
      logsDeleted++;
    }

    // Delete all habits
    let habitsDeleted = 0;
    for (const habit of habits) {
      await habit.remove();
      habitsDeleted++;
    }

    return {
      success: true,
      data: {
        habitsDeleted,
        logsDeleted,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete all habits',
    };
  }
}
