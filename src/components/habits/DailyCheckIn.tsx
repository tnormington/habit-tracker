'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useHabits } from '@/lib/database/useHabits';
import { useHabitLogs, useHabitLogsForDate } from '@/lib/database/useHabitLogs';
import type { HabitDocType } from '@/lib/database/types';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

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

interface HabitCheckInItemProps {
  habit: HabitDocType;
  isCompleted: boolean;
  onToggle: (habitId: string) => void;
}

function HabitCheckInItem({ habit, isCompleted, onToggle }: HabitCheckInItemProps) {
  return (
    <div
      className={cn(
        'relative flex items-center gap-4 rounded-lg border p-4 transition-colors',
        isCompleted && 'bg-muted/50'
      )}
      data-testid="habit-checkin-item"
      data-habit-id={habit.id}
    >
      {/* Color indicator */}
      <div
        className={cn('h-10 w-1 rounded-full', COLOR_CLASSES[habit.color])}
        aria-hidden="true"
      />

      {/* Checkbox */}
      <Checkbox
        checked={isCompleted}
        onCheckedChange={() => onToggle(habit.id)}
        aria-label={`Mark ${habit.name} as ${isCompleted ? 'incomplete' : 'complete'}`}
        data-testid="habit-checkbox"
      />

      {/* Habit info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
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
  onToggle: (habitId: string) => void;
}

function HabitGroup({ type, habits, completedHabitIds, onToggle }: HabitGroupProps) {
  const isPositive = type === 'positive';
  const completedCount = habits.filter(h => completedHabitIds.has(h.id)).length;

  return (
    <Card
      className={cn(
        'overflow-hidden',
        isPositive ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'
      )}
      data-testid={`habit-group-${type}`}
    >
      <CardHeader
        className={cn(
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

  // Fetch all active habits
  const { habits, isLoading: habitsLoading, error: habitsError } = useHabits({
    filter: { isArchived: false },
    sort: { field: 'name', direction: 'asc' },
  });

  // Fetch today's logs and get the toggleCompletion function
  const { completedHabitIds, isLoading: logsLoading } = useHabitLogsForDate(today);
  const { toggleCompletion } = useHabitLogs();

  // Group habits by type
  const { positiveHabits, negativeHabits } = useMemo(() => {
    const positive: HabitDocType[] = [];
    const negative: HabitDocType[] = [];

    for (const habit of habits) {
      if (habit.type === 'positive') {
        positive.push(habit);
      } else {
        negative.push(habit);
      }
    }

    return { positiveHabits: positive, negativeHabits: negative };
  }, [habits]);

  // Handle toggle with auto-save
  const handleToggle = async (habitId: string) => {
    try {
      await toggleCompletion(habitId, today);
    } catch (error) {
      console.error('Failed to toggle habit completion:', error);
    }
  };

  // Loading state
  if (habitsLoading || logsLoading) {
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

  // Calculate overall progress
  const totalHabits = habits.length;
  const completedCount = habits.filter(h => completedHabitIds.has(h.id)).length;
  const progressPercentage = Math.round((completedCount / totalHabits) * 100);

  return (
    <div className="space-y-6" data-testid="daily-checkin">
      {/* Progress summary */}
      <Card data-testid="progress-summary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Today's Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedCount} of {totalHabits} habits
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
          onToggle={handleToggle}
        />
      )}

      {negativeHabits.length > 0 && (
        <HabitGroup
          type="negative"
          habits={negativeHabits}
          completedHabitIds={completedHabitIds}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
}
