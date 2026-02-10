'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CATEGORY_DISPLAY } from '@/lib/constants/habit-display';
import { VALID_HABIT_CATEGORIES } from '@/lib/database/habitService';
import type { HabitCategory } from '@/lib/database/types';

interface CategoryIconGridProps {
  value?: HabitCategory;
  onChange: (value: HabitCategory) => void;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  'data-testid'?: string;
}

export function CategoryIconGrid({
  value,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  'data-testid': dataTestId,
}: CategoryIconGridProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      data-testid={dataTestId}
      className="grid grid-cols-3 gap-2"
    >
      {VALID_HABIT_CATEGORIES.map((category) => {
        const { label, icon } = CATEGORY_DISPLAY[category];
        const isSelected = value === category;

        return (
          <button
            key={category}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-testid={dataTestId ? `${dataTestId}-option-${category}` : undefined}
            onClick={() => onChange(category)}
            disabled={disabled}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-all',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              isSelected
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border bg-card hover:border-muted-foreground/50 hover:bg-accent',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <span className={cn(isSelected ? 'text-primary' : 'text-muted-foreground')}>
              {icon}
            </span>
            <span className={cn('text-xs font-medium', isSelected ? 'text-primary' : 'text-foreground')}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
