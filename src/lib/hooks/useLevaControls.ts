"use client";

import { useControls, folder } from "leva";

/**
 * Hook to expose application-wide tweakable parameters via Leva.
 *
 * This hook creates a centralized set of controls that can be used
 * to adjust visual and behavioral parameters during development.
 *
 * Example usage:
 * ```tsx
 * const { animationSpeed, streakColor } = useLevaControls();
 * ```
 *
 * To add new controls:
 * 1. Add the control definition in the appropriate folder below
 * 2. Return the value from this hook
 * 3. Use the value in your component
 *
 * Control types available:
 * - number: Simple numeric input or slider
 * - boolean: Checkbox toggle
 * - string: Text input
 * - color: Color picker (use { value: "#hex" })
 * - select: Dropdown (use { value: default, options: [...] })
 * - interval: Range with [min, max] (use { value: [min, max], min, max })
 */
export function useLevaControls() {
  const values = useControls({
    Animations: folder({
      animationSpeed: {
        value: 1,
        min: 0.1,
        max: 3,
        step: 0.1,
        label: "Animation Speed",
      },
      enableAnimations: {
        value: true,
        label: "Enable Animations",
      },
    }),
    Streaks: folder({
      streakFlameColor: {
        value: "#f97316",
        label: "Flame Color",
      },
      streakMinDays: {
        value: 2,
        min: 1,
        max: 7,
        step: 1,
        label: "Min Days for Streak",
      },
    }),
    Layout: folder({
      cardBorderRadius: {
        value: 8,
        min: 0,
        max: 24,
        step: 2,
        label: "Card Border Radius",
      },
      contentPadding: {
        value: 16,
        min: 8,
        max: 32,
        step: 4,
        label: "Content Padding",
      },
    }),
    Debug: folder(
      {
        showDebugInfo: {
          value: false,
          label: "Show Debug Info",
        },
        logRenders: {
          value: false,
          label: "Log Renders",
        },
      },
      { collapsed: true }
    ),
  });

  return values;
}

/**
 * Hook for component-specific Leva controls.
 *
 * Use this pattern to create isolated control folders for specific components.
 *
 * Example usage:
 * ```tsx
 * const { opacity, scale } = useComponentControls("MyComponent", {
 *   opacity: { value: 1, min: 0, max: 1 },
 *   scale: { value: 1, min: 0.5, max: 2 },
 * });
 * ```
 */
export function useComponentControls<T extends Record<string, unknown>>(
  componentName: string,
  schema: T
) {
  return useControls(componentName, schema);
}
