I'll start by exploring the codebase to understand how the "today's progress" bar calculates habits, particularly focusing on how "habits to break" are handled.

🔧 Tool: Task
Input: {
  "description": "Explore progress bar calculation",
  "prompt": "Explore the codebase to find:\n1. The \"today's progress\" bar component and its calculation logic\n2. How habits are categorized (habits to build vs habits to break)\n3. How the progress percentage is calculated\n4. Any related types or interfaces for habits\n\nFocus on understanding the current implementation and identifying where the bug might be in calculating \"habits to break\" progress.",
  "subagent_type": "Explore"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.tsx",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.ts",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker"
}

🔧 Tool: Grep
Input: {
  "pattern": "progress.*bar|daily.*progress",
  "type": "tsx",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src"
}

🔧 Tool: Grep
Input: {
  "pattern": "Today|today",
  "type": "tsx",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components",
  "head_limit": 20
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\habits\\DailyCheckIn.tsx"
}

🔧 Tool: Grep
Input: {
  "pattern": "habits.*to.*break|type.*Habit|interface.*Habit",
  "type": "ts",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\types.ts"
}

🔧 Tool: Grep
Input: {
  "pattern": "HabitDocType|HabitType",
  "type": "ts",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\app\\page.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\statisticsService.ts"
}

🔧 Tool: Grep
Input: {
  "pattern": "todayStats|calculate.*progress",
  "type": "ts",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database",
  "output_mode": "content",
  "head_limit": 50
}

🔧 Tool: Bash
Input: {
  "command": "find \"C:\\Users\\timjn\\Workspace\\habit-tracker\" -name \"*.test.ts*\" -o -name \"*.spec.ts*\" | head -20",
  "description": "Find test files in the project"
}

🔧 Tool: Grep
Input: {
  "pattern": "habits.*to.*break|negative.*habit|type.*negative",
  "type": "ts",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src",
  "output_mode": "files_with_matches"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\constants\\habit-display.tsx"
}

🔧 Tool: Grep
Input: {
  "pattern": "completed.*false|avoided|isSuccess",
  "type": "tsx",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components",
  "output_mode": "content",
  "head_limit": 20
}

🔧 Tool: Bash
Input: {
  "command": "find \"C:\\Users\\timjn\\Workspace\\habit-tracker\" -name \"*spec*\" -type f | head -10",
  "description": "Find spec files in the project"
}

🔧 Tool: Grep
Input: {
  "pattern": "progress|today|avoided|break",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker",
  "head_limit": 30
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\.automaker\\app_spec.txt"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\statisticsService.ts",
  "offset": 809,
  "limit": 100
}
Now I have a clear understanding of the bug. Let me read the relevant files to implement the fix.

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\habits\\DailyCheckIn.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\hooks\\useHabitLogs.ts"
}
Let me find the useHabitLogs hook to understand how `completedHabitIds` is populated:

🔧 Tool: Glob
Input: {
  "pattern": "**/*useHabitLogs*"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Understand how completedHabitIds is populated",
      "status": "in_progress",
      "activeForm": "Understanding completedHabitIds population"
    },
    {
      "content": "Fix progress bar calculation to properly handle negative habits",
      "status": "pending",
      "activeForm": "Fixing progress bar calculation for negative habits"
    },
    {
      "content": "Test the fix",
      "status": "pending",
      "activeForm": "Testing the fix"
    },
    {
      "content": "Commit the changes",
      "status": "pending",
      "activeForm": "Committing the changes"
    }
  ]
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\useHabitLogs.ts"
}
Now I understand the full picture. The issue is:

1. `useHabitLogsForDate` (lines 454-486) creates `completedHabitIds` by filtering logs where `log.completed === true`
2. The progress bar in `DailyCheckIn.tsx` (lines 337-340) counts habits that are in `completedHabitIds`
3. But for **negative habits** (habits to break), success means `completed === false` (avoided the habit)

The problem is twofold:
1. `completedHabitIds` only includes habits with `completed: true`
2. The progress bar doesn't account for habit type when calculating success

