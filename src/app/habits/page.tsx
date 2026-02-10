'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HabitListView, HabitCreationForm, HabitEditFormDialog } from '@/components/habits';
import { PlusCircle } from 'lucide-react';
import type { HabitDocType } from '@/lib/database/types';

export default function HabitsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [editingHabit, setEditingHabit] = React.useState<HabitDocType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const handleCreateHabit = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditHabit = (habit: HabitDocType) => {
    setEditingHabit(habit);
    setIsEditDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  const handleCreateCancel = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingHabit(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Habits</h1>
          <p className="mt-2 text-muted-foreground">
            Manage and track your daily habits.
          </p>
        </div>
        <Button onClick={handleCreateHabit} data-testid="add-habit-button">
          <PlusCircle className="size-4" />
          Add Habit
        </Button>
      </div>

      <div className="mt-6">
        <HabitListView
          onCreateHabit={handleCreateHabit}
          onEditHabit={handleEditHabit}
        />
      </div>

      {/* Create Habit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent data-testid="create-habit-dialog">
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
            <DialogDescription>
              Add a new habit to track. Fill in the details below to get started.
            </DialogDescription>
          </DialogHeader>
          <HabitCreationForm
            onSuccess={handleCreateSuccess}
            onCancel={handleCreateCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Habit Dialog */}
      <HabitEditFormDialog
        habit={editingHabit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
