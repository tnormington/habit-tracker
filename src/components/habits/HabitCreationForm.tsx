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
import { ChoiceCardGroup } from '@/components/ui/choice-card';
import { CategoryIconGrid } from '@/components/habits/CategoryIconGrid';
import {
  createHabit,
  VALID_HABIT_TYPES,
  VALID_HABIT_COLORS,
  type CreateHabitData,
} from '@/lib/database/habitService';
import type { HabitType, HabitCategory, HabitColor, HabitFrequency } from '@/lib/database/types';
import { cn } from '@/lib/utils';
import {
  COLOR_DISPLAY,
  TYPE_DISPLAY,
  FREQUENCY_DISPLAY,
} from '@/lib/constants/habit-display';

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
  color?: string;
  frequency?: string;
  submit?: string;
}

interface HabitCreationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function HabitCreationForm({ onSuccess, onCancel }: HabitCreationFormProps) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [type, setType] = React.useState<HabitType | ''>('');
  const [category, setCategory] = React.useState<HabitCategory | ''>('');
  const [color, setColor] = React.useState<HabitColor | ''>('');
  const [frequency, setFrequency] = React.useState<HabitFrequency>('daily');
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

    // Validate color
    if (!color) {
      newErrors.color = 'Please select a color';
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
        color: color as HabitColor,
        frequency: frequency,
      };

      const result = await createHabit(habitData);

      if (result.success) {
        // Reset form
        setName('');
        setDescription('');
        setType('');
        setCategory('');
        setColor('');
        setFrequency('daily');
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
        <Label htmlFor="habit-type">
          Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value as HabitType);
            clearFieldError('type');
          }}
          disabled={isSubmitting}
        >
          <SelectTrigger
            id="habit-type"
            data-testid="habit-type-select"
            aria-invalid={!!errors.type}
            aria-describedby={errors.type ? 'habit-type-error' : undefined}
          >
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            {VALID_HABIT_TYPES.map((t) => (
              <SelectItem key={t} value={t} data-testid={`habit-type-option-${t}`}>
                <div className="flex flex-col">
                  <span>{TYPE_DISPLAY[t].label}</span>
                  <span className="text-xs text-muted-foreground">{TYPE_DISPLAY[t].description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          aria-describedby={errors.color ? 'habit-color-error' : undefined}
        >
          {VALID_HABIT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              data-testid={`habit-color-option-${c}`}
              onClick={() => {
                setColor(c);
                clearFieldError('color');
              }}
              disabled={isSubmitting}
              className={cn(
                'size-8 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                COLOR_DISPLAY[c].bgClass,
                color === c && 'ring-2 ring-ring ring-offset-2 scale-110',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
              title={COLOR_DISPLAY[c].label}
            >
              <span className="sr-only">{COLOR_DISPLAY[c].label}</span>
            </button>
          ))}
        </div>
        {errors.color && (
          <p id="habit-color-error" className="text-sm text-destructive" data-testid="habit-color-error">
            {errors.color}
          </p>
        )}
      </div>

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
