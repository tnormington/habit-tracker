'use client';

import { useState, useMemo } from 'react';
import { useHabits } from '@/lib/database/useHabits';
import { HabitCard } from './HabitCard';
import { HabitFilters, type HabitFiltersState } from './HabitFilters';
import { HabitSearch } from './HabitSearch';
import { HabitEmptyState } from './HabitEmptyState';
import type { HabitDocType } from '@/lib/database/types';
import { Loader2 } from 'lucide-react';

interface HabitListViewProps {
  onCreateHabit?: () => void;
  onEditHabit?: (habit: HabitDocType) => void;
}

export function HabitListView({ onCreateHabit, onEditHabit }: HabitListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<HabitFiltersState>({
    type: null,
    category: null,
  });

  // Fetch habits with filter from database
  const { habits, isLoading, archiveHabit } = useHabits({
    filter: {
      isArchived: false,
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

  const handleComplete = (habit: HabitDocType) => {
    // This will be hooked up to habit log toggle in the future
    console.log('Complete habit:', habit.id);
  };

  const handleArchive = async (habit: HabitDocType) => {
    try {
      await archiveHabit(habit.id);
    } catch (error) {
      console.error('Failed to archive habit:', error);
    }
  };

  const clearFilters = () => {
    setFilters({ type: null, category: null });
    setSearchQuery('');
  };

  // Determine empty state type
  const getEmptyStateType = (): 'no-habits' | 'no-results' | 'filtered-empty' | null => {
    if (isLoading) return null;
    if (habits.length === 0 && !filters.type && !filters.category) {
      return 'no-habits';
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
              onComplete={handleComplete}
              onArchive={handleArchive}
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
