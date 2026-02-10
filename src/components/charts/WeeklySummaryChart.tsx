'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  useDashboardStatistics,
  DAY_NAMES_SHORT,
  type DayOfWeek,
} from '@/lib/database';
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

interface WeeklySummaryChartProps {
  title?: string;
  description?: string;
  showCompletionRate?: boolean;
  className?: string;
}

interface ChartDataPoint {
  day: string;
  dayIndex: DayOfWeek;
  completions: number;
  rate: number;
}

function transformDayOfWeekData(
  completionsByDayOfWeek: Record<DayOfWeek, number>,
  rateByDayOfWeek: Record<DayOfWeek, number>
): ChartDataPoint[] {
  const days = [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[];
  return days.map((dayIndex) => ({
    day: DAY_NAMES_SHORT[dayIndex],
    dayIndex,
    completions: completionsByDayOfWeek[dayIndex] ?? 0,
    rate: rateByDayOfWeek[dayIndex] ?? 0,
  }));
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataPoint;
  }>;
  showRate?: boolean;
}

function CustomTooltip({ active, payload, showRate }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="text-sm font-medium">{data.day}</p>
      {showRate ? (
        <p className="text-sm text-muted-foreground">
          Rate: <span className="font-semibold text-primary">{data.rate}%</span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Completions:{' '}
          <span className="font-semibold text-primary">{data.completions}</span>
        </p>
      )}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-48 w-full animate-pulse">
      <div className="flex h-full items-end justify-around gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
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

// Color scale from light to dark based on value intensity
function getBarColor(value: number, maxValue: number): string {
  if (maxValue === 0) return 'hsl(var(--muted))';
  const intensity = value / maxValue;
  // Using primary color with varying opacity effect through different hues
  if (intensity > 0.75) return 'hsl(var(--primary))';
  if (intensity > 0.5) return 'hsl(var(--primary) / 0.8)';
  if (intensity > 0.25) return 'hsl(var(--primary) / 0.6)';
  return 'hsl(var(--primary) / 0.4)';
}

export function WeeklySummaryChart({
  title = 'Completions by Day',
  description = 'Your habit completions distributed across the week',
  showCompletionRate = false,
  className,
}: WeeklySummaryChartProps) {
  const { statistics, isLoading, error } = useDashboardStatistics();

  const chartData = transformDayOfWeekData(
    statistics?.completionsByDayOfWeek ?? { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    statistics?.avgCompletionRateByDayOfWeek ?? { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  );

  const dataKey = showCompletionRate ? 'rate' : 'completions';
  const maxValue = Math.max(...chartData.map((d) => d[dataKey]), 1);

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
        ) : (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={showCompletionRate ? (value) => `${value}%` : undefined}
                  className="text-muted-foreground"
                  width={showCompletionRate ? 45 : 35}
                />
                <Tooltip content={<CustomTooltip showRate={showCompletionRate} />} />
                <Bar
                  dataKey={dataKey}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry[dataKey], maxValue)}
                    />
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
