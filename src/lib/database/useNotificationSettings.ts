'use client';

/**
 * React Hook for Notification Settings
 * Provides reactive access to notification preferences with CRUD operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDatabase } from './useDatabase';
import type { NotificationSettingsDocType } from './types';
import {
  getDefaultSettings,
  getNotificationPermission,
  requestNotificationPermission,
  showTestNotification,
  showReminderNotification,
  isNotificationSupported,
  getMillisecondsUntilReminder,
  formatTimeForDisplay,
} from './notificationService';

/** Result type for useNotificationSettings hook */
export interface UseNotificationSettingsResult {
  /** Current notification settings */
  settings: NotificationSettingsDocType | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether data is ready to use */
  isReady: boolean;
  /** Whether browser notifications are supported */
  isSupported: boolean;
  /** Current browser permission status */
  permissionStatus: NotificationPermission | 'unsupported';
  /** Update notification settings */
  updateSettings: (updates: Partial<NotificationSettingsDocType>) => Promise<void>;
  /** Toggle notifications on/off */
  toggleEnabled: () => Promise<void>;
  /** Request notification permission */
  requestPermission: () => Promise<boolean>;
  /** Send a test notification */
  sendTestNotification: () => boolean;
  /** Format reminder time for display */
  getFormattedTime: () => string;
}

/**
 * Hook to access and manage notification settings with reactive updates
 *
 * @returns UseNotificationSettingsResult with settings and operations
 *
 * @example
 * ```tsx
 * const {
 *   settings,
 *   isLoading,
 *   updateSettings,
 *   toggleEnabled,
 *   requestPermission,
 * } = useNotificationSettings();
 *
 * // Toggle notifications
 * await toggleEnabled();
 *
 * // Update reminder time
 * await updateSettings({ reminderTime: '08:00' });
 * ```
 */
export function useNotificationSettings(): UseNotificationSettingsResult {
  const { database, isReady: isDatabaseReady, error: dbError } = useDatabase();
  const [settings, setSettings] = useState<NotificationSettingsDocType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

  // Track subscription for cleanup
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Check if notifications are supported
  const isSupported = isNotificationSupported();

  // Update permission status on mount and when window gains focus
  useEffect(() => {
    const updatePermission = () => {
      setPermissionStatus(getNotificationPermission());
    };

    updatePermission();
    window.addEventListener('focus', updatePermission);
    return () => window.removeEventListener('focus', updatePermission);
  }, []);

  // Setup reactive subscription to settings
  useEffect(() => {
    if (!isDatabaseReady || !database) {
      setIsLoading(!dbError);
      return;
    }

    const setupSubscription = async () => {
      setIsLoading(true);

      // Check if settings exist, create default if not
      let doc = await database.notification_settings.findOne('default').exec();

      if (!doc) {
        const defaultSettings = getDefaultSettings();
        doc = await database.notification_settings.insert(defaultSettings);
      }

      // Sync permission status with browser on initial load
      const currentPermission = getNotificationPermission();
      const browserPermissionGranted = currentPermission === 'granted';
      const currentSettings = doc.toJSON() as NotificationSettingsDocType;
      if (currentSettings.permissionGranted !== browserPermissionGranted) {
        await doc.patch({
          permissionGranted: browserPermissionGranted,
          updatedAt: Date.now(),
        });
      }

      // Subscribe to settings changes
      const subscription = database.notification_settings
        .findOne('default')
        .$.subscribe({
          next: (doc) => {
            if (doc) {
              setSettings(doc.toJSON() as NotificationSettingsDocType);
            } else {
              setSettings(getDefaultSettings());
            }
            setIsLoading(false);
            setError(null);
          },
          error: (err) => {
            console.error('Notification settings query error:', err);
            setError(err instanceof Error ? err : new Error('Query failed'));
            setIsLoading(false);
          },
        });

      subscriptionRef.current = subscription;
    };

    setupSubscription();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [database, isDatabaseReady, dbError]);

  // Update settings
  const updateSettings = useCallback(
    async (updates: Partial<NotificationSettingsDocType>): Promise<void> => {
      if (!database) {
        throw new Error('Database not initialized');
      }

      const doc = await database.notification_settings.findOne('default').exec();
      if (!doc) {
        throw new Error('Settings not found');
      }

      await doc.patch({
        ...updates,
        updatedAt: Date.now(),
      });
    },
    [database]
  );

  // Toggle enabled state
  const toggleEnabled = useCallback(async (): Promise<void> => {
    if (!settings) return;

    const newEnabled = !settings.enabled;

    // If enabling, check permission first
    if (newEnabled) {
      const permission = getNotificationPermission();
      if (permission !== 'granted') {
        const result = await requestNotificationPermission();
        if (!result.success || !result.data) {
          throw new Error('Permission denied');
        }
        setPermissionStatus('granted');
      }
      // Always update both enabled and permissionGranted when enabling
      // This ensures the scheduler sees the correct state
      await updateSettings({ enabled: newEnabled, permissionGranted: true });
    } else {
      await updateSettings({ enabled: newEnabled });
    }
  }, [settings, updateSettings]);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const result = await requestNotificationPermission();
    if (result.success && result.data !== undefined) {
      setPermissionStatus(result.data ? 'granted' : 'denied');
      return result.data;
    }
    return false;
  }, []);

  // Send test notification
  const sendTestNotification = useCallback((): boolean => {
    console.log('[Notification Hook] sendTestNotification called');
    const result = showTestNotification();
    console.log('[Notification Hook] showTestNotification result:', result);
    if (!result.success && result.error) {
      console.error('[Notification Hook] Error:', result.error.message, result.error.code);
    }
    return result.success && !!result.data;
  }, []);

  // Get formatted time
  const getFormattedTime = useCallback((): string => {
    if (!settings) return '';
    return formatTimeForDisplay(settings.reminderTime);
  }, [settings]);

  return {
    settings,
    isLoading: !dbError && (isLoading || !isDatabaseReady),
    error: error ?? dbError,
    isReady: isDatabaseReady && !isLoading && !error,
    isSupported,
    permissionStatus,
    updateSettings,
    toggleEnabled,
    requestPermission,
    sendTestNotification,
    getFormattedTime,
  };
}

/**
 * Hook to manage the notification scheduler
 * Schedules and triggers notifications at the configured time
 */
export function useNotificationScheduler(): void {
  const { settings, isReady, isSupported } = useNotificationSettings();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationDateRef = useRef<string | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Don't schedule if not ready, not supported, or disabled
    if (!isReady || !isSupported || !settings?.enabled || !settings?.permissionGranted) {
      return;
    }

    const scheduleNextNotification = () => {
      const msUntilReminder = getMillisecondsUntilReminder(
        settings.reminderTime,
        settings.timezone
      );

      // Cap at 24 hours to handle edge cases
      const cappedMs = Math.min(msUntilReminder, 24 * 60 * 60 * 1000);

      timeoutRef.current = setTimeout(() => {
        // Check if we've already sent a notification today (using local timezone)
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (lastNotificationDateRef.current !== today) {
          showReminderNotification();
          lastNotificationDateRef.current = today;
        }

        // Schedule the next notification
        scheduleNextNotification();
      }, cappedMs);
    };

    scheduleNextNotification();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isReady, isSupported, settings?.enabled, settings?.permissionGranted, settings?.reminderTime, settings?.timezone]);
}
