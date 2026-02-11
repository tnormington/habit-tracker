'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DailyCheckIn } from '@/components/habits';
import { useLevaControls } from '@/lib/hooks';
import { useDashboardStatistics } from '@/lib/database';
import { useActiveStreaks } from '@/lib/database/useStreak';
import { useHabits } from '@/lib/database/useHabits';
import {
  Target,
  TrendingUp,
  Flame,
  CheckCircle2,
  Trophy,
  Sparkles,
  ArrowRight,
  Loader2,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function formatTodayDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  className?: string;
}

function StatCard({ title, value, subtitle, icon, className }: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)} data-testid="stat-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StreakItemProps {
  habitName: string;
  streak: number;
  rank: number;
}

function StreakItem({ habitName, streak, rank }: StreakItemProps) {
  const { streakFlameColor } = useLevaControls();
  const getBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-yellow-950';
    if (rank === 2) return 'bg-gray-500 text-white';
    if (rank === 3) return 'bg-amber-600 text-amber-950';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex size-6 items-center justify-center rounded-full text-xs font-bold',
            getBadgeColor(rank)
          )}
        >
          {rank}
        </div>
        <span className="font-medium">{habitName}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Flame className="size-4" style={{ color: streakFlameColor }} />
        <span className="font-semibold">{streak}</span>
        <span className="text-sm text-muted-foreground">days</span>
      </div>
    </div>
  );
}

function getMotivationalMessage(
  completionRate: number,
  activeStreaks: number,
  bestStreak: number | null
): { message: string; icon: React.ReactNode } {
  if (completionRate === 100) {
    return {
      message: "Perfect day! You've completed all your habits. Keep up the amazing work!",
      icon: <Trophy className="size-5 text-yellow-500" />,
    };
  }
  if (completionRate >= 80) {
    return {
      message: "You're doing great! Just a few more habits to go for a perfect day.",
      icon: <Sparkles className="size-5 text-purple-500" />,
    };
  }
  if (activeStreaks > 0 && bestStreak && bestStreak >= 7) {
    return {
      message: `Impressive! You have a ${bestStreak}-day streak going. Don't break the chain!`,
      icon: <Flame className="size-5 text-orange-500" />,
    };
  }
  if (completionRate >= 50) {
    return {
      message: "Good progress! You're halfway through today's habits. Keep going!",
      icon: <TrendingUp className="size-5 text-green-500" />,
    };
  }
  if (completionRate > 0) {
    return {
      message: "You've made a start! Every habit completed brings you closer to your goals.",
      icon: <CheckCircle2 className="size-5 text-blue-500" />,
    };
  }
  return {
    message: "Ready to build better habits? Start checking off your daily tasks!",
    icon: <Target className="size-5 text-primary" />,
  };
}

export default function DashboardPage() {
  const { streakFlameColor } = useLevaControls();
  const { statistics, isLoading: statsLoading, error: statsError } = useDashboardStatistics();
  const { activeStreaks, isLoading: streaksLoading, error: streaksError } = useActiveStreaks();
  const { habits, isLoading: habitsLoading, error: habitsError } = useHabits({
    filter: { isArchived: false },
  });

  // Create a habit name lookup map
  const habitNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const habit of habits) {
      map.set(habit.id, habit.name);
    }
    return map;
  }, [habits]);

  // Get streaks with habit names
  const streaksWithNames = useMemo(() => {
    return activeStreaks
      .map((s) => ({
        ...s,
        habitName: habitNameMap.get(s.habitId) ?? 'Unknown Habit',
      }))
      .slice(0, 5); // Top 5 streaks
  }, [activeStreaks, habitNameMap]);

  const isLoading = statsLoading || streaksLoading || habitsLoading;
  const hasError = statsError || streaksError || habitsError;

  const motivational = statistics
    ? getMotivationalMessage(
        statistics.todayStats.rate,
        statistics.totalActiveStreaks,
        statistics.bestCurrentStreak?.days ?? null
      )
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="dashboard-loading">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12" data-testid="dashboard-error">
        <p className="text-sm text-muted-foreground">
          Failed to load dashboard data. Try clearing your browser data for this site and refreshing.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">{formatTodayDate()}</p>
      </div>

      {/* Motivational Insight */}
      {motivational && (
        <Card
          className="border-primary/20 bg-primary/5"
          data-testid="motivational-card"
        >
          <CardContent className="flex items-center gap-4">
            <div className="rounded-full bg-background p-3 shadow-sm">
              {motivational.icon}
            </div>
            <p className="text-sm font-medium">{motivational.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="stats-grid">
        <StatCard
          title="Active Habits"
          value={statistics?.activeHabits ?? 0}
          subtitle={`${statistics?.positiveHabits ?? 0} positive, ${statistics?.negativeHabits ?? 0} negative`}
          icon={<Target className="size-5 text-primary" />}
        />
        <StatCard
          title="Today's Progress"
          value={`${statistics?.todayStats.rate ?? 0}%`}
          subtitle={`${statistics?.todayStats.completed ?? 0} of ${statistics?.todayStats.total ?? 0} completed`}
          icon={<CheckCircle2 className="size-5 text-green-500" />}
        />
        <StatCard
          title="Active Streaks"
          value={statistics?.totalActiveStreaks ?? 0}
          subtitle={
            statistics?.bestCurrentStreak
              ? `Best: ${statistics.bestCurrentStreak.days} days`
              : 'Start a streak today!'
          }
          icon={<Flame className="size-5" style={{ color: streakFlameColor }} />}
        />
        <StatCard
          title="Overall Completion"
          value={`${statistics?.overallCompletionRate ?? 0}%`}
          subtitle={`${statistics?.totalCompletions ?? 0} total completions`}
          icon={<Activity className="size-5 text-blue-500" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Check-In */}
        <div className="lg:col-span-2">
          <Card data-testid="today-checkin-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Today's Habits</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/habits" className="flex items-center gap-1">
                  View All
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <DailyCheckIn />
            </CardContent>
          </Card>
        </div>

        {/* Current Streaks */}
        <div>
          <Card data-testid="streaks-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="size-5" style={{ color: streakFlameColor }} />
                Active Streaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {streaksWithNames.length > 0 ? (
                <div className="divide-y">
                  {streaksWithNames.map((streak, index) => (
                    <StreakItem
                      key={streak.habitId}
                      habitName={streak.habitName}
                      streak={streak.streak}
                      rank={index + 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Flame className="mx-auto size-12" style={{ color: streakFlameColor, opacity: 0.3 }} />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No active streaks yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Complete habits consistently to build streaks
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          {statistics && (
            <Card className="mt-4" data-testid="quick-stats-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Completion Rate
                    </span>
                    <span className="font-semibold">
                      {statistics.thisWeekStats.rate}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${statistics.thisWeekStats.rate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span>
                      {statistics.thisWeekStats.completed} /{' '}
                      {statistics.thisWeekStats.total}
                    </span>
                  </div>
                  {statistics.bestDayOfWeek && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Best Day</span>
                      <span className="font-medium">
                        {statistics.bestDayOfWeek.name}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
