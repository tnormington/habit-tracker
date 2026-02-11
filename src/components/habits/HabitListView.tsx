'use client';

import { useState, useMemo } from 'react';
import { useHabits } from '@/lib/database/useHabits';
import { HabitCard } from './HabitCard';
import { HabitFilters, type HabitFiltersState } from './HabitFilters';
import { HabitSearch } from './HabitSearch';
import { HabitEmptyState } from './HabitEmptyState';
import type { HabitDocType } from '@/lib/database/types';
import { Loader2, Archive, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HabitListViewProps {
  onCreateHabit?: () => void;
  onEditHabit?: (habit: HabitDocType) => void;
}

export function HabitListView({ onCreateHabit, onEditHabit }: HabitListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [filters, setFilters] = useState<HabitFiltersState>({
    type: null,
    category: null,
  });

  // Fetch habits with filter from database
  const { habits, isLoading, updateHabit } = useHabits({
    filter: {
      isArchived: showArchived,
      ...(filters.type && { type: filters.type }),
      ...(filters.category && { category: filters.category }),
    },
  });

  // Apply search filter client-side for instant feedback
  const filteredHabits = useMemo(() => {
    if (!searchQuery.trim()) return habits;

    const query = searchQuery.toLowerCase().trim();
    return habits.filter(
      (habit) =>
        habit.name.toLowerCase().includes(query) ||
        habit.description.toLowerCase().includes(query)
    );
  }, [habits, searchQuery]);

  const handleRestore = async (habit: HabitDocType) => {
    try {
      await updateHabit(habit.id, { isArchived: false });
    } catch (error) {
      console.error('Failed to restore habit:', error);
    }
  };

  const clearFilters = () => {
    setFilters({ type: null, category: null });
    setSearchQuery('');
  };

  // Determine empty state type
  const getEmptyStateType = (): 'no-habits' | 'no-results' | 'filtered-empty' | 'no-archived' | null => {
    if (isLoading) return null;
    if (habits.length === 0 && !filters.type && !filters.category) {
      return showArchived ? 'no-archived' : 'no-habits';
    }
    if (filteredHabits.length === 0 && searchQuery) {
      return 'no-results';
    }
    if (filteredHabits.length === 0 && (filters.type || filters.category)) {
      return 'filtered-empty';
    }
    return null;
  };

  const emptyStateType = getEmptyStateType();

  return (
    <div className="space-y-6" data-testid="habit-list-view">
      {/* View toggle: Active / Archived */}
      <div className="flex gap-2">
        <Button
          variant={!showArchived ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowArchived(false)}
          className={cn('gap-1.5')}
          data-testid="view-active-habits"
        >
          <List className="size-4" />
          Active
        </Button>
        <Button
          variant={showArchived ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowArchived(true)}
          className={cn('gap-1.5')}
          data-testid="view-archived-habits"
        >
          <Archive className="size-4" />
          Archived
        </Button>
      </div>

      {/* Search and filters section */}
      <div className="space-y-4">
        <HabitSearch value={searchQuery} onChange={setSearchQuery} />
        <HabitFilters filters={filters} onFiltersChange={setFilters} />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div
          className="flex items-center justify-center py-12"
          data-testid="loading-state"
        >
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {emptyStateType && (
        <HabitEmptyState
          type={emptyStateType}
          onCreateHabit={onCreateHabit}
          onClearFilters={clearFilters}
        />
      )}

      {/* Habit cards grid */}
      {!isLoading && filteredHabits.length > 0 && (
        <div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          data-testid="habit-cards-grid"
        >
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onRestore={showArchived ? handleRestore : undefined}
              onEdit={onEditHabit}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {!isLoading && filteredHabits.length > 0 && (
        <p className="text-sm text-muted-foreground" data-testid="results-count">
          Showing {filteredHabits.length} habit
          {filteredHabits.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
