'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ChoiceCardOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ChoiceCardGroupProps<T extends string> {
  options: ChoiceCardOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

export function ChoiceCardGroup<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  className,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
}: ChoiceCardGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      data-testid={dataTestId}
      className={cn('grid gap-3', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => (
        <ChoiceCard
          key={option.value}
          option={option}
          isSelected={value === option.value}
          onSelect={() => onChange(option.value)}
          disabled={disabled}
          data-testid={dataTestId ? `${dataTestId}-option-${option.value}` : undefined}
        />
      ))}
    </div>
  );
}

interface ChoiceCardProps<T extends string> {
  option: ChoiceCardOption<T>;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  'data-testid'?: string;
}

function ChoiceCard<T extends string>({
  option,
  isSelected,
  onSelect,
  disabled = false,
  'data-testid': dataTestId,
}: ChoiceCardProps<T>) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      data-testid={dataTestId}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-center transition-all',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        isSelected
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-border bg-card hover:border-muted-foreground/50 hover:bg-accent',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {option.icon && (
        <span className={cn('text-lg', isSelected ? 'text-primary' : 'text-muted-foreground')}>
          {option.icon}
        </span>
      )}
      <span className={cn('text-sm font-medium', isSelected ? 'text-primary' : 'text-foreground')}>
        {option.label}
      </span>
      {option.description && (
        <span className={cn('text-xs', isSelected ? 'text-primary/80' : 'text-muted-foreground')}>
          {option.description}
        </span>
      )}
    </button>
  );
}