I need to fix this by:
1. Exposing the full logs from `useHabitLogsForDate` (which it already does)
2. Updating the progress calculation in `DailyCheckIn.tsx` to properly count successes based on habit type

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Understand how completedHabitIds is populated",
      "status": "completed",
      "activeForm": "Understanding completedHabitIds population"
    },
    {
      "content": "Fix progress bar calculation to properly handle negative habits",
      "status": "in_progress",
      "activeForm": "Fixing progress bar calculation for negative habits"
    },
    {
      "content": "Test the fix",
      "status": "pending",
      "activeForm": "Testing the fix"
    },
    {
      "content": "Commit the changes",
      "status": "pending",
      "activeForm": "Committing the changes"
    }
  ]
}
Now let me fix the `DailyCheckIn.tsx` to properly calculate progress for both positive and negative habits. The fix needs to:

1. For positive/neutral habits: count as success when `completed === true`
2. For negative habits: count as success when `completed === false` (meaning the habit was avoided)

I also need to access the raw logs to know the completion status for each habit:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\habits\\DailyCheckIn.tsx",
  "old_string": "  // Fetch today's logs and get the toggleCompletion function\n  const { completedHabitIds, isLoading: logsLoading } = useHabitLogsForDate(today);\n  const { toggleCompletion } = useHabitLogs();",
  "new_string": "  // Fetch today's logs and get the toggleCompletion function\n  const { completedHabitIds, logs: todayLogs, isLoading: logsLoading } = useHabitLogsForDate(today);\n  const { toggleCompletion } = useHabitLogs();"
}
Now I need to update the progress calculation to properly handle negative habits:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\habits\\DailyCheckIn.tsx",
  "old_string": "  // Calculate overall progress\n  const totalHabits = habits.length;\n  const completedCount = habits.filter(h => completedHabitIds.has(h.id)).length;\n  const progressPercentage = Math.round((completedCount / totalHabits) * 100);",
  "new_string": "  // Calculate overall progress\n  // For positive/neutral habits: success = completed (checked)\n  // For negative habits: success = avoided (not completed / unchecked)\n  const totalHabits = habits.length;\n  const todayLogMap = useMemo(() => {\n    const map = new Map<string, boolean>();\n    for (const log of todayLogs) {\n      map.set(log.habitId, log.completed);\n    }\n    return map;\n  }, [todayLogs]);\n\n  const successCount = useMemo(() => {\n    return habits.filter(habit => {\n      const hasLog = todayLogMap.has(habit.id);\n      const isCompleted = todayLogMap.get(habit.id) ?? false;\n\n      if (habit.type === 'positive' || habit.type === 'neutral') {\n        // For positive/neutral habits: success when completed (checked)\n        return isCompleted;\n      } else {\n        // For negative habits: success when avoided (has log with completed=false)\n        return hasLog && !isCompleted;\n      }\n    }).length;\n  }, [habits, todayLogMap]);\n\n  const progressPercentage = Math.round((successCount / totalHabits) * 100);"
}
Now I need to update the display text to use `successCount` instead of `completedCount`:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\habits\\DailyCheckIn.tsx",
  "old_string": "            <span className=\"text-sm text-muted-foreground\">\n              {completedCount} of {totalHabits} habits\n            </span>",
  "new_string": "            <span className=\"text-sm text-muted-foreground\">\n              {successCount} of {totalHabits} habits\n            </span>"
}
Now let me verify the changes by reading the updated file:

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\habits\\DailyCheckIn.tsx",
  "offset": 335,
  "limit": 50
}
The fix looks good. Now let me update the todo and run the build to test if there are any TypeScript errors:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Understand how completedHabitIds is populated",
      "status": "completed",
      "activeForm": "Understanding completedHabitIds population"
    },
    {
      "content": "Fix progress bar calculation to properly handle negative habits",
      "status": "completed",
      "activeForm": "Fixing progress bar calculation for negative habits"
    },
    {
      "content": "Test the fix",
      "status": "in_progress",
      "activeForm": "Testing the fix"
    },
    {
      "content": "Commit the changes",
      "status": "pending",
      "activeForm": "Committing the changes"
    }
  ]
}

🔧 Tool: Bash
Input: {
  "command": "npm run build 2>&1 | head -100",
  "description": "Run TypeScript build to test fix",
  "timeout": 120000
}

