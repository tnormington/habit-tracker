'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChoiceCardGroup } from '@/components/ui/choice-card';
import { Slider } from '@/components/ui/slider';
import { CategoryIconGrid } from '@/components/habits/CategoryIconGrid';
import {
  createHabit,
  type CreateHabitData,
} from '@/lib/database/habitService';
import type { HabitType, HabitCategory, HabitFrequency } from '@/lib/database/types';
import {
  TYPE_DISPLAY,
  FREQUENCY_DISPLAY,
} from '@/lib/constants/habit-display';

// Type options for choice cards
const TYPE_OPTIONS: Array<{ value: HabitType; label: string; description: string; icon: React.ReactNode }> = [
  { value: 'positive', ...TYPE_DISPLAY.positive },
  { value: 'neutral', ...TYPE_DISPLAY.neutral },
  { value: 'negative', ...TYPE_DISPLAY.negative },
];

// Frequency options for choice cards
const FREQUENCY_OPTIONS: Array<{ value: HabitFrequency; label: string; description: string; icon: React.ReactNode }> = [
  { value: 'daily', ...FREQUENCY_DISPLAY.daily },
  { value: 'weekly', ...FREQUENCY_DISPLAY.weekly },
  { value: 'monthly', ...FREQUENCY_DISPLAY.monthly },
];

interface FormErrors {
  name?: string;
  description?: string;
  type?: string;
  category?: string;
  frequency?: string;
  targetCount?: string;
  submit?: string;
}

interface HabitCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function HabitCreationForm({ onSuccess, onCancel }: HabitCreationFormProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [type, setType] = React.useState<HabitType>('positive');
  const [category, setCategory] = React.useState<HabitCategory | ''>('');
  const [frequency, setFrequency] = React.useState<HabitFrequency>('daily');
  const [targetCount, setTargetCount] = React.useState<number>(1);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Get the max target count based on frequency
  const getMaxTargetCount = (freq: HabitFrequency): number => {
    switch (freq) {
      case 'weekly':
        return 7;
      case 'monthly':
        return 30;
      default:
        return 1;
    }
  };

  // Get label for target count based on frequency
  const getTargetLabel = (freq: HabitFrequency): string => {
    switch (freq) {
      case 'weekly':
        return 'times per week';
      case 'monthly':
        return 'times per month';
      default:
        return '';
    }
  };

  // Reset target count when frequency changes
  React.useEffect(() => {
    if (frequency === 'daily') {
      setTargetCount(1);
    } else {
      // Set a reasonable default when switching to weekly/monthly
      setTargetCount(frequency === 'weekly' ? 3 : 4);
    }
  }, [frequency]);

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

    // Validate type
    if (!type) {
      newErrors.type = 'Please select a type';
    }

    // Validate category
    if (!category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const habitData: CreateHabitData = {
        name: name.trim(),
        description: description.trim() || undefined,
        type: type as HabitType,
        category: category as HabitCategory,
        frequency: frequency,
        targetCount: frequency === 'daily' ? 1 : targetCount,
      };

      const result = await createHabit(habitData);

      if (result.success) {
        // Reset form
        setName('');
        setDescription('');
        setType('positive');
        setCategory('');
        setFrequency('daily');
        setTargetCount(1);
        onSuccess?.();
      } else {
        setErrors({
          submit: result.error?.message || 'Failed to create habit',
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

  // Clear field error when user starts typing
  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="habit-creation-form">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="habit-name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="habit-name"
          data-testid="habit-name-input"
          placeholder="e.g., Morning meditation"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearFieldError('name');
          }}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'habit-name-error' : undefined}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p id="habit-name-error" className="text-sm text-destructive" data-testid="habit-name-error">
            {errors.name}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="habit-description">Description</Label>
        <Textarea
          id="habit-description"
          data-testid="habit-description-input"
          placeholder="Optional: Describe your habit..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            clearFieldError('description');
          }}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'habit-description-error' : undefined}
          disabled={isSubmitting}
          rows={3}
        />
        {errors.description && (
          <p id="habit-description-error" className="text-sm text-destructive" data-testid="habit-description-error">
            {errors.description}
          </p>
        )}
      </div>

      {/* Type Field */}
      <div className="space-y-2">
        <Label>
          Type <span className="text-destructive">*</span>
        </Label>
        <ChoiceCardGroup
          options={TYPE_OPTIONS}
          value={type}
          onChange={(value) => {
            setType(value);
            clearFieldError('type');
          }}
          disabled={isSubmitting}
          aria-label="Habit type"
          aria-invalid={!!errors.type}
          aria-describedby={errors.type ? 'habit-type-error' : undefined}
          data-testid="habit-type"
        />
        {errors.type && (
          <p id="habit-type-error" className="text-sm text-destructive" data-testid="habit-type-error">
            {errors.type}
          </p>
        )}
      </div>

      {/* Category Field */}
      <div className="space-y-2">
        <Label>
          Category <span className="text-destructive">*</span>
        </Label>
        <CategoryIconGrid
          value={category || undefined}
          onChange={(value) => {
            setCategory(value);
            clearFieldError('category');
          }}
          disabled={isSubmitting}
          aria-label="Habit category"
          aria-invalid={!!errors.category}
          aria-describedby={errors.category ? 'habit-category-error' : undefined}
          data-testid="habit-category"
        />
        {errors.category && (
          <p id="habit-category-error" className="text-sm text-destructive" data-testid="habit-category-error">
            {errors.category}
          </p>
        )}
      </div>

      {/* Frequency Field */}
      <div className="space-y-2">
        <Label>Frequency</Label>
        <ChoiceCardGroup
          options={FREQUENCY_OPTIONS}
          value={frequency}
          onChange={(value) => {
            setFrequency(value);
            clearFieldError('frequency');
          }}
          disabled={isSubmitting}
          aria-label="Habit frequency"
          data-testid="habit-frequency"
        />
        {errors.frequency && (
          <p id="habit-frequency-error" className="text-sm text-destructive" data-testid="habit-frequency-error">
            {errors.frequency}
          </p>
        )}
      </div>

      {/* Target Count Field - only shown for non-daily frequencies */}
      {frequency !== 'daily' && (
        <div className="space-y-2">
          <Label htmlFor="habit-target-count">
            Target ({getTargetLabel(frequency)})
          </Label>
          <Slider
            id="habit-target-count"
            value={targetCount}
            min={1}
            max={getMaxTargetCount(frequency)}
            step={1}
            onValueChange={setTargetCount}
            disabled={isSubmitting}
            formatValue={(v) => `${v}x`}
            aria-label={`Target ${getTargetLabel(frequency)}`}
            data-testid="habit-target-count"
          />
          <p className="text-xs text-muted-foreground">
            {targetCount === 1
              ? `Complete this habit once ${frequency === 'weekly' ? 'per week' : 'per month'}`
              : `Complete this habit ${targetCount} times ${frequency === 'weekly' ? 'per week' : 'per month'}`}
          </p>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <p className="text-sm text-destructive" data-testid="habit-submit-error">
          {errors.submit}
        </p>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            data-testid="habit-cancel-button"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} data-testid="habit-submit-button">
          {isSubmitting ? 'Creating...' : 'Create Habit'}
        </Button>
      </div>
    </form>
  );
}
