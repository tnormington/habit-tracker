'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHabitLogsForHabit } from '@/lib/database/useHabitLogs';
import { Check, X, MessageSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HabitDocType } from '@/lib/database/types';

interface HabitRecentLogsProps {
  habitId: string;
  habitType: HabitDocType['type'];
}

export function HabitRecentLogs({ habitId, habitType }: HabitRecentLogsProps) {
  const { logs, isLoading, error } = useHabitLogsForHabit(habitId);

  // Show only logs with notes or recent completions
  const recentLogs = logs.slice(0, 10);

  // Determine success status based on habit type
  const isSuccess = (completed: boolean) => {
    return habitType === 'positive' ? completed : !completed;
  };

  if (isLoading) {
    return (
      <Card data-testid="habit-recent-logs-loading">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 py-2">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-24 mb-2" />
                  <div className="h-3 bg-muted rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="habit-recent-logs-error">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load recent activity
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="habit-recent-logs">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {recentLogs.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="size-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No activity recorded yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start tracking this habit to see your activity here
            </p>
          </div>
        ) : (
          <div className="space-y-1" data-testid="recent-logs-list">
            {recentLogs.map((log) => {
              const success = isSuccess(log.completed);
              const dateObj = new Date(log.date + 'T12:00:00');
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);

              // Format dates in local timezone
              const formatDateLocal = (d: Date) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              };

              const todayStr = formatDateLocal(today);
              const yesterdayStr = formatDateLocal(yesterday);

              let dateLabel: string;
              if (log.date === todayStr) {
                dateLabel = 'Today';
              } else if (log.date === yesterdayStr) {
                dateLabel = 'Yesterday';
              } else {
                dateLabel = dateObj.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });
              }

              return (
                <div
                  key={log.id}
                  className={cn(
                    'flex items-start gap-3 py-3 px-3 rounded-lg transition-colors',
                    'hover:bg-muted/50'
                  )}
                  data-testid={`log-entry-${log.date}`}
                >
                  {/* Status indicator */}
                  <div
                    className={cn(
                      'size-8 rounded-full flex items-center justify-center shrink-0',
                      success
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    )}
                  >
                    {success ? (
                      <Check className="size-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="size-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium" data-testid="log-date">
                        {dateLabel}
                      </span>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          success
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}
                        data-testid="log-status"
                      >
                        {success ? 'Success' : 'Missed'}
                      </span>
                    </div>
                    {log.notes && (
                      <div className="mt-1.5 flex items-start gap-1.5">
                        <MessageSquare className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                        <p
                          className="text-sm text-muted-foreground line-clamp-2"
                          data-testid="log-notes"
                        >
                          {log.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
