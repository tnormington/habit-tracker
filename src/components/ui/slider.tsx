'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  /** Current value of the slider */
  value?: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Callback when the value changes */
  onValueChange?: (value: number) => void;
  /** Show value label */
  showValue?: boolean;
  /** Format the value for display */
  formatValue?: (value: number) => string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value = 1,
      min = 1,
      max = 7,
      step = 1,
      onValueChange,
      showValue = true,
      formatValue = (v) => String(v),
      disabled,
      ...props
    },
    ref
  ) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(event.target.value);
      onValueChange?.(newValue);
    };

    // Calculate the percentage for the filled track
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className={cn('relative flex items-center gap-4', className)}>
        <div className="relative flex-1">
          {/* Visual track overlay - displays behind the input */}
          <div
            className="absolute inset-0 h-2 rounded-full pointer-events-none"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, var(--secondary) ${percentage}%, var(--secondary) 100%)`,
            }}
          />
          <input
            type="range"
            ref={ref}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
              'relative w-full h-2 appearance-none rounded-full cursor-pointer bg-transparent',
              '[&::-webkit-slider-runnable-track]:h-2',
              '[&::-webkit-slider-runnable-track]:rounded-full',
              '[&::-webkit-slider-runnable-track]:bg-transparent',
              '[&::-moz-range-track]:h-2',
              '[&::-moz-range-track]:rounded-full',
              '[&::-moz-range-track]:bg-transparent',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-5',
              '[&::-webkit-slider-thumb]:h-5',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-primary',
              '[&::-webkit-slider-thumb]:border-2',
              '[&::-webkit-slider-thumb]:border-primary',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-webkit-slider-thumb]:transition-all',
              '[&::-webkit-slider-thumb]:hover:scale-110',
              '[&::-webkit-slider-thumb]:shadow-md',
              '[&::-moz-range-thumb]:w-5',
              '[&::-moz-range-thumb]:h-5',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-primary',
              '[&::-moz-range-thumb]:border-2',
              '[&::-moz-range-thumb]:border-primary',
              '[&::-moz-range-thumb]:cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed',
              disabled && '[&::-webkit-slider-thumb]:cursor-not-allowed',
              disabled && '[&::-moz-range-thumb]:cursor-not-allowed'
            )}
            {...props}
          />
        </div>
        {showValue && (
          <span
            className={cn(
              'min-w-[3rem] text-center text-sm font-medium tabular-nums',
              disabled && 'opacity-50'
            )}
            aria-live="polite"
          >
            {formatValue(value)}
          </span>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
