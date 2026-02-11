'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useHabits } from '@/lib/database/useHabits';
import { useHabitLogs, useHabitLogsForDate } from '@/lib/database/useHabitLogs';
import type { HabitDocType, HabitFrequency, HabitLogDocType } from '@/lib/database/types';
import { TrendingUp, TrendingDown, Loader2, Calendar } from 'lucide-react';

const COLOR_CLASSES: Record<HabitDocType['color'], string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  gray: 'bg-gray-500',
};

const CATEGORY_LABELS: Record<HabitDocType['category'], string> = {
  health: 'Health',
  fitness: 'Fitness',
  productivity: 'Productivity',
  mindfulness: 'Mindfulness',
  learning: 'Learning',
  social: 'Social',
  finance: 'Finance',
  creativity: 'Creativity',
  other: 'Other',
};

/** Get today's date in YYYY-MM-DD format */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/** Get start of current week (Monday) in YYYY-MM-DD format */
function getStartOfWeek(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().split('T')[0];
}

/** Get start of current month in YYYY-MM-DD format */
function getStartOfMonth(dateStr: string): string {
  return dateStr.substring(0, 7) + '-01';
}

/** Get end of current week (Sunday) in YYYY-MM-DD format */
function getEndOfWeek(dateStr: string): string {
  const startOfWeek = new Date(getStartOfWeek(dateStr));
  const sunday = new Date(startOfWeek);
  sunday.setDate(sunday.getDate() + 6);
  return sunday.toISOString().split('T')[0];
}

/** Get end of current month in YYYY-MM-DD format */
function getEndOfMonth(dateStr: string): string {
  const date = new Date(dateStr);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDay.toISOString().split('T')[0];
}

/** Get period date range based on frequency */
function getPeriodDateRange(dateStr: string, frequency: HabitFrequency): { startDate: string; endDate: string } {
  switch (frequency) {
    case 'weekly':
      return { startDate: getStartOfWeek(dateStr), endDate: getEndOfWeek(dateStr) };
    case 'monthly':
      return { startDate: getStartOfMonth(dateStr), endDate: getEndOfMonth(dateStr) };
    default:
      return { startDate: dateStr, endDate: dateStr };
  }
}

interface HabitCheckInItemProps {
  habit: HabitDocType;
  isCompleted: boolean;
  periodProgress?: { current: number; target: number };
  onToggle: (habitId: string) => void;
}

