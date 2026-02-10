"use client";

import { useState } from "react";
import { Bell, BellOff, Clock, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotificationSettings } from "@/lib/database/useNotificationSettings";

export function NotificationSettings() {
  const {
    settings,
    isLoading,
    isReady,
    isSupported,
    permissionStatus,
    updateSettings,
    toggleEnabled,
    requestPermission,
    sendTestNotification,
    getFormattedTime,
  } = useNotificationSettings();

  const [isUpdating, setIsUpdating] = useState(false);
  const [testSent, setTestSent] = useState(false);

  if (isLoading || !isReady) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-3 w-48 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
        <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-medium text-amber-900 dark:text-amber-100">
            Notifications not supported
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Your browser doesn&apos;t support notifications. Try using a different browser.
          </p>
        </div>
      </div>
    );
  }

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await toggleEnabled();
    } catch (error) {
      console.error("Failed to toggle notifications:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTimeChange = async (time: string) => {
    setIsUpdating(true);
    try {
      await updateSettings({ reminderTime: time });
    } catch (error) {
      console.error("Failed to update time:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestNotification = () => {
    const success = sendTestNotification();
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  const handleRequestPermission = async () => {
    setIsUpdating(true);
    try {
      await requestPermission();
    } finally {
      setIsUpdating(false);
    }
  };

  const needsPermission = permissionStatus !== "granted" && permissionStatus !== "unsupported";
  const permissionDenied = permissionStatus === "denied";

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
          settings?.enabled
            ? "border-primary bg-primary/5"
            : "border-border hover:bg-accent",
          isUpdating && "opacity-50 cursor-not-allowed"
        )}
      >
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-md",
            settings?.enabled
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {settings?.enabled ? (
            <Bell className="size-5" />
          ) : (
            <BellOff className="size-5" />
          )}
        </div>
        <div className="flex-1">
          <div
            className={cn(
              "font-medium",
              settings?.enabled && "text-primary"
            )}
          >
            Daily Reminders
          </div>
          <div className="text-sm text-muted-foreground">
            {settings?.enabled
              ? `Reminder at ${getFormattedTime()}`
              : "Get reminded to track your habits"}
          </div>
        </div>
        <div
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            settings?.enabled ? "bg-primary" : "bg-muted"
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
              settings?.enabled ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </div>
      </button>

      {/* Permission Required Notice */}
      {needsPermission && !permissionDenied && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            To receive notifications, you need to grant permission.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRequestPermission}
            disabled={isUpdating}
            className="mt-2"
          >
            Grant Permission
          </Button>
        </div>
      )}

      {/* Permission Denied Notice */}
      {permissionDenied && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-sm text-red-700 dark:text-red-300">
            Notification permission was denied. Please enable notifications in your browser settings to use this feature.
          </p>
        </div>
      )}

      {/* Time Picker (only show when enabled) */}
      {settings?.enabled && (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <Label htmlFor="reminder-time" className="text-sm font-medium">
              Reminder Time
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Input
              id="reminder-time"
              type="time"
              value={settings.reminderTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              disabled={isUpdating}
              className="w-auto"
            />
            <span className="text-sm text-muted-foreground">
              {getFormattedTime()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            You&apos;ll receive a reminder to track your habits at this time each day.
          </p>
        </div>
      )}

      {/* Test Notification */}
      {settings?.enabled && permissionStatus === "granted" && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestNotification}
            disabled={testSent}
          >
            {testSent ? (
              <>
                <Check className="mr-1.5 size-4" />
                Sent!
              </>
            ) : (
              "Send Test Notification"
            )}
          </Button>
          <span className="text-xs text-muted-foreground">
            Test that notifications are working
          </span>
        </div>
      )}
    </div>
  );
}
