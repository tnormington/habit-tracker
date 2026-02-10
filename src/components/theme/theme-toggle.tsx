"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

interface ThemeOption {
  value: Theme;
  label: string;
  icon: typeof Sun;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "Always use light mode",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Always use dark mode",
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    description: "Follow your system setting",
  },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid gap-2">
      {themeOptions.map((option) => {
        const isSelected = theme === option.value;
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-accent"
            )}
          >
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-md",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <option.icon className="size-5" />
            </div>
            <div className="flex-1">
              <div
                className={cn(
                  "font-medium",
                  isSelected && "text-primary"
                )}
              >
                {option.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {option.description}
              </div>
            </div>
            {isSelected && (
              <div className="size-2 rounded-full bg-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}
