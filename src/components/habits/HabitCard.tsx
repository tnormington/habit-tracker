'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HabitDocType } from '@/lib/database/types';
import {
  Archive,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';
import {
  CATEGORY_DISPLAY,
  CATEGORY_ICONS,
  FREQUENCY_ICONS,
  TYPE_ICONS,
} from '@/lib/constants/habit-display';

interface HabitCardProps {
  habit: HabitDocType;
  onComplete?: (habit: HabitDocType) => void;
  onArchive?: (habit: HabitDocType) => void;
  onEdit?: (habit: HabitDocType) => void;
}

const COLOR_CLASSES: Record<HabitDocType['color'], string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  gray: 'bg-gray-500',
};

const FREQUENCY_CONFIG = {
  daily: { label: 'Daily' },
  weekly: { label: 'Weekly' },
  monthly: { label: 'Monthly' },
} as const;

export function HabitCard({
  habit,
  onComplete,
  onArchive,
  onEdit,
}: HabitCardProps) {
  const frequency = habit.frequency || 'daily';
  const FrequencyIcon = FREQUENCY_ICONS[frequency];
  const CategoryIcon = CATEGORY_ICONS[habit.category];
  const TypeIcon = TYPE_ICONS[habit.type];

  const typeStyles = {
    positive: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    neutral: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
    negative: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-shadow hover:shadow-md',
        habit.isArchived && 'opacity-60'
      )}
      data-testid="habit-card"
      data-habit-id={habit.id}
    >
      <div className="flex">
        {/* Large habit type icon on the left */}
        <div
          className={cn(
            'flex items-center justify-center px-4 py-6',
            typeStyles[habit.type]
          )}
          data-testid="habit-type-icon"
        >
          <TypeIcon className="size-8" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <CardHeader className="pb-3">
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
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit?.(habit);
                }}
                aria-label={`Edit ${habit.name}`}
              >
                <MoreVertical className="size-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              {/* Type and category badges */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category badge */}
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                  data-testid="habit-category-badge"
                >
                  <CategoryIcon className="size-3" aria-hidden="true" />
                  {CATEGORY_DISPLAY[habit.category].label}
                </span>

                {/* Frequency badge (only show for non-daily) */}
                {frequency !== 'daily' && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    data-testid="habit-frequency-badge"
                  >
                    <FrequencyIcon className="size-3" aria-hidden="true" />
                    {FREQUENCY_CONFIG[frequency].label}
                  </span>
                )}
              </div>

              {/* Quick action button */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onArchive?.(habit);
                  }}
                  aria-label={`Archive ${habit.name}`}
                  title="Archive habit"
                >
                  <Archive className="size-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
