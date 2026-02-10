'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStreak, useStreakHistory } from '@/lib/database/useStreak';
import { Flame, Trophy, CalendarDays, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitStreakCardProps {
  habitId: string;
}

export function HabitStreakCard({ habitId }: HabitStreakCardProps) {
  const { streakData, isLoading: streakLoading } = useStreak(habitId);
  const { history, isLoading: historyLoading } = useStreakHistory(habitId);

  const isLoading = streakLoading || historyLoading;

  if (isLoading) {
    return (
      <Card data-testid="habit-streak-card-loading">
        <CardHeader>
          <CardTitle className="text-lg">Streaks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2" />
                <div className="h-10 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;
  const isStreakActive = streakData?.isStreakActive ?? false;
  const streakPeriods = history?.streaks ?? [];

  return (
    <Card data-testid="habit-streak-card">
      <CardHeader>
        <CardTitle className="text-lg">Streaks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main streak display */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className={cn(
              'p-4 rounded-lg border-2',
              isStreakActive && currentStreak > 0
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                : 'border-muted bg-muted/50'
            )}
            data-testid="current-streak-display"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Flame
                className={cn(
                  'size-4',
                  isStreakActive && currentStreak > 0
                    ? 'text-orange-500'
                    : 'text-muted-foreground'
                )}
              />
              Current Streak
            </div>
            <p
              className={cn(
                'text-3xl font-bold',
                isStreakActive && currentStreak > 0
                  ? 'text-orange-600 dark:text-orange-400'
                  : ''
              )}
              data-testid="current-streak-value"
            >
              {currentStreak}
              <span className="text-lg font-normal text-muted-foreground ml-1">
                {currentStreak === 1 ? 'day' : 'days'}
              </span>
            </p>
            {isStreakActive && currentStreak > 0 && (
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
                <Zap className="size-3" />
                Active now
              </p>
            )}
          </div>

          <div className="p-4 rounded-lg border bg-muted/50" data-testid="longest-streak-display">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Trophy className="size-4 text-amber-500" />
              Longest Streak
            </div>
            <p className="text-3xl font-bold" data-testid="longest-streak-value">
              {longestStreak}
              <span className="text-lg font-normal text-muted-foreground ml-1">
                {longestStreak === 1 ? 'day' : 'days'}
              </span>
            </p>
            {streakData?.longestStreakStartDate && streakData?.longestStreakEndDate && (
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(streakData.longestStreakStartDate).toLocaleDateString()} -{' '}
                {new Date(streakData.longestStreakEndDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Streak history */}
        {streakPeriods.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="size-4" />
              Streak History
            </h4>
            <div className="space-y-2" data-testid="streak-history">
              {streakPeriods.slice(0, 5).map((period, index) => (
                <div
                  key={`${period.startDate}-${index}`}
                  className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'size-6 rounded-full flex items-center justify-center text-xs font-medium',
                        index === 0 && period.length === longestStreak
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-secondary text-secondary-foreground'
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm">
                      {new Date(period.startDate).toLocaleDateString()} -{' '}
                      {new Date(period.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="font-medium">
                    {period.length} {period.length === 1 ? 'day' : 'days'}
                  </span>
                </div>
              ))}
              {streakPeriods.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  + {streakPeriods.length - 5} more streak{streakPeriods.length - 5 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {streakPeriods.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No streak history yet. Start completing this habit to build streaks!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
