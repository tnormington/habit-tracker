'use client';

/**
 * Centralized display configuration for habits.
 * This file contains display labels, icons, and styling for habit properties.
 * Following DRY principles - used across forms, cards, and filters.
 */

import * as React from 'react';
import {
  Heart,
  Dumbbell,
  Target,
  Brain,
  BookOpen,
  Users,
  DollarSign,
  Palette,
  MoreHorizontal,
  CalendarDays,
  CalendarRange,
  Calendar,
  TrendingUp,
  Minus,
  TrendingDown,
} from 'lucide-react';
import type { HabitCategory, HabitColor, HabitType, HabitFrequency } from '@/lib/database/types';

/**
 * Category display configuration with icons
 */
export const CATEGORY_DISPLAY: Record<
  HabitCategory,
  { label: string; icon: React.ReactNode }
> = {
  health: { label: 'Health', icon: <Heart className="size-5" /> },
  fitness: { label: 'Fitness', icon: <Dumbbell className="size-5" /> },
  productivity: { label: 'Productivity', icon: <Target className="size-5" /> },
  mindfulness: { label: 'Mindfulness', icon: <Brain className="size-5" /> },
  learning: { label: 'Learning', icon: <BookOpen className="size-5" /> },
  social: { label: 'Social', icon: <Users className="size-5" /> },
  finance: { label: 'Finance', icon: <DollarSign className="size-5" /> },
  creativity: { label: 'Creativity', icon: <Palette className="size-5" /> },
  other: { label: 'Other', icon: <MoreHorizontal className="size-5" /> },
};

/**
 * Get category icon component for custom sizing
 */
export const CATEGORY_ICONS: Record<HabitCategory, React.ComponentType<{ className?: string }>> = {
  health: Heart,
  fitness: Dumbbell,
  productivity: Target,
  mindfulness: Brain,
  learning: BookOpen,
  social: Users,
  finance: DollarSign,
  creativity: Palette,
  other: MoreHorizontal,
};

/**
 * Color display configuration
 */
export const COLOR_DISPLAY: Record<HabitColor, { label: string; bgClass: string }> = {
  red: { label: 'Red', bgClass: 'bg-red-500' },
  orange: { label: 'Orange', bgClass: 'bg-orange-500' },
  yellow: { label: 'Yellow', bgClass: 'bg-yellow-500' },
  green: { label: 'Green', bgClass: 'bg-green-500' },
  blue: { label: 'Blue', bgClass: 'bg-blue-500' },
  purple: { label: 'Purple', bgClass: 'bg-purple-500' },
  pink: { label: 'Pink', bgClass: 'bg-pink-500' },
  gray: { label: 'Gray', bgClass: 'bg-gray-500' },
};

/**
 * Type display configuration with icons
 */
export const TYPE_DISPLAY: Record<
  HabitType,
  { label: string; description: string; icon: React.ReactNode }
> = {
  positive: { label: 'Positive', description: 'A habit to build', icon: <TrendingUp className="size-5" /> },
  neutral: { label: 'Neutral', description: 'Track without judgment', icon: <Minus className="size-5" /> },
  negative: { label: 'Negative', description: 'A habit to break', icon: <TrendingDown className="size-5" /> },
};

/**
 * Get type icon component for custom sizing
 */
export const TYPE_ICONS: Record<HabitType, React.ComponentType<{ className?: string }>> = {
  positive: TrendingUp,
  neutral: Minus,
  negative: TrendingDown,
};

/**
 * Frequency display configuration with icons
 */
export const FREQUENCY_DISPLAY: Record<
  HabitFrequency,
  { label: string; description: string; icon: React.ReactNode }
> = {
  daily: { label: 'Daily', description: 'Every day', icon: <CalendarDays className="size-5" /> },
  weekly: { label: 'Weekly', description: 'Once per week', icon: <CalendarRange className="size-5" /> },
  monthly: { label: 'Monthly', description: 'Once per month', icon: <Calendar className="size-5" /> },
};

/**
 * Get frequency icon component for custom sizing
 */
export const FREQUENCY_ICONS: Record<HabitFrequency, React.ComponentType<{ className?: string }>> = {
  daily: CalendarDays,
  weekly: CalendarRange,
  monthly: Calendar,
};
