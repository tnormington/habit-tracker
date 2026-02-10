'use client';

import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HabitSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function HabitSearch({
  value,
  onChange,
  placeholder = 'Search habits...',
}: HabitSearchProps) {
  return (
    <div className="relative" data-testid="habit-search">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9"
        data-testid="habit-search-input"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
          onClick={() => onChange('')}
          aria-label="Clear search"
          data-testid="clear-search"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
