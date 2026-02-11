'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Filter, Archive } from 'lucide-react';

interface HabitEmptyStateProps {
  type: 'no-habits' | 'no-results' | 'filtered-empty' | 'no-archived';
  onCreateHabit?: () => void;
  onClearFilters?: () => void;
}

export function HabitEmptyState({
  type,
  onCreateHabit,
  onClearFilters,
}: HabitEmptyStateProps) {
  const content = {
    'no-habits': {
      icon: PlusCircle,
      title: 'No habits yet',
      description:
        'Create your first habit to start tracking your progress and build better routines.',
      action: onCreateHabit && (
        <Button onClick={onCreateHabit} className="gap-2">
          <PlusCircle className="size-4" />
          Create Your First Habit
        </Button>
      ),
    },
    'no-results': {
      icon: Search,
      title: 'No habits found',
      description:
        "We couldn't find any habits matching your search. Try a different search term.",
      action: null,
    },
    'filtered-empty': {
      icon: Filter,
      title: 'No matching habits',
      description:
        "No habits match the current filters. Try adjusting your filters or create a new habit.",
      action: onClearFilters && (
        <Button variant="outline" onClick={onClearFilters} className="gap-2">
          Clear Filters
        </Button>
      ),
    },
    'no-archived': {
      icon: Archive,
      title: 'No archived habits',
      description:
        "You don't have any archived habits yet. Habits you archive will appear here.",
      action: null,
    },
  };

  const { icon: Icon, title, description, action } = content[type];

  return (
    <Card className="border-dashed" data-testid="habit-empty-state">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <Icon className="size-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="mb-2 text-lg font-semibold" data-testid="empty-state-title">
          {title}
        </h3>
        <p className="mb-6 max-w-sm text-muted-foreground">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}
