'use client';

/**
 * Notification Settings Service
 * Service layer for managing notification preferences and scheduling
 */

import { getDatabase } from './database';
import type {
  NotificationSettingsDocType,
  NotificationSettingsDocument,
  HabitTrackerDatabase,
} from './types';

// ============================================================================
// Types
// ============================================================================

/**
 * Input for updating notification settings
 */
export interface UpdateNotificationSettingsData {
  enabled?: boolean;
  reminderTime?: string;
  timezone?: string;
  permissionGranted?: boolean;
}

/**
 * Result of a notification service operation
 */
export interface NotificationServiceResult<T> {
  success: boolean;
  data?: T;
  error?: NotificationServiceError;
}

/**
 * Custom error class for notification service operations
 */
export class NotificationServiceError extends Error {
  constructor(
    message: string,
    public readonly code: NotificationServiceErrorCode,
    public readonly field?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'NotificationServiceError';
  }
}

/**
 * Error codes for notification service operations
 */
export enum NotificationServiceErrorCode {
  DATABASE_NOT_INITIALIZED = 'DATABASE_NOT_INITIALIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  OPERATION_FAILED = 'OPERATION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
}

// ============================================================================
// Constants
// ============================================================================

/** Default settings ID (singleton pattern) */
const DEFAULT_SETTINGS_ID = 'default';

/** Default reminder time (9:00 AM) */
const DEFAULT_REMINDER_TIME = '09:00';

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate time format (HH:MM in 24-hour format)
 */
export function validateTimeFormat(time: unknown): string | null {
  if (typeof time !== 'string') {
    return 'Time must be a string';
  }
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timeRegex.test(time)) {
    return 'Time must be in HH:MM format (24-hour)';
  }
  return null;
}

/**
 * Validate timezone string
 */
