'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHabitLogsForHabit } from '@/lib/database/useHabitLogs';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HabitDocType } from '@/lib/database/types';

interface HabitCalendarProps {
  habitId: string;
  habitType: HabitDocType['type'];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function HabitCalendar({ habitId, habitType }: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
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
    const map = new Map<string, { completed: boolean; notes: string }>();
    for (const log of logs) {
      map.set(log.date, { completed: log.completed, notes: log.notes });
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
      log: { completed: boolean; notes: string } | null;
    }> = [];

    const today = formatDateString(new Date());
    let currentDay = new Date(startDate);

    while (currentDay <= endDate) {
      const dateStr = formatDateString(currentDay);
      days.push({
        date: new Date(currentDay),
        dateStr,
        isCurrentMonth: currentDay.getMonth() === currentMonth,
        isToday: dateStr === today,
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

  return (
    <Card data-testid="habit-calendar">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Completion History</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              data-testid="calendar-today-button"
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
            data-testid="calendar-prev-month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="font-medium" data-testid="calendar-month-label">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            data-testid="calendar-next-month"
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
                <div key={i} className="h-10 bg-muted rounded" />
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

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1" data-testid="calendar-grid">
              {calendarDays.map(({ date, dateStr, isCurrentMonth, isToday, log }) => {
                const hasLog = log !== null;
                const success = hasLog && isSuccess(log.completed);
                const failure = hasLog && !isSuccess(log.completed);

                return (
                  <div
                    key={dateStr}
                    className={cn(
                      'relative aspect-square flex flex-col items-center justify-center rounded-md text-sm transition-colors',
                      !isCurrentMonth && 'opacity-40',
                      isToday && 'ring-2 ring-primary ring-offset-1',
                      hasLog && success && 'bg-green-100 dark:bg-green-900/30',
                      hasLog && failure && 'bg-red-100 dark:bg-red-900/30',
                      !hasLog && isCurrentMonth && 'hover:bg-muted/50'
                    )}
                    title={
                      log?.notes
                        ? `${dateStr}: ${log.notes}`
                        : hasLog
                        ? `${dateStr}: ${success ? 'Success' : 'Missed'}`
                        : dateStr
                    }
                    data-testid={`calendar-day-${dateStr}`}
                    data-status={hasLog ? (success ? 'success' : 'failure') : 'none'}
                  >
                    <span className={cn(
                      'text-sm',
                      isToday && 'font-bold'
                    )}>
                      {date.getDate()}
                    </span>
                    {hasLog && (
                      <div className="absolute bottom-0.5">
                        {success ? (
                          <Check className="size-3 text-green-600 dark:text-green-400" />
                        ) : (
                          <X className="size-3 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    )}
                    {log?.notes && (
                      <div className="absolute top-0.5 right-0.5">
                        <div className="size-1.5 rounded-full bg-blue-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="size-3 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="size-2 text-green-600" />
                </div>
                <span>Success</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="size-3 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <X className="size-2 text-red-600" />
                </div>
                <span>Missed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="size-1.5 rounded-full bg-blue-500" />
                <span>Has notes</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
