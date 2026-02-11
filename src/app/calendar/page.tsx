'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHabits } from '@/lib/database/useHabits';
import { useHabitLogs } from '@/lib/database/useHabitLogs';
import { ChevronLeft, ChevronRight, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Fetch all active habits
  const { habits, isLoading: habitsLoading } = useHabits({
    filter: { isArchived: false },
  });

  // Calculate date range for current month view (including padding days)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startPadding = firstDayOfMonth.getDay();
  const startDate = new Date(currentYear, currentMonth, 1 - startPadding);
  const endDate = new Date(currentYear, currentMonth + 1, 6 - lastDayOfMonth.getDay());

  // Fetch logs for the visible date range
  const { logs, isLoading: logsLoading } = useHabitLogs({
    filter: {
      startDate: formatDateString(startDate),
      endDate: formatDateString(endDate),
    },
  });

  // Create a map of date -> habit logs for quick lookup
  const logsByDateAndHabit = React.useMemo(() => {
    const map = new Map<string, Map<string, { completed: boolean; habitId: string }>>();
    for (const log of logs) {
      if (!map.has(log.date)) {
        map.set(log.date, new Map());
      }
      map.get(log.date)!.set(log.habitId, { completed: log.completed, habitId: log.habitId });
    }
    return map;
  }, [logs]);

  // Generate calendar days with completion stats
  const calendarDays = React.useMemo(() => {
    const days: Array<{
      date: Date;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isFuture: boolean;
      stats: {
        completed: number;
        total: number;
        rate: number;
      };
    }> = [];

    const today = formatDateString(new Date());
    const todayDate = new Date();
    let currentDay = new Date(startDate);

    while (currentDay <= endDate) {
      const dateStr = formatDateString(currentDay);
      const isFuture = currentDay > todayDate;

      // Calculate completion stats for this day
      const dayLogs = logsByDateAndHabit.get(dateStr);
      const totalHabits = habits.length;
      let completedHabits = 0;

      if (dayLogs) {
        for (const habit of habits) {
          const log = dayLogs.get(habit.id);
          if (log) {
            // For positive habits, completed = success; for negative, !completed = success
            const isSuccess = habit.type === 'positive' ? log.completed : !log.completed;
            if (isSuccess) completedHabits++;
          }
        }
      }

      days.push({
        date: new Date(currentDay),
        dateStr,
        isCurrentMonth: currentDay.getMonth() === currentMonth,
        isToday: dateStr === today,
        isFuture,
        stats: {
          completed: completedHabits,
          total: totalHabits,
          rate: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0,
        },
      });
      currentDay = new Date(currentDay.getTime() + 24 * 60 * 60 * 1000);
    }

    return days;
  }, [startDate, endDate, currentMonth, logsByDateAndHabit, habits]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate monthly summary stats
  const monthlyStats = React.useMemo(() => {
    const monthDays = calendarDays.filter(d => d.isCurrentMonth && !d.isFuture);
    const totalPossible = monthDays.reduce((sum, d) => sum + d.stats.total, 0);
    const totalCompleted = monthDays.reduce((sum, d) => sum + d.stats.completed, 0);
    const perfectDays = monthDays.filter(d => d.stats.rate === 100 && d.stats.total > 0).length;

    return {
      totalPossible,
      totalCompleted,
      rate: totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0,
      perfectDays,
      totalDays: monthDays.length,
    };
  }, [calendarDays]);

  const isLoading = habitsLoading || logsLoading;

  // Get color class based on completion rate
  const getCompletionColor = (rate: number, hasData: boolean) => {
    if (!hasData) return 'bg-muted/30 dark:bg-muted/20';
    if (rate === 100) return 'bg-green-500 dark:bg-green-600';
    if (rate >= 75) return 'bg-green-300 dark:bg-green-700/60';
    if (rate >= 50) return 'bg-yellow-300 dark:bg-yellow-700/60';
    if (rate >= 25) return 'bg-orange-300 dark:bg-orange-700/60';
    if (rate > 0) return 'bg-red-200 dark:bg-red-900/40';
    return 'bg-red-300 dark:bg-red-800/50';
  };

  return (
    <div className="space-y-8" data-testid="calendar-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="mt-1 text-muted-foreground">
          View your habit completion across all habits
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12" data-testid="calendar-loading">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : habits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No habits to track yet.</p>
            <Button asChild className="mt-4">
              <Link href="/habits">Create your first habit</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Monthly Stats Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">Monthly Rate</div>
                <div className="mt-1 text-2xl font-bold">{monthlyStats.rate}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">Completed</div>
                <div className="mt-1 text-2xl font-bold">
                  {monthlyStats.totalCompleted}/{monthlyStats.totalPossible}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">Perfect Days</div>
                <div className="mt-1 text-2xl font-bold">{monthlyStats.perfectDays}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">Active Habits</div>
                <div className="mt-1 text-2xl font-bold">{habits.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar */}
          <Card data-testid="calendar-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Activity Calendar</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  data-testid="calendar-today-button"
                >
                  Today
                </Button>
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
                {calendarDays.map(({ date, dateStr, isCurrentMonth, isToday, isFuture, stats }) => {
                  const hasData = stats.total > 0 && !isFuture;
                  const colorClass = getCompletionColor(stats.rate, hasData);

                  return (
                    <div
                      key={dateStr}
                      className={cn(
                        'relative aspect-square flex flex-col items-center justify-center rounded-md text-sm transition-colors',
                        !isCurrentMonth && 'opacity-30',
                        isFuture && 'opacity-20',
                        isToday && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                        colorClass
                      )}
                      title={
                        hasData
                          ? `${dateStr}: ${stats.completed}/${stats.total} completed (${stats.rate}%)`
                          : dateStr
                      }
                      data-testid={`calendar-day-${dateStr}`}
                      data-rate={stats.rate}
                    >
                      <span className={cn(
                        'text-sm',
                        isToday && 'font-bold',
                        hasData && stats.rate >= 50 && 'text-white dark:text-white'
                      )}>
                        {date.getDate()}
                      </span>
                      {hasData && (
                        <span className={cn(
                          'text-[10px] leading-none',
                          stats.rate >= 50 ? 'text-white/80' : 'text-muted-foreground'
                        )}>
                          {stats.rate}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Less</span>
                  <div className="flex gap-0.5">
                    <div className="size-4 rounded bg-muted/30 dark:bg-muted/20" title="No data" />
                    <div className="size-4 rounded bg-red-200 dark:bg-red-900/40" title="1-24%" />
                    <div className="size-4 rounded bg-orange-300 dark:bg-orange-700/60" title="25-49%" />
                    <div className="size-4 rounded bg-yellow-300 dark:bg-yellow-700/60" title="50-74%" />
                    <div className="size-4 rounded bg-green-300 dark:bg-green-700/60" title="75-99%" />
                    <div className="size-4 rounded bg-green-500 dark:bg-green-600" title="100%" />
                  </div>
                  <span className="text-xs text-muted-foreground">More</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
