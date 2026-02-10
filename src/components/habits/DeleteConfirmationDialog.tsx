'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitName: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  habitName,
  onConfirm,
  isDeleting,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="delete-habit-confirmation-dialog">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Habit</DialogTitle>
              <DialogDescription className="mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to permanently delete{' '}
            <span className="font-medium text-foreground">&quot;{habitName}&quot;</span>?
            This will also delete all tracking data and streaks associated with this habit.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            data-testid="delete-habit-cancel-button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            data-testid="delete-habit-confirm-button"
          >
            {isDeleting ? 'Deleting...' : 'Delete Habit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