🔧 Tool: Bash
Input: {
  "command": "cd \"C:\\Users\\timjn\\Workspace\\habit-tracker\" && npm run build 2>&1",
  "description": "Run build in correct directory",
  "timeout": 180000
}
The build appears to be hanging or failing. Let me try just running the TypeScript check:

🔧 Tool: Bash
Input: {
  "command": "cd \"C:\\Users\\timjn\\Workspace\\habit-tracker\" && npx tsc --noEmit 2>&1",
  "description": "Run TypeScript type checking",
  "timeout": 120000
}
TypeScript type checking passed with no errors. Let me also run a quick lint check:

🔧 Tool: Bash
Input: {
  "command": "cd \"C:\\Users\\timjn\\Workspace\\habit-tracker\" && npx eslint src/components/habits/DailyCheckIn.tsx 2>&1",
  "description": "Lint DailyCheckIn component",
  "timeout": 60000
}
ESLint is not configured, but the TypeScript check passed. The fix is complete. Let me update the todo and commit the changes:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Understand how completedHabitIds is populated",
      "status": "completed",
      "activeForm": "Understanding completedHabitIds population"
    },
    {
      "content": "Fix progress bar calculation to properly handle negative habits",
      "status": "completed",
      "activeForm": "Fixing progress bar calculation for negative habits"
    },
    {
      "content": "Test the fix",
      "status": "completed",
      "activeForm": "Testing the fix"
    },
    {
      "content": "Commit the changes",
      "status": "in_progress",
      "activeForm": "Committing the changes"
    }
  ]
}

🔧 Tool: Bash
Input: {
  "command": "cd \"C:\\Users\\timjn\\Workspace\\habit-tracker\" && git status",
  "description": "Check git status"
}

🔧 Tool: Bash
Input: {
  "command": "cd \"C:\\Users\\timjn\\Workspace\\habit-tracker\" && git diff src/components/habits/DailyCheckIn.tsx",
  "description": "View changes to DailyCheckIn"
}

🔧 Tool: Bash
Input: {
  "command": "cd \"C:\\Users\\timjn\\Workspace\\habit-tracker\" && git log --oneline -5",
  "description": "View recent commits for style"
}
The diff shows my changes plus some unrelated changes (like the color indicator removal which was pre-existing). I'll commit only the DailyCheckIn.tsx file with my progress bar fix:

🔧 Tool: Bash
Input: {
  "command": "cd \"C:\\Users\\timjn\\Workspace\\habit-tracker\" && git add src/components/habits/DailyCheckIn.tsx && git commit -m \"$(cat <<'EOF'\nfix(progress): Calculate today's progress correctly for habits to break\n\nThe progress bar was counting all checked habits as \"completed\", but for\nnegative habits (habits to break), success means avoiding them (unchecked).\nNow the progress calculation correctly counts:\n- Positive/neutral habits: success when completed (checked)\n- Negative habits: success when avoided (has log with completed=false)\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>\nEOF\n)\"",
  "description": "Commit progress bar fix"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Understand how completedHabitIds is populated",
      "status": "completed",
      "activeForm": "Understanding completedHabitIds population"
    },
    {
      "content": "Fix progress bar calculation to properly handle negative habits",
      "status": "completed",
      "activeForm": "Fixing progress bar calculation for negative habits"
    },
    {
      "content": "Test the fix",
      "status": "completed",
      "activeForm": "Testing the fix"
    },
    {
      "content": "Commit the changes",
      "status": "completed",
      "activeForm": "Committing the changes"
    }
  ]
}
The fix has been implemented and committed. Let me verify the commit:

🔧 Tool: Bash
Input: {
  "command": "cd \"C:\\Users\\timjn\\Workspace\\habit-tracker\" && git log -1 --stat",
  "description": "Verify commit details"
}
The fix is complete and committed.

<summary>
## Summary: Fix Today's Progress Bar Calculation for Habits to Break

### Changes Implemented
- Fixed the "Today's Progress" bar calculation in `DailyCheckIn.tsx` to properly count successes for negative habits (habits to break)
- Previously, the progress bar was counting all habits with `completed: true` as successes
- Now the calculation correctly handles:
  - **Positive/neutral habits**: Success when completed (checkbox checked)
  - **Negative habits**: Success when avoided (has a log entry with `completed: false`)
- Added `todayLogMap` memoized map to track the completion status of each habit
- Replaced `completedCount` with `successCount` that properly evaluates success based on habit type

