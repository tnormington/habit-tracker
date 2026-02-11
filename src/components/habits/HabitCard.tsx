'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HabitDocType } from '@/lib/database/types';
import {
  MoreHorizontal,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  CATEGORY_ICONS,
  FREQUENCY_ICONS,
} from '@/lib/constants/habit-display';

interface HabitCardProps {
  habit: HabitDocType;
  onRestore?: (habit: HabitDocType) => void;
  onEdit?: (habit: HabitDocType) => void;
}

/**
 * Get the frequency label including target count for weekly/monthly habits
 */
function getFrequencyLabel(frequency: 'daily' | 'weekly' | 'monthly', targetCount: number): string {
  switch (frequency) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return `${targetCount}x/week`;
    case 'monthly':
      return `${targetCount}x/month`;
    default:
      return 'Daily';
  }
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

export function HabitCard({
  habit,
  onRestore,
  onEdit,
}: HabitCardProps) {
  const frequency = habit.frequency || 'daily';
  const FrequencyIcon = FREQUENCY_ICONS[frequency];
  const CategoryIcon = CATEGORY_ICONS[habit.category];

  return (
    <Card
      className={cn(
        'relative overflow-hidden p-0',
        'transition-all duration-200 ease-out',
        'hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20',
        habit.isArchived && 'opacity-60'
      )}
      data-testid="habit-card"
      data-habit-id={habit.id}
    >
      <div className="flex h-full">
        {/* Large category icon on the left - colored by habit type */}
        <div
          className={cn(
            'flex items-center justify-center px-4 py-6',
            TYPE_BG_COLORS[habit.type || 'neutral']
          )}
          data-testid="habit-category-icon"
        >
          <CategoryIcon className="size-8" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0 items-between">
          <CardHeader className="pb-3 pt-3">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/habits/detail?id=${habit.id}`}
                className="flex-1 min-w-0 group"
                data-testid="habit-detail-link"
              >
                <CardTitle className="text-base font-medium truncate group-hover:text-primary transition-colors">
                  {habit.name}
                  <ChevronRight className="inline-block size-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardTitle>
                {habit.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {habit.description}
                  </p>
                )}
              </Link>
              
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-3">
            <div className="flex items-center justify-between">
              {/* Frequency badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  data-testid="habit-frequency-badge"
                >
                  <FrequencyIcon className="size-3" aria-hidden="true" />
                  {getFrequencyLabel(frequency, habit.targetCount || 1)}
                </span>
              </div>

              {/* Quick action buttons */}
              <div className="flex items-center gap-1">
                {habit.isArchived && onRestore && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRestore(habit);
                    }}
                    aria-label={`Restore ${habit.name}`}
                    title="Restore habit"
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit?.(habit);
                  }}
                  aria-label={`Options for ${habit.name}`}
                  title="Options"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
