'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useHabitLog } from '@/lib/database/useHabitLogs';
import { useHabitLogs } from '@/lib/database/useHabitLogs';
import type { HabitDocType } from '@/lib/database/types';
import { Check, X, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogEditDialogProps {
  habitId: string;
  habitType: HabitDocType['type'];
  date: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00'); // Noon to avoid timezone issues
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function LogEditDialog({
  habitId,
  habitType,
  date,
  open,
  onOpenChange,
  onClose,
}: LogEditDialogProps) {
  const { log, isLoading: isLogLoading } = useHabitLog(habitId, date);
  const { toggleCompletion, updateLog, createLog } = useHabitLogs();

  const [completed, setCompleted] = React.useState(false);
  const [notes, setNotes] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Sync state with log data when it loads
  React.useEffect(() => {
    if (log) {
      setCompleted(log.completed);
      setNotes(log.notes || '');
      setHasChanges(false);
    } else if (date && !isLogLoading) {
      // No log exists yet, reset to defaults
      setCompleted(false);
      setNotes('');
      setHasChanges(false);
    }
  }, [log, date, isLogLoading]);

  // Track changes
  const handleCompletedChange = (newCompleted: boolean) => {
    setCompleted(newCompleted);
    setHasChanges(
      newCompleted !== (log?.completed ?? false) ||
      notes !== (log?.notes ?? '')
    );
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    setHasChanges(
      completed !== (log?.completed ?? false) ||
      newNotes !== (log?.notes ?? '')
    );
  };

  // Determine status display
  const isSuccess = habitType === 'positive' ? completed : !completed;
  const statusText = isSuccess ? 'Success' : 'Missed';
  const statusDescription = habitType === 'positive'
    ? (completed ? 'You completed this habit!' : 'You missed this habit')
    : (completed ? 'You did this habit (trying to break)' : 'You avoided this habit!');

  // Save changes
  const handleSave = async () => {
    if (!date) return;

    setIsSaving(true);
    try {
      if (log) {
        // Update existing log
        await updateLog(log.id, {
          completed,
          notes,
        });
      } else {
        // Create new log
        await createLog({
          habitId,
          date,
          completed,
          notes,
        });
      }
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Failed to save log:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Quick toggle completion
  const handleQuickToggle = async () => {
    if (!date) return;

    setIsSaving(true);
    try {
      await toggleCompletion(habitId, date);
      // The log will update via subscription, which will update our state
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasChanges) {
      // Could add a confirmation dialog here
    }
    onOpenChange(newOpen);
    if (!newOpen) {
      onClose();
    }
  };

  if (!date) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="log-edit-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Log Entry
          </DialogTitle>
          <DialogDescription>
            {formatDisplayDate(date)}
          </DialogDescription>
        </DialogHeader>

        {isLogLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Display */}
            <div
              className={cn(
                'flex items-center justify-between p-4 rounded-lg',
                isSuccess
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              )}
              data-testid="log-status-display"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex items-center justify-center size-10 rounded-full',
                    isSuccess
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  )}
                >
                  {isSuccess ? (
                    <Check className="size-5" />
                  ) : (
                    <X className="size-5" />
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      'font-semibold',
                      isSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                    )}
                  >
                    {statusText}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {statusDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Completion Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="completed" className="text-base">
                  {habitType === 'positive' ? 'Completed' : 'Did this habit'}
                </Label>
                <Checkbox
                  id="completed"
                  checked={completed}
                  onCheckedChange={handleCompletedChange}
                  data-testid="log-completed-checkbox"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {habitType === 'positive'
                  ? 'Check if you completed this habit on this day'
                  : 'Check if you did this habit (habit you\'re trying to break)'}
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this day..."
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="min-h-[100px]"
                data-testid="log-notes-textarea"
              />
              <p className="text-sm text-muted-foreground">
                Record any thoughts, obstacles, or achievements for this day.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            data-testid="log-save-button"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
