'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHabitLogsForHabit } from '@/lib/database/useHabitLogs';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HabitDocType, HabitLogDocType } from '@/lib/database/types';
import { LogEditDialog } from './LogEditDialog';

interface HabitCalendarHeatmapProps {
  habitId: string;
  habitType: HabitDocType['type'];
  habitColor?: HabitDocType['color'];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Color intensity mapping for heatmap visualization
 * Uses different color schemes based on whether the day was successful or not
 */
const HEATMAP_COLORS = {
  // Success colors (green gradient) - for positive habits completed or negative habits avoided
  success: {
    light: {
      low: 'bg-green-100',
      medium: 'bg-green-300',
      high: 'bg-green-500',
    },
    dark: {
      low: 'dark:bg-green-900/40',
      medium: 'dark:bg-green-700/60',
      high: 'dark:bg-green-600/80',
    },
  },
  // Failure colors (red gradient) - for positive habits missed or negative habits done
  failure: {
    light: {
      low: 'bg-red-100',
      medium: 'bg-red-300',
      high: 'bg-red-500',
    },
    dark: {
      low: 'dark:bg-red-900/40',
      medium: 'dark:bg-red-700/60',
      high: 'dark:bg-red-600/80',
    },
  },
  // No data - neutral color
  none: 'bg-muted/30 dark:bg-muted/20',
};

/**
 * Get the intensity level based on streak or consistency
 * For now, we use a simple approach - completed = high, not completed = low
 * Future enhancement: could use streak data for intensity
 */
function getIntensityClass(
  isSuccess: boolean,
  hasLog: boolean,
  streakCount?: number
): string {
  if (!hasLog) {
    return HEATMAP_COLORS.none;
  }

  const colorSet = isSuccess ? HEATMAP_COLORS.success : HEATMAP_COLORS.failure;

  // Determine intensity based on streak or completion
  // For now, completed = high intensity, not completed = medium
  // Future: use streak data for more nuanced intensity
  const intensity: 'low' | 'medium' | 'high' = isSuccess ? 'high' : 'medium';

  return `${colorSet.light[intensity]} ${colorSet.dark[intensity]}`;
}

export function HabitCalendarHeatmap({
  habitId,
  habitType,
  habitColor = 'green'
}: HabitCalendarHeatmapProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Calculate date range for current month view (including padding days)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startPadding = firstDayOfMonth.getDay();
  const startDate = new Date(currentYear, currentMonth, 1 - startPadding);
  const endDate = new Date(currentYear, currentMonth + 1, 6 - lastDayOfMonth.getDay());

  // Fetch logs for the visible date range
  const { logs, isLoading } = useHabitLogsForHabit(habitId, {
    startDate: formatDateString(startDate),
    endDate: formatDateString(endDate),
  });

  // Create a map of date -> log for quick lookup
  const logsByDate = React.useMemo(() => {
    const map = new Map<string, HabitLogDocType>();
    for (const log of logs) {
      map.set(log.date, log);
    }
    return map;
  }, [logs]);

  // Generate calendar days
  const calendarDays = React.useMemo(() => {
    const days: Array<{
      date: Date;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isFuture: boolean;
      log: HabitLogDocType | null;
    }> = [];

    const today = formatDateString(new Date());
    const todayDate = new Date();
    let currentDay = new Date(startDate);

    while (currentDay <= endDate) {
      const dateStr = formatDateString(currentDay);
      const isFuture = currentDay > todayDate;
      days.push({
        date: new Date(currentDay),
        dateStr,
        isCurrentMonth: currentDay.getMonth() === currentMonth,
        isToday: dateStr === today,
        isFuture,
        log: logsByDate.get(dateStr) ?? null,
      });
      currentDay = new Date(currentDay.getTime() + 24 * 60 * 60 * 1000);
    }

    return days;
  }, [startDate, endDate, currentMonth, logsByDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Determine success status based on habit type
  const isSuccess = (completed: boolean) => {
    return habitType === 'positive' ? completed : !completed;
  };

  // Handle date click
  const handleDateClick = (dateStr: string, isFuture: boolean) => {
    if (isFuture) return; // Don't allow editing future dates
    setSelectedDate(dateStr);
    setIsDialogOpen(true);
  };

  // Close dialog handler
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedDate(null);
  };

  // Calculate monthly stats
  const monthlyStats = React.useMemo(() => {
    const monthDays = calendarDays.filter(d => d.isCurrentMonth && !d.isFuture);
    const totalDays = monthDays.length;
    const completedDays = monthDays.filter(d => d.log?.completed).length;
    const successDays = monthDays.filter(d => d.log && isSuccess(d.log.completed)).length;

    return {
      totalDays,
      completedDays,
      successDays,
      successRate: totalDays > 0 ? Math.round((successDays / totalDays) * 100) : 0,
    };
  }, [calendarDays, habitType]);

  return (
    <>
      <Card data-testid="habit-calendar-heatmap">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="size-5" />
              Activity Heatmap
            </CardTitle>
            <div className="flex items-center gap-2">
              <span
                className="text-sm text-muted-foreground"
                data-testid="monthly-success-rate"
              >
                {monthlyStats.successRate}% success
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                data-testid="heatmap-today-button"
              >
                Today
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPreviousMonth}
              data-testid="heatmap-prev-month"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="font-medium" data-testid="heatmap-month-label">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              data-testid="heatmap-next-month"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Day labels */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_LABELS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-muted-foreground py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar heatmap grid */}
              <div className="grid grid-cols-7 gap-1" data-testid="heatmap-grid">
                {calendarDays.map(({ date, dateStr, isCurrentMonth, isToday, isFuture, log }) => {
                  const hasLog = log !== null;
                  const success = hasLog && isSuccess(log.completed);
                  const intensityClass = getIntensityClass(success, hasLog);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDateClick(dateStr, isFuture)}
                      disabled={isFuture}
                      className={cn(
                        'relative aspect-square flex flex-col items-center justify-center rounded-md text-sm transition-all',
                        !isCurrentMonth && 'opacity-30',
                        isFuture && 'opacity-20 cursor-not-allowed',
                        !isFuture && isCurrentMonth && 'cursor-pointer hover:ring-2 hover:ring-primary/50 hover:ring-offset-1',
                        isToday && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                        intensityClass
                      )}
                      title={
                        log?.notes
                          ? `${dateStr}: ${log.notes}`
                          : hasLog
                          ? `${dateStr}: ${success ? 'Success' : 'Missed'}`
                          : `${dateStr}: Click to add log`
                      }
                      data-testid={`heatmap-day-${dateStr}`}
                      data-status={hasLog ? (success ? 'success' : 'failure') : 'none'}
                      data-completed={hasLog ? String(log.completed) : 'false'}
                      aria-label={`${dateStr}${hasLog ? (success ? ' - Success' : ' - Missed') : ''}`}
                    >
                      <span className={cn(
                        'text-sm',
                        isToday && 'font-bold',
                        hasLog && success && 'text-green-950 dark:text-green-50',
                        hasLog && !success && 'text-red-950 dark:text-red-50'
                      )}>
                        {date.getDate()}
                      </span>
                      {/* Notes indicator */}
                      {log?.notes && (
                        <div className="absolute top-0.5 right-0.5">
                          <div className="size-1.5 rounded-full bg-blue-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Less</span>
                  <div className="flex gap-0.5">
                    <div className="size-4 rounded bg-muted/30 dark:bg-muted/20" title="No data" />
                    <div className="size-4 rounded bg-green-100 dark:bg-green-900/40" title="Low activity" />
                    <div className="size-4 rounded bg-green-300 dark:bg-green-700/60" title="Medium activity" />
                    <div className="size-4 rounded bg-green-500 dark:bg-green-600/80" title="High activity" />
                  </div>
                  <span className="text-xs text-muted-foreground">More</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="size-1.5 rounded-full bg-blue-500" />
                  <span>Has notes</span>
                </div>
              </div>

              {/* Click hint */}
              <p className="text-center text-xs text-muted-foreground mt-2">
                Click on a date to view or edit the log
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Log Edit Dialog */}
      <LogEditDialog
        habitId={habitId}
        habitType={habitType}
        date={selectedDate}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={handleDialogClose}
      />
    </>
  );
}
