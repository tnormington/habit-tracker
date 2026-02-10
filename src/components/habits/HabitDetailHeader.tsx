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
} from 'lucide-react';

interface HabitDetailHeaderProps {
  habit: HabitDocType;
  onEdit: () => void;
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

export function HabitDetailHeader({ habit, onEdit }: HabitDetailHeaderProps) {
  const router = useRouter();
  const isPositive = habit.type === 'positive';

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
        {/* Color indicator */}
        <div
          className={cn(
            'size-12 rounded-lg shrink-0',
            COLOR_CLASSES[habit.color]
          )}
          aria-hidden="true"
        />

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
