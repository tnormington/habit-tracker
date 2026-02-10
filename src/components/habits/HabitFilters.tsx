'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HabitType, HabitCategory } from '@/lib/database/types';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

export interface HabitFiltersState {
  type: HabitType | null;
  category: HabitCategory | null;
}

interface HabitFiltersProps {
  filters: HabitFiltersState;
  onFiltersChange: (filters: HabitFiltersState) => void;
}

const CATEGORIES: { value: HabitCategory; label: string }[] = [
  { value: 'health', label: 'Health' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'learning', label: 'Learning' },
  { value: 'social', label: 'Social' },
  { value: 'finance', label: 'Finance' },
  { value: 'creativity', label: 'Creativity' },
  { value: 'other', label: 'Other' },
];

export function HabitFilters({ filters, onFiltersChange }: HabitFiltersProps) {
  const hasActiveFilters = filters.type !== null || filters.category !== null;

  const handleTypeChange = (type: HabitType | null) => {
    onFiltersChange({
      ...filters,
      type: filters.type === type ? null : type,
    });
  };

  const handleCategoryChange = (category: HabitCategory | null) => {
    onFiltersChange({
      ...filters,
      category: filters.category === category ? null : category,
    });
  };

  const clearFilters = () => {
    onFiltersChange({ type: null, category: null });
  };

  return (
    <div className="space-y-3" data-testid="habit-filters">
      {/* Type filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Type:</span>
        <Button
          variant={filters.type === 'positive' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeChange('positive')}
          className={cn(
            'gap-1',
            filters.type === 'positive' &&
              'bg-green-600 hover:bg-green-700 text-white'
          )}
          data-testid="filter-type-positive"
        >
          <TrendingUp className="size-3" />
          Build
        </Button>
        <Button
          variant={filters.type === 'negative' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTypeChange('negative')}
          className={cn(
            'gap-1',
            filters.type === 'negative' &&
              'bg-red-600 hover:bg-red-700 text-white'
          )}
          data-testid="filter-type-negative"
        >
          <TrendingDown className="size-3" />
          Break
        </Button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Category:
        </span>
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={filters.category === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange(cat.value)}
            data-testid={`filter-category-${cat.value}`}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1 text-muted-foreground"
          data-testid="clear-filters"
        >
          <X className="size-3" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
