"use client";

import { useNotificationScheduler } from "@/lib/database/useNotificationSettings";

/**
 * NotificationProvider Component
 *
 * Client-side wrapper that initializes the notification scheduler.
 * This should be placed within the app layout to ensure notifications
 * are scheduled when the app is open.
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  // Initialize the notification scheduler
  useNotificationScheduler();

  return <>{children}</>;
}
