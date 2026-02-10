'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  updateHabit,
  archiveHabit,
  restoreHabit,
  deleteHabit,
  VALID_HABIT_TYPES,
  VALID_HABIT_CATEGORIES,
  VALID_HABIT_COLORS,
  VALID_HABIT_FREQUENCIES,
} from '@/lib/database/habitService';
import type { HabitDocType, HabitType, HabitCategory, HabitColor, HabitFrequency } from '@/lib/database/types';
import { cn } from '@/lib/utils';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

// Color display mappings for the color picker
const COLOR_DISPLAY: Record<HabitColor, { label: string; bgClass: string }> = {
  red: { label: 'Red', bgClass: 'bg-red-500' },
  orange: { label: 'Orange', bgClass: 'bg-orange-500' },
  yellow: { label: 'Yellow', bgClass: 'bg-yellow-500' },
  green: { label: 'Green', bgClass: 'bg-green-500' },
  blue: { label: 'Blue', bgClass: 'bg-blue-500' },
  purple: { label: 'Purple', bgClass: 'bg-purple-500' },
  pink: { label: 'Pink', bgClass: 'bg-pink-500' },
  gray: { label: 'Gray', bgClass: 'bg-gray-500' },
};

// Category display labels
const CATEGORY_DISPLAY: Record<HabitCategory, string> = {
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

// Type display labels
const TYPE_DISPLAY: Record<HabitType, { label: string; description: string }> = {
  positive: { label: 'Positive', description: 'A habit you want to build' },
  negative: { label: 'Negative', description: 'A habit you want to break' },
};

// Frequency display labels
const FREQUENCY_DISPLAY: Record<HabitFrequency, { label: string; description: string }> = {
  daily: { label: 'Daily', description: 'Track every day' },
  weekly: { label: 'Weekly', description: 'Track once per week' },
  monthly: { label: 'Monthly', description: 'Track once per month' },
};

interface FormErrors {
  name?: string;
  description?: string;
  type?: string;
  category?: string;
  color?: string;
  frequency?: string;
  submit?: string;
}

interface HabitEditFormDialogProps {
  habit: HabitDocType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function HabitEditFormDialog({
  habit,
  open,
  onOpenChange,
  onSuccess,
}: HabitEditFormDialogProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [type, setType] = React.useState<HabitType>('positive');
  const [category, setCategory] = React.useState<HabitCategory>('other');
  const [color, setColor] = React.useState<HabitColor>('blue');
  const [frequency, setFrequency] = React.useState<HabitFrequency>('daily');
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isArchiving, setIsArchiving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);

  // Populate form when habit changes
  React.useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description || '');
      setType(habit.type);
      setCategory(habit.category);
      setColor(habit.color);
      setFrequency(habit.frequency || 'daily');
      setErrors({});
    }
  }, [habit]);

  // Validate form on submit
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Name is required';
    } else if (trimmedName.length > 200) {
      newErrors.name = 'Name must be 200 characters or less';
    }

    // Validate description (optional but has max length)
    if (description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!habit || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await updateHabit(habit.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        category,
        color,
        frequency,
      });

      if (result.success) {
        onSuccess?.();
        onOpenChange(false);
      } else {
        setErrors({
          submit: result.error?.message || 'Failed to update habit',
        });
      }
    } catch {
      setErrors({
        submit: 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle archive/restore
  const handleArchiveToggle = async () => {
    if (!habit) return;

    setIsArchiving(true);
    setErrors({});

    try {
      const result = habit.isArchived
        ? await restoreHabit(habit.id)
        : await archiveHabit(habit.id);

      if (result.success) {
        onSuccess?.();
        onOpenChange(false);
      } else {
        setErrors({
          submit: result.error?.message || 'Failed to update habit',
        });
      }
    } catch {
      setErrors({
        submit: 'An unexpected error occurred',
      });
    } finally {
      setIsArchiving(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!habit) return;

    setIsDeleting(true);
    setErrors({});

    try {
      const result = await deleteHabit(habit.id);

      if (result.success) {
        setShowDeleteConfirmation(false);
        onSuccess?.();
        onOpenChange(false);
      } else {
        setErrors({
          submit: result.error?.message || 'Failed to delete habit',
        });
      }
    } catch {
      setErrors({
        submit: 'An unexpected error occurred',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Clear field error when user starts typing
  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isLoading = isSubmitting || isArchiving || isDeleting;

  if (!habit) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent data-testid="edit-habit-dialog">
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
            <DialogDescription>
              Update your habit details below. Changes are saved when you click Save.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="habit-edit-form">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-habit-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-habit-name"
                data-testid="edit-habit-name-input"
                placeholder="e.g., Morning meditation"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError('name');
                }}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'edit-habit-name-error' : undefined}
                disabled={isLoading}
              />
              {errors.name && (
                <p id="edit-habit-name-error" className="text-sm text-destructive" data-testid="edit-habit-name-error">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-habit-description">Description</Label>
              <Textarea
                id="edit-habit-description"
                data-testid="edit-habit-description-input"
                placeholder="Optional: Describe your habit..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearFieldError('description');
                }}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'edit-habit-description-error' : undefined}
                disabled={isLoading}
                rows={3}
              />
              {errors.description && (
                <p id="edit-habit-description-error" className="text-sm text-destructive" data-testid="edit-habit-description-error">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Type Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-habit-type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value as HabitType);
                  clearFieldError('type');
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="edit-habit-type"
                  data-testid="edit-habit-type-select"
                  aria-invalid={!!errors.type}
                  aria-describedby={errors.type ? 'edit-habit-type-error' : undefined}
                >
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_HABIT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} data-testid={`edit-habit-type-option-${t}`}>
                      <div className="flex flex-col">
                        <span>{TYPE_DISPLAY[t].label}</span>
                        <span className="text-xs text-muted-foreground">{TYPE_DISPLAY[t].description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p id="edit-habit-type-error" className="text-sm text-destructive" data-testid="edit-habit-type-error">
                  {errors.type}
                </p>
              )}
            </div>

            {/* Category Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-habit-category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value as HabitCategory);
                  clearFieldError('category');
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="edit-habit-category"
                  data-testid="edit-habit-category-select"
                  aria-invalid={!!errors.category}
                  aria-describedby={errors.category ? 'edit-habit-category-error' : undefined}
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_HABIT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} data-testid={`edit-habit-category-option-${c}`}>
                      {CATEGORY_DISPLAY[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p id="edit-habit-category-error" className="text-sm text-destructive" data-testid="edit-habit-category-error">
                  {errors.category}
                </p>
              )}
            </div>

            {/* Frequency Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-habit-frequency">Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(value) => {
                  setFrequency(value as HabitFrequency);
                  clearFieldError('frequency');
                }}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="edit-habit-frequency"
                  data-testid="edit-habit-frequency-select"
                  aria-invalid={!!errors.frequency}
                  aria-describedby={errors.frequency ? 'edit-habit-frequency-error' : undefined}
                >
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_HABIT_FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f} data-testid={`edit-habit-frequency-option-${f}`}>
                      <div className="flex flex-col">
                        <span>{FREQUENCY_DISPLAY[f].label}</span>
                        <span className="text-xs text-muted-foreground">{FREQUENCY_DISPLAY[f].description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.frequency && (
                <p id="edit-habit-frequency-error" className="text-sm text-destructive" data-testid="edit-habit-frequency-error">
                  {errors.frequency}
                </p>
              )}
            </div>

            {/* Color Picker Field */}
            <div className="space-y-2">
              <Label>
                Color <span className="text-destructive">*</span>
              </Label>
              <div
                className="flex flex-wrap gap-2"
                role="radiogroup"
                aria-label="Habit color"
                aria-invalid={!!errors.color}
                aria-describedby={errors.color ? 'edit-habit-color-error' : undefined}
              >
                {VALID_HABIT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={color === c}
                    data-testid={`edit-habit-color-option-${c}`}
                    onClick={() => {
                      setColor(c);
                      clearFieldError('color');
                    }}
                    disabled={isLoading}
                    className={cn(
                      'size-8 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      COLOR_DISPLAY[c].bgClass,
                      color === c && 'ring-2 ring-ring ring-offset-2 scale-110',
                      isLoading && 'opacity-50 cursor-not-allowed'
                    )}
                    title={COLOR_DISPLAY[c].label}
                  >
                    <span className="sr-only">{COLOR_DISPLAY[c].label}</span>
                  </button>
                ))}
              </div>
              {errors.color && (
                <p id="edit-habit-color-error" className="text-sm text-destructive" data-testid="edit-habit-color-error">
                  {errors.color}
                </p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <p className="text-sm text-destructive" data-testid="edit-habit-submit-error">
                {errors.submit}
              </p>
            )}

            {/* Actions Section */}
            <div className="flex items-center justify-between border-t pt-4">
              {/* Destructive Actions */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleArchiveToggle}
                  disabled={isLoading}
                  data-testid="edit-habit-archive-button"
                >
                  {habit.isArchived ? (
                    <>
                      <ArchiveRestore className="size-4 mr-1" />
                      Restore
                    </>
                  ) : (
                    <>
                      <Archive className="size-4 mr-1" />
                      Archive
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirmation(true)}
                  disabled={isLoading}
                  data-testid="edit-habit-delete-button"
                >
                  <Trash2 className="size-4 mr-1" />
                  Delete
                </Button>
              </div>

              {/* Form Actions */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  data-testid="edit-habit-cancel-button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} data-testid="edit-habit-save-button">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        habitName={habit.name}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
