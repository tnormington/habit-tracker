'use client';

import { useState, useCallback } from 'react';
import {
  Wrench,
  Bell,
  Trash2,
  Database,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { showTestNotification, requestNotificationPermission, getNotificationPermission } from '@/lib/database/notificationService';
import { createDummyData, clearAllData, getDatabaseStats, deleteAllHabits } from '@/lib/database/adminService';

interface AdminAction {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
  action: () => Promise<void>;
  confirmRequired?: boolean;
}

interface ActionResult {
  id: string;
  success: boolean;
  message: string;
}

export function AdminBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [results, setResults] = useState<ActionResult[]>([]);
  const [stats, setStats] = useState<{ habits: number; habitLogs: number; archivedHabits: number } | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<string | null>(null);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const addResult = (id: string, success: boolean, message: string) => {
    setResults((prev) => [{ id, success, message }, ...prev.slice(0, 4)]);
  };

  const handleTestNotification = async () => {
    setIsLoading('notification');
    try {
      const permission = getNotificationPermission();
      if (permission !== 'granted') {
        const permResult = await requestNotificationPermission();
        if (!permResult.success || !permResult.data) {
          addResult('notification', false, 'Permission denied');
          return;
        }
      }

      const result = showTestNotification();
      if (result.success) {
        addResult('notification', true, 'Test notification sent!');
      } else {
        addResult('notification', false, result.error?.message ?? 'Failed to show notification');
      }
    } catch (error) {
      addResult('notification', false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(null);
    }
  };

  const handleCreateDummyData = async () => {
    setIsLoading('dummy');
    try {
      const result = await createDummyData({
        habitCount: 5,
        daysOfHistory: 30,
        completionRate: 0.7,
      });
      if (result.success && result.data) {
        addResult('dummy', true, `Created ${result.data.habitsCreated} habits, ${result.data.logsCreated} logs`);
        // Refresh stats
        await handleRefreshStats();
      } else {
        addResult('dummy', false, result.error ?? 'Failed to create dummy data');
      }
    } catch (error) {
      addResult('dummy', false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(null);
      setConfirmingAction(null);
    }
  };

  const handleDeleteAllHabits = async () => {
    if (confirmingAction !== 'delete') {
      setConfirmingAction('delete');
      return;
    }

    setIsLoading('delete');
    try {
      const result = await deleteAllHabits();
      if (result.success && result.data) {
        addResult('delete', true, `Deleted ${result.data.habitsDeleted} habits, ${result.data.logsDeleted} logs`);
        // Refresh stats
        await handleRefreshStats();
      } else {
        addResult('delete', false, result.error ?? 'Failed to delete habits');
      }
    } catch (error) {
      addResult('delete', false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(null);
      setConfirmingAction(null);
    }
  };

  const handleClearDatabase = async () => {
    if (confirmingAction !== 'clear') {
      setConfirmingAction('clear');
      return;
    }

    setIsLoading('clear');
    try {
      const result = await clearAllData();
      if (result.success) {
        addResult('clear', true, 'Database cleared! Refreshing page...');
        // Refresh the page to reinitialize the database
        setTimeout(() => window.location.reload(), 1500);
      } else {
        addResult('clear', false, result.error ?? 'Failed to clear database');
      }
    } catch (error) {
      addResult('clear', false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(null);
      setConfirmingAction(null);
    }
  };

  const handleRefreshStats = async () => {
    setIsLoading('stats');
    try {
      const result = await getDatabaseStats();
      if (result.success && result.data) {
        setStats(result.data);
        addResult('stats', true, 'Stats refreshed');
      } else {
        addResult('stats', false, result.error ?? 'Failed to get stats');
      }
    } catch (error) {
      addResult('stats', false, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(null);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !stats) {
      handleRefreshStats();
    }
    if (!open) {
      setConfirmingAction(null);
    }
  };

  return (
    <>
      {/* Floating Admin Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 size-12 rounded-full shadow-lg bg-background border-2 border-primary/50 hover:border-primary"
        onClick={() => handleOpenChange(true)}
        title="Admin Tools"
      >
        <Wrench className="size-5" />
      </Button>

      {/* Admin Panel Sheet */}
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Wrench className="size-5" />
              Admin Tools
            </SheetTitle>
            <SheetDescription>
              Development and debugging tools for the habit tracker.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Database Stats */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium flex items-center gap-2">
                  <BarChart3 className="size-4" />
                  Database Stats
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshStats}
                  disabled={isLoading === 'stats'}
                >
                  <RefreshCw className={`size-4 ${isLoading === 'stats' ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {stats ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-muted p-2">
                    <div className="text-2xl font-bold">{stats.habits}</div>
                    <div className="text-xs text-muted-foreground">Habits</div>
                  </div>
                  <div className="rounded-md bg-muted p-2">
                    <div className="text-2xl font-bold">{stats.habitLogs}</div>
                    <div className="text-xs text-muted-foreground">Logs</div>
                  </div>
                  <div className="rounded-md bg-muted p-2">
                    <div className="text-2xl font-bold">{stats.archivedHabits}</div>
                    <div className="text-xs text-muted-foreground">Archived</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Loading stats...
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <h3 className="font-medium">Actions</h3>

              {/* Test Notification */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={handleTestNotification}
                disabled={isLoading !== null}
              >
                <Bell className="size-4" />
                <div className="flex-1 text-left">
                  <div>Test Notification</div>
                  <div className="text-xs text-muted-foreground">Send a test browser notification</div>
                </div>
              </Button>

              {/* Create Dummy Data */}
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={handleCreateDummyData}
                disabled={isLoading !== null}
              >
                <Plus className="size-4" />
                <div className="flex-1 text-left">
                  <div>Create Dummy Data</div>
                  <div className="text-xs text-muted-foreground">Add 5 habits with 30 days of history</div>
                </div>
              </Button>

              {/* Delete All Habits */}
              <Button
                variant={confirmingAction === 'delete' ? 'destructive' : 'outline'}
                className="w-full justify-start gap-3"
                onClick={handleDeleteAllHabits}
                disabled={isLoading !== null && isLoading !== 'delete'}
              >
                <Trash2 className="size-4" />
                <div className="flex-1 text-left">
                  <div>{confirmingAction === 'delete' ? 'Click again to confirm' : 'Delete All Habits'}</div>
                  <div className="text-xs text-muted-foreground">
                    {confirmingAction === 'delete' ? 'This action cannot be undone!' : 'Remove all habits and logs'}
                  </div>
                </div>
              </Button>

              {/* Clear Database */}
              <Button
                variant={confirmingAction === 'clear' ? 'destructive' : 'outline'}
                className="w-full justify-start gap-3"
                onClick={handleClearDatabase}
                disabled={isLoading !== null && isLoading !== 'clear'}
              >
                <Database className="size-4" />
                <div className="flex-1 text-left">
                  <div>{confirmingAction === 'clear' ? 'Click again to confirm' : 'Clear Database'}</div>
                  <div className="text-xs text-muted-foreground">
                    {confirmingAction === 'clear' ? 'Will delete everything and refresh!' : 'Remove database and refresh page'}
                  </div>
                </div>
              </Button>
            </div>

            {/* Action Results */}
            {results.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Recent Actions</h3>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={`${result.id}-${index}`}
                      className={`flex items-start gap-2 rounded-md p-2 text-sm ${
                        result.success
                          ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'
                          : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'
                      }`}
                    >
                      {result.success ? (
                        <CheckCircle2 className="size-4 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="size-4 mt-0.5 shrink-0" />
                      )}
                      <span>{result.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/50 p-3">
              <div className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium">Development Only</div>
                  <div className="text-xs mt-1">
                    This panel is only visible in development mode. It will not appear in production builds.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