export function validateTimezone(timezone: unknown): string | null {
  if (typeof timezone !== 'string') {
    return 'Timezone must be a string';
  }
  if (timezone.length === 0) {
    return 'Timezone is required';
  }
  // Basic validation - check if it's a valid IANA timezone
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return null;
  } catch {
    return 'Invalid timezone';
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get database instance with error handling
 */
async function getDatabaseOrThrow(): Promise<HabitTrackerDatabase> {
  try {
    return await getDatabase();
  } catch (error) {
    throw new NotificationServiceError(
      'Database not initialized',
      NotificationServiceErrorCode.DATABASE_NOT_INITIALIZED,
      undefined,
      error
    );
  }
}

/**
 * Convert RxDocument to plain object
 */
function documentToSettings(doc: NotificationSettingsDocument): NotificationSettingsDocType {
  return doc.toJSON() as NotificationSettingsDocType;
}

/**
 * Get user's current timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get default notification settings
 */
export function getDefaultSettings(): NotificationSettingsDocType {
  return {
    id: DEFAULT_SETTINGS_ID,
    enabled: false,
    reminderTime: DEFAULT_REMINDER_TIME,
    timezone: getUserTimezone(),
    permissionGranted: false,
    updatedAt: Date.now(),
  };
}

// ============================================================================
// Browser Notification Functions
// ============================================================================

/**
 * Check if browser notifications are supported
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationServiceResult<boolean>> {
  if (!isNotificationSupported()) {
    return {
      success: false,
      error: new NotificationServiceError(
        'Browser notifications are not supported',
        NotificationServiceErrorCode.NOT_SUPPORTED
      ),
    };
  }

  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';

    // Update the stored permission status
    await updateNotificationSettings({ permissionGranted: granted });

    return { success: true, data: granted };
  } catch (error) {
    return {
      success: false,
      error: new NotificationServiceError(
        'Failed to request notification permission',
        NotificationServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Show a test notification
 */
export function showTestNotification(): NotificationServiceResult<boolean> {
  if (!isNotificationSupported()) {
    return {
      success: false,
      error: new NotificationServiceError(
        'Browser notifications are not supported',
        NotificationServiceErrorCode.NOT_SUPPORTED
      ),
    };
  }

  if (Notification.permission !== 'granted') {
    return {
      success: false,
      error: new NotificationServiceError(
        'Notification permission not granted',
        NotificationServiceErrorCode.PERMISSION_DENIED
      ),
    };
  }

  try {
    new Notification('Habit Tracker', {
      body: 'Daily reminder notifications are working!',
      icon: '/icon-192x192.png',
      tag: 'habit-tracker-test',
    });
    return { success: true, data: true };
  } catch (error) {
    return {
      success: false,
      error: new NotificationServiceError(
        'Failed to show notification',
        NotificationServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Show the daily reminder notification
 */
export function showReminderNotification(): NotificationServiceResult<boolean> {
  if (!isNotificationSupported()) {
    return {
      success: false,
      error: new NotificationServiceError(
        'Browser notifications are not supported',
        NotificationServiceErrorCode.NOT_SUPPORTED
      ),
    };
  }

  if (Notification.permission !== 'granted') {
    return {
      success: false,
      error: new NotificationServiceError(
        'Notification permission not granted',
        NotificationServiceErrorCode.PERMISSION_DENIED
      ),
    };
  }

  try {
    new Notification('Time to Update Your Habits!', {
      body: "Don't forget to track your habits for today.",
      icon: '/icon-192x192.png',
      tag: 'habit-tracker-reminder',
      requireInteraction: true,
    });
    return { success: true, data: true };
  } catch (error) {
    return {
      success: false,
      error: new NotificationServiceError(
        'Failed to show reminder notification',
        NotificationServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

// ============================================================================
// Settings CRUD Functions
// ============================================================================

/**
 * Get notification settings (creates default if doesn't exist)
 */
export async function getNotificationSettings(): Promise<NotificationServiceResult<NotificationSettingsDocType>> {
  try {
    const db = await getDatabaseOrThrow();
    let doc = await db.notification_settings.findOne(DEFAULT_SETTINGS_ID).exec();

    // Create default settings if they don't exist
    if (!doc) {
      const defaultSettings = getDefaultSettings();
      doc = await db.notification_settings.insert(defaultSettings);
    }

    // Sync permission status with browser
    const currentPermission = getNotificationPermission();
    const permissionGranted = currentPermission === 'granted';
    const settings = documentToSettings(doc);

    // Update if permission status has changed
    if (settings.permissionGranted !== permissionGranted) {
      await doc.patch({
        permissionGranted,
        updatedAt: Date.now(),
      });
      return { success: true, data: { ...settings, permissionGranted } };
    }

    return { success: true, data: settings };
  } catch (error) {
    return {
      success: false,
      error: new NotificationServiceError(
        'Failed to get notification settings',
        NotificationServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  data: UpdateNotificationSettingsData
): Promise<NotificationServiceResult<NotificationSettingsDocType>> {
  // Validate reminder time if provided
  if (data.reminderTime !== undefined) {
    const timeError = validateTimeFormat(data.reminderTime);
    if (timeError) {
      return {
        success: false,
        error: new NotificationServiceError(
          timeError,
          NotificationServiceErrorCode.VALIDATION_ERROR,
          'reminderTime'
        ),
      };
    }
  }

  // Validate timezone if provided
  if (data.timezone !== undefined) {
    const tzError = validateTimezone(data.timezone);
    if (tzError) {
      return {
        success: false,
        error: new NotificationServiceError(
          tzError,
          NotificationServiceErrorCode.VALIDATION_ERROR,
          'timezone'
        ),
      };
    }
  }

  try {
    const db = await getDatabaseOrThrow();
    let doc = await db.notification_settings.findOne(DEFAULT_SETTINGS_ID).exec();

    // Create default settings if they don't exist
    if (!doc) {
      const defaultSettings = getDefaultSettings();
      doc = await db.notification_settings.insert(defaultSettings);
    }

    // Prepare updates
    const updates: Partial<NotificationSettingsDocType> = {
      updatedAt: Date.now(),
    };

    if (data.enabled !== undefined) {
      updates.enabled = data.enabled;
    }
    if (data.reminderTime !== undefined) {
      updates.reminderTime = data.reminderTime;
    }
    if (data.timezone !== undefined) {
      updates.timezone = data.timezone;
    }
    if (data.permissionGranted !== undefined) {
      updates.permissionGranted = data.permissionGranted;
    }

    const updatedDoc = await doc.patch(updates);
    return { success: true, data: documentToSettings(updatedDoc) };
  } catch (error) {
    return {
      success: false,
      error: new NotificationServiceError(
        'Failed to update notification settings',
        NotificationServiceErrorCode.OPERATION_FAILED,
        undefined,
        error
      ),
    };
  }
}

/**
 * Enable notifications
 */
export async function enableNotifications(): Promise<NotificationServiceResult<NotificationSettingsDocType>> {
  // First, request permission if not already granted
  const permission = getNotificationPermission();
  if (permission !== 'granted') {
    const permResult = await requestNotificationPermission();
    if (!permResult.success || !permResult.data) {
      return {
        success: false,
        error: new NotificationServiceError(
          'Notification permission is required to enable notifications',
          NotificationServiceErrorCode.PERMISSION_DENIED
        ),
      };
    }
  }

  return updateNotificationSettings({ enabled: true, permissionGranted: true });
}

/**
 * Disable notifications
 */
export async function disableNotifications(): Promise<NotificationServiceResult<NotificationSettingsDocType>> {
  return updateNotificationSettings({ enabled: false });
}

// ============================================================================
// Scheduling Functions
// ============================================================================

/**
 * Calculate milliseconds until the next reminder time
 */
export function getMillisecondsUntilReminder(
  reminderTime: string,
  timezone: string
): number {
  const now = new Date();
  const [hours, minutes] = reminderTime.split(':').map(Number);

  // Create a date object for today's reminder time in the user's timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0';

  const currentHour = parseInt(getPart('hour'), 10);
  const currentMinute = parseInt(getPart('minute'), 10);

  // Calculate if we've passed today's reminder time
  const reminderMinutes = hours * 60 + minutes;
  const currentMinutes = currentHour * 60 + currentMinute;

  let msUntilReminder: number;

  if (currentMinutes < reminderMinutes) {
    // Reminder is later today
    msUntilReminder = (reminderMinutes - currentMinutes) * 60 * 1000;
  } else {
    // Reminder is tomorrow
    msUntilReminder = ((24 * 60) - currentMinutes + reminderMinutes) * 60 * 1000;
  }

  return msUntilReminder;
}

/**
 * Format time for display (convert 24h to 12h format)
 */
export function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Convert 12h time to 24h format
 */
export function convertTo24Hour(time: string, period: 'AM' | 'PM'): string {
  const [hours, minutes] = time.split(':').map(Number);
  let hours24 = hours;

  if (period === 'AM') {
    hours24 = hours === 12 ? 0 : hours;
  } else {
    hours24 = hours === 12 ? 12 : hours + 12;
  }

  return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
