'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useDashboardStatistics,
  useWeeklyTrends,
  DAY_NAMES_SHORT,
  type DayOfWeek,
} from "@/lib/database";

function StatCard({
  title,
  value,
  description,
  isLoading,
}: {
  title: string;
  value: string | number;
  description?: string;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="-mt-4">
        {isLoading ? (
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DayOfWeekChart({
  completionsByDayOfWeek,
  isLoading,
}: {
  completionsByDayOfWeek: Record<DayOfWeek, number>;
  isLoading?: boolean;
}) {
  const days = [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[];
  const maxCompletions = Math.max(...Object.values(completionsByDayOfWeek), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completions by Day</CardTitle>
        <CardDescription>
          Distribution of habit completions across the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-end justify-around gap-2">
            {days.map((day) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-2">
                <div className="h-20 w-full animate-pulse rounded bg-muted" />
                <span className="text-xs text-muted-foreground">
                  {DAY_NAMES_SHORT[day]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-32 items-end justify-around gap-2">
            {days.map((day) => {
              const count = completionsByDayOfWeek[day] ?? 0;
              const height = (count / maxCompletions) * 100;
              return (
                <div key={day} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded bg-primary transition-all"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${count} completions`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {DAY_NAMES_SHORT[day]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function WeeklyTrendsChart() {
  const { trends, isLoading } = useWeeklyTrends(8);

  const maxRate = Math.max(...trends.map((t) => t.rate), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Trends</CardTitle>
        <CardDescription>
          Your habit completion rate over the past 8 weeks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-end justify-around gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="h-20 w-full animate-pulse rounded bg-muted" />
                <span className="text-xs text-muted-foreground">W{i + 1}</span>
              </div>
            ))}
          </div>
        ) : trends.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No data available yet
          </p>
        ) : (
          <div className="flex h-32 items-end justify-around gap-1">
            {trends.map((week, index) => {
              const height = (week.rate / maxRate) * 100;
              return (
                <div
                  key={week.weekStart}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded bg-green-500 transition-all"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${week.rate}% (${week.completions}/${week.totalPossible})`}
                  />
                  <span className="text-xs text-muted-foreground">
                    W{index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function StatisticsPage() {
  const { statistics, isLoading, error } = useDashboardStatistics();

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Error loading statistics: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Statistics</h1>
      <p className="mt-2 text-muted-foreground">
        View your habit tracking statistics and insights.
      </p>

      {/* Overview Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Completion Rate"
          value={`${statistics?.overallCompletionRate ?? 0}%`}
          description="Overall habit completion"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Completions"
          value={statistics?.totalCompletions ?? 0}
          description="Across all habits"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Streaks"
          value={statistics?.totalActiveStreaks ?? 0}
          description={`${statistics?.combinedActiveStreakDays ?? 0} total days`}
          isLoading={isLoading}
        />
        <StatCard
          title="Active Habits"
          value={statistics?.activeHabits ?? 0}
          description={`${statistics?.positiveHabits ?? 0} positive, ${statistics?.negativeHabits ?? 0} negative`}
          isLoading={isLoading}
        />
      </div>

      {/* Period Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Today"
          value={`${statistics?.todayStats.completed ?? 0}/${statistics?.todayStats.total ?? 0}`}
          description={`${statistics?.todayStats.rate ?? 0}% completion`}
          isLoading={isLoading}
        />
        <StatCard
          title="This Week"
          value={`${statistics?.thisWeekStats.completed ?? 0}/${statistics?.thisWeekStats.total ?? 0}`}
          description={`${statistics?.thisWeekStats.rate ?? 0}% completion`}
          isLoading={isLoading}
        />
        <StatCard
          title="This Month"
          value={`${statistics?.thisMonthStats.completed ?? 0}/${statistics?.thisMonthStats.total ?? 0}`}
          description={`${statistics?.thisMonthStats.rate ?? 0}% completion`}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <DayOfWeekChart
          completionsByDayOfWeek={
            statistics?.completionsByDayOfWeek ?? {
              0: 0,
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
              6: 0,
            }
          }
          isLoading={isLoading}
        />
        <WeeklyTrendsChart />
      </div>

      {/* Streak and Consistency Cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Longest Streaks</CardTitle>
            <CardDescription>Your best habit streaks</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-6 w-full animate-pulse rounded bg-muted" />
                <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
              </div>
            ) : statistics?.bestStreakEver ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {statistics.bestStreakEver.habitName}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {statistics.bestStreakEver.days} days
                  </span>
                </div>
                {statistics.bestCurrentStreak &&
                  statistics.bestCurrentStreak.habitId !==
                    statistics.bestStreakEver.habitId && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Current best: {statistics.bestCurrentStreak.habitName}</span>
                      <span>{statistics.bestCurrentStreak.days} days</span>
                    </div>
                  )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No streaks recorded yet. Start completing habits to build your streaks!
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Consistent</CardTitle>
            <CardDescription>Your most reliable habits</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-6 w-full animate-pulse rounded bg-muted" />
              </div>
            ) : statistics?.mostConsistentHabit ? (
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {statistics.mostConsistentHabit.habitName}
                </span>
                <span className="text-lg font-bold text-green-600">
                  {statistics.mostConsistentHabit.rate}%
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Track habits for at least 7 days to see consistency stats.
              </p>
            )}
            {statistics?.bestDayOfWeek && statistics.bestDayOfWeek.completions > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Best day:{" "}
                  <span className="font-medium text-foreground">
                    {statistics.bestDayOfWeek.name}
                  </span>{" "}
                  ({statistics.bestDayOfWeek.completions} completions)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
