'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useHabit } from '@/lib/database/useHabits';
import {
  HabitDetailHeader,
  HabitStatsCard,
  HabitStreakCard,
  HabitCalendarHeatmap,
  HabitRecentLogs,
  HabitEditFormDialog,
} from '@/components/habits';
import type { HabitDocType } from '@/lib/database/types';

export default function HabitDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const habitId = searchParams.get('id') ?? '';

  const { habit, isLoading, error } = useHabit(habitId);
  const [editingHabit, setEditingHabit] = React.useState<HabitDocType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const handleEdit = () => {
    if (habit) {
      setEditingHabit(habit);
      setIsEditDialogOpen(true);
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingHabit(null);
  };

  // Handle deletion - redirect back to habits list
  React.useEffect(() => {
    if (!isLoading && !habit && !error && habitId) {
      // Habit was deleted, redirect to habits list
      router.push('/habits');
    }
  }, [habit, isLoading, error, router, habitId]);

  if (!habitId) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12"
        data-testid="habit-not-found"
      >
        <p className="text-lg font-medium">No habit selected</p>
        <p className="text-sm text-muted-foreground mt-1">
          Please select a habit from the habits list.
        </p>
        <button
          onClick={() => router.push('/habits')}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Back to Habits
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6" data-testid="habit-detail-loading">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-9 w-32 bg-muted rounded animate-pulse" />
            <div className="h-9 w-20 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex items-start gap-4">
            <div className="size-12 bg-muted rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-64 bg-muted rounded animate-pulse" />
              <div className="flex gap-2 mt-3">
                <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="h-80 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12"
        data-testid="habit-detail-error"
      >
        <p className="text-lg font-medium text-destructive">
          Error loading habit
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {error.message}
        </p>
        <button
          onClick={() => router.push('/habits')}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Back to Habits
        </button>
      </div>
    );
  }

  if (!habit) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12"
        data-testid="habit-not-found"
      >
        <p className="text-lg font-medium">Habit not found</p>
        <p className="text-sm text-muted-foreground mt-1">
          This habit may have been deleted.
        </p>
        <button
          onClick={() => router.push('/habits')}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Back to Habits
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="habit-detail-page">
      {/* Header with habit info and actions */}
      <HabitDetailHeader habit={habit} onEdit={handleEdit} />

      {/* Stats and Streaks row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <HabitStatsCard habitId={habitId} />
        <HabitStreakCard habitId={habitId} />
      </div>

      {/* Calendar Heatmap */}
      <HabitCalendarHeatmap habitId={habitId} habitType={habit.type} habitColor={habit.color} />

      {/* Recent Logs */}
      <HabitRecentLogs habitId={habitId} habitType={habit.type} />

      {/* Edit Dialog */}
      <HabitEditFormDialog
        habit={editingHabit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
