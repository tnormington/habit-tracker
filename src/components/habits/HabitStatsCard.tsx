'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHabitStatistics } from '@/lib/database/useStatistics';
import { DAY_NAMES_SHORT, type DayOfWeek } from '@/lib/database/statisticsService';
import {
  Target,
  CheckCircle,
  Calendar,
  TrendingUp,
} from 'lucide-react';

interface HabitStatsCardProps {
  habitId: string;
}

export function HabitStatsCard({ habitId }: HabitStatsCardProps) {
  const { statistics, isLoading, error } = useHabitStatistics(habitId);

  if (isLoading) {
    return (
      <Card data-testid="habit-stats-card-loading">
        <CardHeader>
          <CardTitle className="text-lg">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-20 mb-2" />
                <div className="h-8 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !statistics) {
    return (
      <Card data-testid="habit-stats-card-error">
        <CardHeader>
          <CardTitle className="text-lg">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load statistics
          </p>
        </CardContent>
      </Card>
    );
  }

  // Find best day of week
  const bestDay = Object.entries(statistics.completionsByDayOfWeek).reduce(
    (best, [day, count]) => {
      if (count > best.count) {
        return { day: Number(day) as DayOfWeek, count };
      }
      return best;
    },
    { day: 0 as DayOfWeek, count: 0 }
  );

  return (
    <Card data-testid="habit-stats-card">
      <CardHeader>
        <CardTitle className="text-lg">Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="size-4" />
              Completion Rate
            </div>
            <p className="text-2xl font-bold" data-testid="completion-rate">
              {statistics.completionRate}%
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="size-4" />
              Total Completions
            </div>
            <p className="text-2xl font-bold" data-testid="total-completions">
              {statistics.totalCompletions}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              Days Tracked
            </div>
            <p className="text-2xl font-bold" data-testid="days-tracked">
              {statistics.totalTrackedDays}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="size-4" />
              Best Day
            </div>
            <p className="text-2xl font-bold" data-testid="best-day">
              {bestDay.count > 0 ? DAY_NAMES_SHORT[bestDay.day] : '-'}
            </p>
          </div>
        </div>

        {/* Day of week breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Completions by Day
          </h4>
          <div className="flex gap-1" data-testid="day-breakdown">
            {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => {
              const count = statistics.completionsByDayOfWeek[day];
              const rate = statistics.completionRateByDayOfWeek[day];
              const maxCount = Math.max(...Object.values(statistics.completionsByDayOfWeek));
              const height = maxCount > 0 ? Math.max(10, (count / maxCount) * 100) : 10;

              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-muted rounded-sm relative" style={{ height: '60px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-primary rounded-sm transition-all"
                      style={{ height: `${height}%` }}
                      title={`${count} completions (${rate}%)`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {DAY_NAMES_SHORT[day]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date info */}
        {statistics.firstLogDate && (
          <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Started tracking</span>
              <span className="font-medium text-foreground" data-testid="first-log-date">
                {new Date(statistics.firstLogDate).toLocaleDateString()}
              </span>
            </div>
            {statistics.lastCompletionDate && (
              <div className="flex justify-between">
                <span>Last completion</span>
                <span className="font-medium text-foreground" data-testid="last-completion-date">
                  {new Date(statistics.lastCompletionDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
