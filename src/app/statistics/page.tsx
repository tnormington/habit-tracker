'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  usePeriodStatistics,
  useDashboardStatistics,
  DAY_NAMES,
  type StatisticsPeriod,
} from '@/lib/database';
import {
  CompletionTrendsChart,
  WeeklySummaryChart,
  MonthlySummaryChart,
  CategoryDistributionChart,
} from '@/components/charts';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Flame,
  Calendar,
  Award,
  AlertCircle,
  Sparkles,
  Loader2,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Period labels
const PERIOD_LABELS: Record<StatisticsPeriod, string> = {
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  all: 'All Time',
};

function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  isLoading,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}) {
  return (
    <Card data-testid="stat-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className="-mt-4">
        {isLoading ? (
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {trend === 'up' && (
              <TrendingUp className="size-4 text-green-500" />
            )}
            {trend === 'down' && (
              <TrendingDown className="size-4 text-red-500" />
            )}
          </div>
        )}
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function BestPerformingHabits({
  habits,
  isLoading,
}: {
  habits: Array<{
    habitId: string;
    habitName: string;
    completionRate: number;
    totalCompletions: number;
    totalTracked: number;
  }>;
  isLoading?: boolean;
}) {
  return (
    <Card data-testid="best-habits-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="size-5 text-yellow-500" />
          Top Performers
        </CardTitle>
        <CardDescription>Your most consistent habits</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No habits tracked yet in this period
          </p>
        ) : (
          <div className="space-y-3">
            {habits.map((habit, index) => (
              <div
                key={habit.habitId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full text-sm font-bold',
                      index === 0
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        : index === 1
                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        : index === 2
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{habit.habitName}</p>
                    <p className="text-xs text-muted-foreground">
                      {habit.totalCompletions} / {habit.totalTracked} completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {habit.completionRate}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NeedsImprovementHabits({
  habits,
  isLoading,
}: {
  habits: Array<{
    habitId: string;
    habitName: string;
    completionRate: number;
    totalCompletions: number;
    totalTracked: number;
  }>;
  isLoading?: boolean;
}) {
  // Only show habits with rate < 50%
  const lowPerformers = habits.filter((h) => h.completionRate < 50);

  if (lowPerformers.length === 0 && !isLoading) {
    return (
      <Card data-testid="needs-improvement-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-purple-500" />
            All Habits Doing Well!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Great job! All your habits have a completion rate above 50%.
            Keep up the excellent work!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="needs-improvement-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="size-5 text-orange-500" />
          Room for Improvement
        </CardTitle>
        <CardDescription>
          Focus on these habits to boost your overall progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {lowPerformers.slice(0, 5).map((habit) => (
              <div
                key={habit.habitId}
                className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950"
              >
                <div>
                  <p className="font-medium">{habit.habitName}</p>
                  <p className="text-xs text-muted-foreground">
                    {habit.totalCompletions} / {habit.totalTracked} completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {habit.completionRate}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MotivationalInsights({
  statistics,
  dashboardStats,
  isLoading,
}: {
  statistics: {
    completionRate: number;
    totalActiveDays: number;
    avgDailyCompletionRate: number;
    bestPerformingHabits: Array<{ habitName: string; completionRate: number }>;
  } | null;
  dashboardStats: {
    totalActiveStreaks: number;
    bestCurrentStreak: { habitName: string; days: number } | null;
    bestStreakEver: { habitName: string; days: number } | null;
    bestDayOfWeek: { name: string; completions: number } | null;
  } | null;
  isLoading?: boolean;
}) {
  const insights = useMemo(() => {
    if (!statistics && !dashboardStats) return [];

    const items: Array<{
      icon: React.ReactNode;
      title: string;
      message: string;
      type: 'success' | 'info' | 'warning';
    }> = [];

    // Completion rate insight
    if (statistics) {
      if (statistics.completionRate >= 80) {
        items.push({
          icon: <Trophy className="size-5 text-yellow-500" />,
          title: 'Outstanding Performance!',
          message: `You're completing ${statistics.completionRate}% of your habits. Keep up this exceptional work!`,
          type: 'success',
        });
      } else if (statistics.completionRate >= 50) {
        items.push({
          icon: <TrendingUp className="size-5 text-green-500" />,
          title: 'Good Progress',
          message: `You're at ${statistics.completionRate}% completion. You're on the right track!`,
          type: 'info',
        });
      } else if (statistics.completionRate > 0) {
        items.push({
          icon: <Target className="size-5 text-orange-500" />,
          title: 'Room to Grow',
          message: `At ${statistics.completionRate}% completion, focus on building consistency one habit at a time.`,
          type: 'warning',
        });
      }

      // Active days insight
      if (statistics.totalActiveDays > 0) {
        items.push({
          icon: <Calendar className="size-5 text-blue-500" />,
          title: 'Consistency Check',
          message: `You've been active for ${statistics.totalActiveDays} days in this period with an average of ${statistics.avgDailyCompletionRate}% daily completion.`,
          type: 'info',
        });
      }

      // Best habit insight
      if (statistics.bestPerformingHabits.length > 0) {
        const best = statistics.bestPerformingHabits[0];
        if (best.completionRate >= 80) {
          items.push({
            icon: <Award className="size-5 text-purple-500" />,
            title: 'Star Habit',
            message: `"${best.habitName}" is your most consistent habit at ${best.completionRate}%!`,
            type: 'success',
          });
        }
      }
    }

    // Streak insights
    if (dashboardStats) {
      if (dashboardStats.bestCurrentStreak && dashboardStats.bestCurrentStreak.days >= 7) {
        items.push({
          icon: <Flame className="size-5 text-orange-500" />,
          title: 'Streak On Fire!',
          message: `Amazing! "${dashboardStats.bestCurrentStreak.habitName}" has a ${dashboardStats.bestCurrentStreak.days}-day streak!`,
          type: 'success',
        });
      }

      if (dashboardStats.totalActiveStreaks >= 3) {
        items.push({
          icon: <Sparkles className="size-5 text-indigo-500" />,
          title: 'Multiple Streaks',
          message: `You have ${dashboardStats.totalActiveStreaks} active streaks going. Great momentum!`,
          type: 'success',
        });
      }

      // Best day insight
      if (dashboardStats.bestDayOfWeek && dashboardStats.bestDayOfWeek.completions > 0) {
        items.push({
          icon: <CheckCircle2 className="size-5 text-green-500" />,
          title: 'Peak Performance Day',
          message: `${dashboardStats.bestDayOfWeek.name} is your strongest day with ${dashboardStats.bestDayOfWeek.completions} completions overall.`,
          type: 'info',
        });
      }
    }

    return items;
  }, [statistics, dashboardStats]);

  return (
    <Card data-testid="motivational-insights-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-purple-500" />
          Insights & Motivation
        </CardTitle>
        <CardDescription>
          Personalized insights based on your habit data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Start tracking habits to unlock personalized insights!
          </p>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3',
                  insight.type === 'success' &&
                    'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950',
                  insight.type === 'info' &&
                    'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',
                  insight.type === 'warning' &&
                    'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950'
                )}
              >
                <div className="mt-0.5">{insight.icon}</div>
                <div>
                  <p className="font-medium">{insight.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {insight.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function StatisticsPage() {
  const [period, setPeriod] = useState<StatisticsPeriod>('month');
  const { statistics: periodStats, isLoading: periodLoading, error: periodError } = usePeriodStatistics(period);
  const { statistics: dashboardStats, isLoading: dashboardLoading, error: dashboardError } = useDashboardStatistics();

  const isLoading = periodLoading || dashboardLoading;
  const error = periodError || dashboardError;

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4" data-testid="statistics-error">
        <p className="text-sm text-destructive">
          Error loading statistics: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="statistics-page">
      {/* Header with Period Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Statistics</h1>
          <p className="mt-1 text-muted-foreground">
            Track your progress and discover patterns in your habits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as StatisticsPeriod)}
          >
            <SelectTrigger className="w-[140px]" data-testid="period-selector">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !periodStats && !dashboardStats && (
        <div className="flex items-center justify-center py-12" data-testid="statistics-loading">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Overview Stats - Period Based */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="overview-stats">
        <StatCard
          title="Completion Rate"
          value={`${periodStats?.completionRate ?? 0}%`}
          description={`${PERIOD_LABELS[period]} average`}
          icon={<Activity className="size-5" />}
          isLoading={periodLoading}
        />
        <StatCard
          title="Total Completions"
          value={periodStats?.totalCompletions ?? 0}
          description={`Out of ${periodStats?.totalPossible ?? 0} tracked`}
          icon={<CheckCircle2 className="size-5" />}
          isLoading={periodLoading}
        />
        <StatCard
          title="Active Days"
          value={periodStats?.totalActiveDays ?? 0}
          description="Days with activity"
          icon={<Calendar className="size-5" />}
          isLoading={periodLoading}
        />
        <StatCard
          title="Active Streaks"
          value={dashboardStats?.totalActiveStreaks ?? 0}
          description={
            dashboardStats?.bestCurrentStreak
              ? `Best: ${dashboardStats.bestCurrentStreak.days} days`
              : 'Start a streak today!'
          }
          icon={<Flame className="size-5 text-orange-500" />}
          isLoading={dashboardLoading}
        />
      </div>

      {/* Period Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Today"
          value={`${dashboardStats?.todayStats.completed ?? 0}/${dashboardStats?.todayStats.total ?? 0}`}
          description={`${dashboardStats?.todayStats.rate ?? 0}% completion`}
          isLoading={dashboardLoading}
        />
        <StatCard
          title="This Week"
          value={`${dashboardStats?.thisWeekStats.completed ?? 0}/${dashboardStats?.thisWeekStats.total ?? 0}`}
          description={`${dashboardStats?.thisWeekStats.rate ?? 0}% completion`}
          isLoading={dashboardLoading}
        />
        <StatCard
          title="This Month"
          value={`${dashboardStats?.thisMonthStats.completed ?? 0}/${dashboardStats?.thisMonthStats.total ?? 0}`}
          description={`${dashboardStats?.thisMonthStats.rate ?? 0}% completion`}
          isLoading={dashboardLoading}
        />
      </div>

      {/* Completion Trends Chart - Full Width */}
      <div>
        <CompletionTrendsChart
          weeks={12}
          title="Completion Trends"
          description="Your habit completion rate over the past 12 weeks"
        />
      </div>

      {/* Charts Row - Weekly and Monthly */}
      <div className="grid gap-4 md:grid-cols-2">
        <WeeklySummaryChart
          title="Completions by Day"
          description="Distribution of habit completions across the week"
        />
        <MonthlySummaryChart
          months={6}
          title="Monthly Summary"
          description="Your habit completion rate by month"
        />
      </div>

      {/* Best and Needs Improvement Habits */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BestPerformingHabits
          habits={periodStats?.bestPerformingHabits ?? []}
          isLoading={periodLoading}
        />
        <NeedsImprovementHabits
          habits={periodStats?.needsImprovementHabits ?? []}
          isLoading={periodLoading}
        />
      </div>

      {/* Category Distribution and Completion Rate */}
      <div className="grid gap-4 md:grid-cols-2">
        <CategoryDistributionChart
          title="Habits by Category"
          description="Distribution of your habits across categories"
        />
        <WeeklySummaryChart
          title="Completion Rate by Day"
          description="Average completion rate for each day of the week"
          showCompletionRate={true}
        />
      </div>

      {/* Motivational Insights */}
      <MotivationalInsights
        statistics={periodStats ? {
          completionRate: periodStats.completionRate,
          totalActiveDays: periodStats.totalActiveDays,
          avgDailyCompletionRate: periodStats.avgDailyCompletionRate,
          bestPerformingHabits: periodStats.bestPerformingHabits,
        } : null}
        dashboardStats={dashboardStats ? {
          totalActiveStreaks: dashboardStats.totalActiveStreaks,
          bestCurrentStreak: dashboardStats.bestCurrentStreak,
          bestStreakEver: dashboardStats.bestStreakEver,
          bestDayOfWeek: dashboardStats.bestDayOfWeek,
        } : null}
        isLoading={isLoading}
      />

      {/* Streak and Consistency Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="streak-records-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="size-5 text-orange-500" />
              Streak Records
            </CardTitle>
            <CardDescription>Your best habit streaks</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="space-y-3">
                <div className="h-12 animate-pulse rounded bg-muted" />
                <div className="h-12 animate-pulse rounded bg-muted" />
              </div>
            ) : dashboardStats?.bestStreakEver ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
                  <div className="flex items-center gap-3">
                    <Trophy className="size-8 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        All-Time Best
                      </p>
                      <p className="font-medium">
                        {dashboardStats.bestStreakEver.habitName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {dashboardStats.bestStreakEver.days}
                    </p>
                    <p className="text-xs text-muted-foreground">days</p>
                  </div>
                </div>
                {dashboardStats.bestCurrentStreak &&
                  dashboardStats.bestCurrentStreak.habitId !==
                    dashboardStats.bestStreakEver.habitId && (
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Flame className="size-6 text-orange-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Current Best
                          </p>
                          <p className="font-medium">
                            {dashboardStats.bestCurrentStreak.habitName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {dashboardStats.bestCurrentStreak.days}
                        </p>
                        <p className="text-xs text-muted-foreground">days</p>
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No streaks recorded yet. Start completing habits to build your streaks!
              </p>
            )}
          </CardContent>
        </Card>

        <Card data-testid="consistency-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5 text-purple-500" />
              Consistency Champion
            </CardTitle>
            <CardDescription>Your most reliable habit</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="h-20 animate-pulse rounded bg-muted" />
            ) : dashboardStats?.mostConsistentHabit ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-800">
                      <Award className="size-6 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {dashboardStats.mostConsistentHabit.habitName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Most consistent (7+ days tracked)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {dashboardStats.mostConsistentHabit.rate}%
                    </p>
                    <p className="text-xs text-muted-foreground">completion</p>
                  </div>
                </div>
                {dashboardStats.bestDayOfWeek && dashboardStats.bestDayOfWeek.completions > 0 && (
                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">
                      Best day:{' '}
                      <span className="font-medium text-foreground">
                        {dashboardStats.bestDayOfWeek.name}
                      </span>{' '}
                      ({dashboardStats.bestDayOfWeek.completions} completions)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Track habits for at least 7 days to see your most consistent habit.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
