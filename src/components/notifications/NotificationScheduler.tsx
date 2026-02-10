"use client";

import { useNotificationScheduler } from "@/lib/database/useNotificationSettings";

/**
 * NotificationScheduler Component
 *
 * This component schedules and triggers notifications when the app is open.
 * It should be placed in the root layout to ensure it runs on all pages.
 *
 * Note: Notifications will only trigger when the app is open in the browser.
 * For background notifications when the app is closed, a service worker
 * implementation would be needed (PWA).
 */
export function NotificationScheduler() {
  // This hook handles all the scheduling logic
  useNotificationScheduler();

  // This component doesn't render anything
  return null;
}
