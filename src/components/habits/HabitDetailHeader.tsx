'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HabitDocType } from '@/lib/database/types';
import {
  ArrowLeft,
  Edit,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  CalendarRange,
  Calendar,
} from 'lucide-react';
import type { HabitFrequency } from '@/lib/database/types';
import { CATEGORY_ICONS } from '@/lib/constants/habit-display';

interface HabitDetailHeaderProps {
  habit: HabitDocType;
  onEdit: () => void;
}

/**
 * Background colors for category icon based on habit type
 * - positive (build): green
 * - negative (break): red
 * - neutral (track): grey
 */
const TYPE_BG_COLORS = {
  positive: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  negative: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
} as const;

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

const FREQUENCY_CONFIG: Record<HabitFrequency, { label: string; Icon: typeof CalendarDays }> = {
  daily: { label: 'Daily', Icon: CalendarDays },
  weekly: { label: 'Weekly', Icon: CalendarRange },
  monthly: { label: 'Monthly', Icon: Calendar },
};

export function HabitDetailHeader({ habit, onEdit }: HabitDetailHeaderProps) {
  const router = useRouter();
  const isPositive = habit.type === 'positive';
  const frequency = (habit.frequency || 'daily') as HabitFrequency;
  const FrequencyIcon = FREQUENCY_CONFIG[frequency].Icon;
  const CategoryIcon = CATEGORY_ICONS[habit.category];

  return (
    <div className="space-y-4" data-testid="habit-detail-header">
      {/* Back button and actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/habits')}
          data-testid="back-to-habits-button"
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to Habits
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          data-testid="edit-habit-button"
        >
          <Edit className="size-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Habit info */}
      <div className="flex items-start gap-4">
        {/* Category icon with type-based color */}
        <div
          className={cn(
            'size-12 rounded-lg shrink-0 flex items-center justify-center',
            TYPE_BG_COLORS[habit.type || 'neutral']
          )}
          data-testid="habit-category-icon"
          aria-label={`Category: ${CATEGORY_LABELS[habit.category]}`}
        >
          <CategoryIcon className="size-6" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate" data-testid="habit-name">
            {habit.name}
          </h1>
          {habit.description && (
            <p className="mt-1 text-muted-foreground" data-testid="habit-description">
              {habit.description}
            </p>
          )}

          {/* Type and category badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                isPositive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}
              data-testid="habit-type-badge"
            >
              {isPositive ? (
                <TrendingUp className="size-3" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3" aria-hidden="true" />
              )}
              {isPositive ? 'Building' : 'Breaking'}
            </span>

            <span
              className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
              data-testid="habit-category-badge"
            >
              {CATEGORY_LABELS[habit.category]}
            </span>

            <span
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              data-testid="habit-frequency-badge"
            >
              <FrequencyIcon className="size-3" aria-hidden="true" />
              {FREQUENCY_CONFIG[frequency].label}
            </span>

            {habit.isArchived && (
              <span
                className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                data-testid="habit-archived-badge"
              >
                Archived
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
