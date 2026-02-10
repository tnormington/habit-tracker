'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useDashboardStatistics, type HabitCategory } from '@/lib/database';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryDistributionChartProps {
  title?: string;
  description?: string;
  showLegend?: boolean;
  className?: string;
}

interface CategoryDataPoint {
  name: string;
  value: number;
  category: HabitCategory;
  color: string;
}

// Category display names and colors
const CATEGORY_CONFIG: Record<HabitCategory, { label: string; color: string }> = {
  health: { label: 'Health', color: 'hsl(142.1 76.2% 36.3%)' }, // green
  fitness: { label: 'Fitness', color: 'hsl(217.2 91.2% 59.8%)' }, // blue
  productivity: { label: 'Productivity', color: 'hsl(262.1 83.3% 57.8%)' }, // purple
  mindfulness: { label: 'Mindfulness', color: 'hsl(199.4 95.5% 53.8%)' }, // cyan
  learning: { label: 'Learning', color: 'hsl(43.3 96.4% 56.3%)' }, // yellow
  social: { label: 'Social', color: 'hsl(330.4 81.2% 60.4%)' }, // pink
  finance: { label: 'Finance', color: 'hsl(24.6 95% 53.1%)' }, // orange
  creativity: { label: 'Creativity', color: 'hsl(280.4 72.3% 62.4%)' }, // violet
  other: { label: 'Other', color: 'hsl(var(--muted-foreground))' }, // gray
};

function transformCategoryData(
  habitsByCategory: Record<HabitCategory, number>
): CategoryDataPoint[] {
  const categories = Object.keys(habitsByCategory) as HabitCategory[];

  return categories
    .filter((category) => habitsByCategory[category] > 0)
    .map((category) => ({
      name: CATEGORY_CONFIG[category].label,
      value: habitsByCategory[category],
      category,
      color: CATEGORY_CONFIG[category].color,
    }))
    .sort((a, b) => b.value - a.value);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: CategoryDataPoint;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <p className="text-sm font-medium">{data.name}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        {data.value} habit{data.value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

interface CustomLegendProps {
  payload?: Array<{
    value: string;
    color: string;
    payload: {
      value: number;
    };
  }>;
  totalHabits: number;
}

function CustomLegend({ payload, totalHabits }: CustomLegendProps) {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
      {payload.map((entry, index) => {
        const percentage =
          totalHabits > 0
            ? Math.round((entry.payload.value / totalHabits) * 100)
            : 0;
        return (
          <div key={index} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-muted-foreground">
              {entry.value} ({percentage}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-40 w-40 animate-pulse rounded-full bg-muted" />
    </div>
  );
}

export function CategoryDistributionChart({
  title = 'Habits by Category',
  description = 'Distribution of your habits across categories',
  showLegend = true,
  className,
}: CategoryDistributionChartProps) {
  const { statistics, isLoading, error } = useDashboardStatistics();

  const chartData = transformCategoryData(
    statistics?.habitsByCategory ?? {
      health: 0,
      fitness: 0,
      productivity: 0,
      mindfulness: 0,
      learning: 0,
      social: 0,
      finance: 0,
      creativity: 0,
      other: 0,
    }
  );

  const totalHabits = chartData.reduce((sum, d) => sum + d.value, 0);

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
        ) : chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No habits created yet. Create some habits to see their distribution!
          </p>
        ) : (
          <div className="relative h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {showLegend && (
                  <Legend
                    content={<CustomLegend totalHabits={totalHabits} />}
                    verticalAlign="bottom"
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="pointer-events-none absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2">
              <div className="text-center">
                <p className="text-2xl font-bold">{totalHabits}</p>
                <p className="text-xs text-muted-foreground">
                  habit{totalHabits !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
