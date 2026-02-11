'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useWeeklyTrends, type WeeklyTrendPoint } from '@/lib/database';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface MonthlySummaryChartProps {
  months?: number;
  title?: string;
  description?: string;
  className?: string;
}

interface MonthDataPoint {
  month: string;
  monthYear: string;
  completions: number;
  totalPossible: number;
  rate: number;
}

function groupWeeksByMonth(trends: WeeklyTrendPoint[]): MonthDataPoint[] {
  const monthMap = new Map<string, { completions: number; totalPossible: number }>();

  for (const week of trends) {
    const date = new Date(week.weekStart);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const monthYear = `${monthName} ${date.getFullYear()}`;

    const existing = monthMap.get(monthKey);
    if (existing) {
      existing.completions += week.completions;
      existing.totalPossible += week.totalPossible;
    } else {
      monthMap.set(monthKey, {
        completions: week.completions,
        totalPossible: week.totalPossible,
      });
    }
  }

  const result: MonthDataPoint[] = [];
  const sortedKeys = Array.from(monthMap.keys()).sort();

  for (const key of sortedKeys) {
    const data = monthMap.get(key)!;
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });

    result.push({
      month: monthName,
      monthYear: `${monthName} ${year}`,
      completions: data.completions,
      totalPossible: data.totalPossible,
      rate: data.totalPossible > 0
        ? Math.round((data.completions / data.totalPossible) * 100)
        : 0,
    });
  }

  return result;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: MonthDataPoint;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-medium">{data.monthYear}</p>
      <p className="text-sm text-muted-foreground">
        Rate: <span className="font-semibold text-primary">{data.rate}%</span>
      </p>
      <p className="text-xs text-muted-foreground">
        {data.completions} / {data.totalPossible} habits completed
      </p>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-48 w-full animate-pulse">
      <div className="flex h-full items-end justify-around gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-muted"
            style={{ height: `${30 + Math.random() * 50}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function getBarColor(rate: number): string {
  // Using oklch colors that provide good contrast in both light and dark modes
  if (rate >= 80) return 'oklch(0.527 0.154 150.069)'; // green-600 - darker green for better contrast
  if (rate >= 60) return 'oklch(0.648 0.150 160.0)'; // green-500 - medium green
  if (rate >= 40) return 'oklch(0.681 0.162 75.834)'; // amber-500 - amber for medium rates
  if (rate >= 20) return 'oklch(0.646 0.222 41.116)'; // orange-500 - orange for lower rates
  return 'hsl(var(--muted))';
}

export function MonthlySummaryChart({
  months = 6,
  title = 'Monthly Summary',
  description = 'Your habit completion rate by month',
  className,
}: MonthlySummaryChartProps) {
  // Get weekly trends for enough weeks to cover the requested months
  const weeksNeeded = months * 5; // Approximately 5 weeks per month
  const { trends, isLoading, error } = useWeeklyTrends(Math.min(weeksNeeded, 52));

  const monthlyData = groupWeeksByMonth(trends).slice(-months);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : error ? (
          <p className="py-8 text-center text-sm text-destructive">
            Error loading data: {error.message}
          </p>
        ) : monthlyData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No data available yet. Start tracking habits to see your monthly summary!
          </p>
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