function HabitCheckInItem({ habit, isCompleted, periodProgress, onToggle }: HabitCheckInItemProps) {
  const showPeriodProgress = periodProgress && habit.frequency !== 'daily';
  const periodReached = periodProgress && periodProgress.current >= periodProgress.target;

  return (
    <div
      className={cn(
        'relative flex items-center gap-4 rounded-lg border p-4 transition-colors',
        isCompleted && 'bg-muted/50',
        periodReached && 'border-green-300 dark:border-green-700'
      )}
      data-testid="habit-checkin-item"
      data-habit-id={habit.id}
    >

      {/* Checkbox */}
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onToggle(habit.id)}
        aria-label={`Mark ${habit.name} as ${isCompleted ? 'incomplete' : 'complete'}`}
        data-testid="habit-checkbox"
      />

      {/* Habit info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'font-medium',
              isCompleted && 'text-muted-foreground line-through'
            )}
          >
            {habit.name}
          </span>
          <span
            className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
          >
            {CATEGORY_LABELS[habit.category]}
          </span>
          {showPeriodProgress && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                periodReached
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              )}
              data-testid="period-progress"
            >
              <Calendar className="size-3" />
              {periodProgress.current}/{periodProgress.target} this {habit.frequency === 'weekly' ? 'week' : 'month'}
            </span>
          )}
        </div>
        {habit.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
            {habit.description}
          </p>
        )}
      </div>
    </div>
  );
}

interface HabitGroupProps {
  type: 'positive' | 'negative';
  habits: HabitDocType[];
  completedHabitIds: Set<string>;
  periodProgressMap: Map<string, { current: number; target: number }>;
  onToggle: (habitId: string) => void;
}

function HabitGroup({ type, habits, completedHabitIds, periodProgressMap, onToggle }: HabitGroupProps) {
  const isPositive = type === 'positive';
  const completedCount = habits.filter(h => completedHabitIds.has(h.id)).length;

  return (
    <Card
      className={cn(
        'pt-0',
        'overflow-hidden',
        isPositive ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'
      )}
      data-testid={`habit-group-${type}`}
    >
      <CardHeader
        className={cn(
          'pt-3',
          'pb-3',
          isPositive
            ? 'bg-green-50 dark:bg-green-950/30'
            : 'bg-red-50 dark:bg-red-950/30'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="size-5 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="size-5 text-red-600 dark:text-red-400" />
            )}
            <CardTitle className="text-lg">
              {isPositive ? 'Habits to Build' : 'Habits to Break'}
            </CardTitle>
          </div>
          <span
            className={cn(
              'text-sm font-medium',
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}
            data-testid={`${type}-progress`}
          >
            {completedCount}/{habits.length} {isPositive ? 'completed' : 'avoided'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {habits.map(habit => (
            <HabitCheckInItem
              key={habit.id}
              habit={habit}
              isCompleted={completedHabitIds.has(habit.id)}
              periodProgress={periodProgressMap.get(habit.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface DailyCheckInProps {
  date?: string; // YYYY-MM-DD format, defaults to today
}

export function DailyCheckIn({ date }: DailyCheckInProps) {
  const today = date ?? getTodayDate();

  // Calculate period date ranges for weekly and monthly habits
  const weeklyRange = useMemo(() => getPeriodDateRange(today, 'weekly'), [today]);
  const monthlyRange = useMemo(() => getPeriodDateRange(today, 'monthly'), [today]);

  // Fetch all active habits
  const { habits, isLoading: habitsLoading, error: habitsError } = useHabits({
    filter: { isArchived: false },
    sort: { field: 'name', direction: 'asc' },
  });

  // Fetch today's logs and get the toggleCompletion function
  const { completedHabitIds, logs: todayLogs, isLoading: logsLoading } = useHabitLogsForDate(today);
  const { toggleCompletion } = useHabitLogs();

  // Fetch logs for the current week (for weekly habits)
  const { logs: weeklyLogs, isLoading: weeklyLogsLoading } = useHabitLogs({
    filter: { startDate: weeklyRange.startDate, endDate: weeklyRange.endDate },
  });

  // Fetch logs for the current month (for monthly habits)
  const { logs: monthlyLogs, isLoading: monthlyLogsLoading } = useHabitLogs({
    filter: { startDate: monthlyRange.startDate, endDate: monthlyRange.endDate },
  });

  // Calculate period progress for each habit
  const periodProgressMap = useMemo(() => {
    const progressMap = new Map<string, { current: number; target: number }>();

    for (const habit of habits) {
      if (habit.frequency === 'daily') continue;

      const targetCount = habit.targetCount || 1;
      let logs: HabitLogDocType[];

      if (habit.frequency === 'weekly') {
        logs = weeklyLogs.filter(l => l.habitId === habit.id);
      } else {
        logs = monthlyLogs.filter(l => l.habitId === habit.id);
      }

      // Count completions (positive: completed=true is success, negative: completed=false is success)
      const completions = logs.filter(l => {
        if (habit.type === 'positive' || habit.type === 'neutral') {
          return l.completed;
        }
        return !l.completed;
      }).length;

      progressMap.set(habit.id, { current: completions, target: targetCount });
    }

    return progressMap;
  }, [habits, weeklyLogs, monthlyLogs]);

  // Group habits by type
  const { positiveHabits, negativeHabits } = useMemo(() => {
    const positive: HabitDocType[] = [];
    const negative: HabitDocType[] = [];

    for (const habit of habits) {
      if (habit.type === 'positive' || habit.type === 'neutral') {
        positive.push(habit);
      } else {
        negative.push(habit);
      }
    }

    return { positiveHabits: positive, negativeHabits: negative };
  }, [habits]);

  // Calculate overall progress
  // For positive/neutral habits: success = completed (checked)
  // For negative habits: success = avoided (not completed / unchecked)
  const totalHabits = habits.length;
  const todayLogMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const log of todayLogs) {
      map.set(log.habitId, log.completed);
    }
    return map;
  }, [todayLogs]);

  const successCount = useMemo(() => {
    return habits.filter(habit => {
      const hasLog = todayLogMap.has(habit.id);
      const isCompleted = todayLogMap.get(habit.id) ?? false;

      if (habit.type === 'positive' || habit.type === 'neutral') {
        // For positive/neutral habits: success when completed (checked)
        return isCompleted;
      } else {
        // For negative habits: success when avoided (has log with completed=false)
        return hasLog && !isCompleted;
      }
    }).length;
  }, [habits, todayLogMap]);

  const progressPercentage = Math.round((successCount / totalHabits) * 100) || 0;

  // Handle toggle with auto-save
  const handleToggle = async (habitId: string) => {
    try {
      await toggleCompletion(habitId, today);
    } catch (error) {
      console.error('Failed to toggle habit completion:', error);
    }
  };

  // Loading state
  const isLoading = habitsLoading || logsLoading || weeklyLogsLoading || monthlyLogsLoading;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-state">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (habitsError) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive" data-testid="error-state">
        <p>Failed to load habits: {habitsError.message}</p>
      </div>
    );
  }

  // Empty state - no habits created yet
  if (habits.length === 0) {
    return (
      <Card className="p-8 text-center" data-testid="empty-state">
        <p className="text-muted-foreground">
          No active habits yet. Create some habits to start tracking!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="daily-checkin">
      {/* Progress summary */}
      <Card data-testid="progress-summary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Today's Progress</span>
            <span className="text-sm text-muted-foreground">
              {successCount} of {totalHabits} habits
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
              data-testid="progress-bar"
            />
          </div>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {progressPercentage}% complete
          </p>
        </CardContent>
      </Card>

      {/* Habit groups */}
      {positiveHabits.length > 0 && (
        <HabitGroup
          type="positive"
          habits={positiveHabits}
          completedHabitIds={completedHabitIds}
          periodProgressMap={periodProgressMap}
          onToggle={handleToggle}
        />
      )}

      {negativeHabits.length > 0 && (
        <HabitGroup
          type="negative"
          habits={negativeHabits}
          completedHabitIds={completedHabitIds}
          periodProgressMap={periodProgressMap}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
}