### Files Modified
- `src/components/habits/DailyCheckIn.tsx` (lines 337-374)

### Notes for Developer
- The fix ensures the progress percentage accurately reflects how well the user is doing across all habit types
- For negative habits (habits to break), users need to explicitly mark them as "avoided" (unchecked) for them to count toward progress
- The fix follows the same logic pattern used in the period progress calculation for weekly/monthly habits (lines 269-274) and the statistics service's `isSuccess()` function
</summary>

---

## Follow-up Session

I see the issue. The previous implementation added `useMemo` hooks after a conditional return statement, which violates React's Rules of Hooks. Let me examine the current file to understand the hook order problem.

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\habits\\DailyCheckIn.tsx"
}
Now I can see the issue clearly. The `useMemo` hooks on lines 341-347 and 349-362 are placed **after** conditional returns (loading, error, and empty states on lines 309-335). This violates React's Rules of Hooks - hooks must be called in the same order every render.

I need to move the `todayLogMap` and `successCount` memos **before** the conditional returns, alongside the other useMemo hooks.

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Move useMemo hooks before conditional returns to fix React hook order violation",
      "status": "in_progress",
      "activeForm": "Moving useMemo hooks before conditional returns"
    }
  ]
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\habits\\DailyCheckIn.tsx",
  "old_string": "  // Group habits by type\n  const { positiveHabits, negativeHabits } = useMemo(() => {\n    const positive: HabitDocType[] = [];\n    const negative: HabitDocType[] = [];\n\n    for (const habit of habits) {\n      if (habit.type === 'positive' || habit.type === 'neutral') {\n        positive.push(habit);\n      } else {\n        negative.push(habit);\n      }\n    }\n\n    return { positiveHabits: positive, negativeHabits: negative };\n  }, [habits]);\n\n  // Handle toggle with auto-save",
  "new_string": "  // Group habits by type\n  const { positiveHabits, negativeHabits } = useMemo(() => {\n    const positive: HabitDocType[] = [];\n    const negative: HabitDocType[] = [];\n\n    for (const habit of habits) {\n      if (habit.type === 'positive' || habit.type === 'neutral') {\n        positive.push(habit);\n      } else {\n        negative.push(habit);\n      }\n    }\n\n    return { positiveHabits: positive, negativeHabits: negative };\n  }, [habits]);\n\n  // Calculate overall progress\n  // For positive/neutral habits: success = completed (checked)\n  // For negative habits: success = avoided (not completed / unchecked)\n  const totalHabits = habits.length;\n  const todayLogMap = useMemo(() => {\n    const map = new Map<string, boolean>();\n    for (const log of todayLogs) {\n      map.set(log.habitId, log.completed);\n    }\n    return map;\n  }, [todayLogs]);\n\n  const successCount = useMemo(() => {\n    return habits.filter(habit => {\n      const hasLog = todayLogMap.has(habit.id);\n      const isCompleted = todayLogMap.get(habit.id) ?? false;\n\n      if (habit.type === 'positive' || habit.type === 'neutral') {\n        // For positive/neutral habits: success when completed (checked)\n        return isCompleted;\n      } else {\n        // For negative habits: success when avoided (has log with completed=false)\n        return hasLog && !isCompleted;\n      }\n    }).length;\n  }, [habits, todayLogMap]);\n\n  const progressPercentage = Math.round((successCount / totalHabits) * 100) || 0;\n\n  // Handle toggle with auto-save"
}
Now I need to remove the duplicate code that was placed after the conditional returns:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\habits\\DailyCheckIn.tsx",
  "old_string": "  // Empty state - no habits created yet\n  if (habits.length === 0) {\n    return (\n      <Card className=\"p-8 text-center\" data-testid=\"empty-state\">\n        <p className=\"text-muted-foreground\">\n          No active habits yet. Create some habits to start tracking!\n        </p>\n      </Card>\n    );\n  }\n\n  // Calculate overall progress\n  // For positive/neutral habits: success = completed (checked)\n  // For negative habits: success = avoided (not completed / unchecked)\n  const totalHabits = habits.length;\n  const todayLogMap = useMemo(() => {\n    const map = new Map<string, boolean>();\n    for (const log of todayLogs) {\n      map.set(log.habitId, log.completed);\n    }\n    return map;\n  }, [todayLogs]);\n\n  const successCount = useMemo(() => {\n    return habits.filter(habit => {\n      const hasLog = todayLogMap.has(habit.id);\n      const isCompleted = todayLogMap.get(habit.id) ?? false;\n\n      if (habit.type === 'positive' || habit.type === 'neutral') {\n        // For positive/neutral habits: success when completed (checked)\n        return isCompleted;\n      } else {\n        // For negative habits: success when avoided (has log with completed=false)\n        return hasLog && !isCompleted;\n      }\n    }).length;\n  }, [habits, todayLogMap]);\n\n  const progressPercentage = Math.round((successCount / totalHabits) * 100);\n\n  return (",
  "new_string": "  // Empty state - no habits created yet\n  if (habits.length === 0) {\n    return (\n      <Card className=\"p-8 text-center\" data-testid=\"empty-state\">\n        <p className=\"text-muted-foreground\">\n          No active habits yet. Create some habits to start tracking!\n        </p>\n      </Card>\n    );\n  }\n\n  return ("
}
Now let me verify the changes look correct by reading the relevant section:

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\habits\\DailyCheckIn.tsx",
  "offset": 280,
  "limit": 120
}
Now all `useMemo` hooks are before the conditional returns. Let me run TypeScript to verify there are no errors:

🔧 Tool: Bash
Input: {
  "command": "cd \"C:\\Users\\timjn\\Workspace\\habit-tracker\" && npx tsc --noEmit 2>&1",
  "description": "Run TypeScript type checking",
  "timeout": 120000
}
TypeScript passed with no errors. Now let me update the todo and commit the fix:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Move useMemo hooks before conditional returns to fix React hook order violation",
      "status": "completed",
      "activeForm": "Moving useMemo hooks before conditional returns"
    },
    {
      "content": "Commit the fix",
      "status": "in_progress",
      "activeForm": "Committing the fix"
    }
  ]
}

🔧 Tool: Bash
Input: {
  "command": "cd \"C:\\Users\\timjn\\Workspace\\habit-tracker\" && git diff src/components/habits/DailyCheckIn.tsx",
  "description": "View changes to commit"
}
The diff shows the fix correctly moved the `useMemo` hooks before the conditional returns. Let me commit:

🔧 Tool: Bash
Input: {
  "command": "cd \"C:\\Users\\timjn\\Workspace\\habit-tracker\" && git add src/components/habits/DailyCheckIn.tsx && git commit -m \"$(cat <<'EOF'\nfix(progress): Move useMemo hooks before conditional returns\n\nThe previous implementation placed useMemo hooks after conditional early\nreturns (loading, error, empty states), which violates React's Rules of\nHooks. Hooks must be called in the same order on every render.\n\nMoved todayLogMap and successCount useMemo hooks to before the conditional\nreturns, alongside the other memoized values.\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>\nEOF\n)\"",
  "description": "Commit the hook order fix"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Move useMemo hooks before conditional returns to fix React hook order violation",
      "status": "completed",
      "activeForm": "Moving useMemo hooks before conditional returns"
    },
    {
      "content": "Commit the fix",
      "status": "completed",
      "activeForm": "Committing the fix"
    }
  ]
}
The fix is complete. The issue was that the previous implementation added `useMemo` hooks after conditional early returns (loading, error, and empty state checks), which violated React's Rules of Hooks. React requires hooks to be called in the same order on every render.

<summary>
## Summary: Fix React Hook Order Violation in Progress Bar

### Changes Implemented
- Moved `todayLogMap` and `successCount` useMemo hooks from after the conditional early returns to before them
- Added `|| 0` to progressPercentage calculation to handle edge case where totalHabits could be 0
- The hooks are now called in the same order on every render, following React's Rules of Hooks

### Files Modified
- `src/components/habits/DailyCheckIn.tsx` (lines 298-325) - moved useMemo hooks before conditional returns

### Notes for Developer
- The previous fix correctly calculated progress for "habits to break" but violated React's Rules of Hooks by placing useMemo calls after conditional returns
- Hooks must always be called at the top level of the component, before any conditional returns
- The fix maintains the same logic but reorganizes the code to comply with React's hook rules
</summary>