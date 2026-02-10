'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Callback when the checked state changes */
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(event.target.checked);
    };

    return (
      <label
        className={cn(
          'relative inline-flex size-5 items-center justify-center',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && 'cursor-pointer'
        )}
      >
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <span
          className={cn(
            'flex size-5 items-center justify-center rounded border-2 transition-colors',
            checked
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input bg-background',
            !disabled && !checked && 'hover:border-primary/50',
            className
          )}
          aria-hidden="true"
        >
          {checked && <Check className="size-3.5" strokeWidth={3} />}
        </span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
