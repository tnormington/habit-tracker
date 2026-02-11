I'll implement a comprehensive statistics page for the habit tracker. Let me start by exploring the codebase to understand the existing structure.

🔧 Tool: Task
Input: {
  "description": "Explore habit tracker codebase",
  "prompt": "Explore this habit tracker codebase to understand:\n1. The overall project structure and tech stack\n2. Existing components, especially in src/components\n3. Any existing statistics or analytics code\n4. The data models for habits and completions\n5. Existing services or utilities\n6. The routing structure in src/app\n7. Any shared UI components or patterns\n\nProvide a comprehensive summary of what you find, including file paths and key patterns used.",
  "subagent_type": "Explore"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\package.json"
}

🔧 Tool: Bash
Input: {
  "command": "ls -la \"C:\\Users\\timjn\\Workspace\\habit-tracker\" | head -30",
  "description": "List root directory contents"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.tsx",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src"
}

🔧 Tool: Bash
Input: {
  "command": "find \"C:\\Users\\timjn\\Workspace\\habit-tracker\\src\" -type f -name \"*.ts\" -o -name \"*.tsx\" | head -50",
  "description": "Find all TypeScript files in src directory"
}

🔧 Tool: Glob
Input: {
  "pattern": "**/*.ts",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\types.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\schemas.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\database.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\index.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\habitService.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\statisticsService.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\streakService.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\app\\page.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\habits\\DailyCheckIn.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\layout\\app-layout.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\useHabits.ts",
  "limit": 150
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\useHabitLogs.ts",
  "limit": 150
}

🔧 Tool: Glob
Input: {
  "pattern": "src/app/**/*.tsx",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\app\\habits\\page.tsx",
  "limit": 100
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\app\\statistics\\page.tsx",
  "limit": 100
}

🔧 Tool: Glob
Input: {
  "pattern": "src/components/**/*.tsx",
  "path": "C:\\Users\\timjn\\Workspace\\habit-tracker"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\habits\\HabitCard.tsx",
  "limit": 80
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\ui\\button.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\tsconfig.json"
}
Excellent! Now I have a comprehensive understanding of the codebase. Let me check the existing statistics page and any related components to understand what's already there.

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\app\\statistics\\page.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\statisticsService.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\hooks\\useStatistics.ts"
}
Let me find the useStatistics hook:

🔧 Tool: Glob
Input: {
  "pattern": "**/useStatistics.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\hooks\\index.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\ui\\card.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\useStatistics.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\index.ts"
}
Now let me check some existing components to understand UI patterns:

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\app\\page.tsx"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\ui\\select.tsx"
}
Now I have a comprehensive understanding of the codebase. Let me create a todo list and start implementing the comprehensive statistics page.

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Extend statistics service with time period filtering (week, month, year, all-time)",
      "status": "in_progress",
      "activeForm": "Extending statistics service with time period filtering"
    },
    {
      "content": "Create hooks for period-filtered statistics",
      "status": "pending",
      "activeForm": "Creating hooks for period-filtered statistics"
    },
    {
      "content": "Build comprehensive statistics page with all sections",
      "status": "pending",
      "activeForm": "Building comprehensive statistics page"
    },
    {
      "content": "Add time period filter UI (select component)",
      "status": "pending",
      "activeForm": "Adding time period filter UI"
    },
    {
      "content": "Implement best performing habits section",
      "status": "pending",
      "activeForm": "Implementing best performing habits section"
    },
    {
      "content": "Implement patterns and trends section",
      "status": "pending",
      "activeForm": "Implementing patterns and trends section"
    },
    {
      "content": "Add motivational insights section",
      "status": "pending",
      "activeForm": "Adding motivational insights section"
    },
    {
      "content": "Test the statistics page with Playwright",
      "status": "pending",
      "activeForm": "Testing statistics page with Playwright"
    },
    {
      "content": "Commit changes",
      "status": "pending",
      "activeForm": "Committing changes"
    }
  ]
}
Let me first extend the statistics service to support time period filtering:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\statisticsService.ts",
  "old_string": "/**\n * Weekly trend data point\n */\nexport interface WeeklyTrendPoint {\n  /** Week start date (YYYY-MM-DD) */\n  weekStart: string;\n  /** Week end date (YYYY-MM-DD) */\n  weekEnd: string;\n  /** Number of completions */\n  completions: number;\n  /** Total possible completions (habits * days) */\n  totalPossible: number;\n  /** Completion rate (0-100) */\n  rate: number;\n}",
  "new_string": "/**\n * Weekly trend data point\n */\nexport interface WeeklyTrendPoint {\n  /** Week start date (YYYY-MM-DD) */\n  weekStart: string;\n  /** Week end date (YYYY-MM-DD) */\n  weekEnd: string;\n  /** Number of completions */\n  completions: number;\n  /** Total possible completions (habits * days) */\n  totalPossible: number;\n  /** Completion rate (0-100) */\n  rate: number;\n}\n\n/**\n * Time period for filtering statistics\n */\nexport type StatisticsPeriod = 'week' | 'month' | 'year' | 'all';\n\n/**\n * Statistics for a time period\n */\nexport interface PeriodStatistics {\n  /** The time period */\n  period: StatisticsPeriod;\n  /** Start date of the period */\n  startDate: string;\n  /** End date of the period */\n  endDate: string;\n  /** Total completions in the period */\n  totalCompletions: number;\n  /** Total possible completions */\n  totalPossible: number;\n  /** Completion rate (0-100) */\n  completionRate: number;\n  /** Completions by day of week */\n  completionsByDayOfWeek: Record<DayOfWeek, number>;\n  /** Tracked days by day of week */\n  trackedDaysByDayOfWeek: Record<DayOfWeek, number>;\n  /** Best performing habits */\n  bestPerformingHabits: Array<{\n    habitId: string;\n    habitName: string;\n    completionRate: number;\n    totalCompletions: number;\n    totalTracked: number;\n  }>;\n  /** Worst performing habits (for improvement) */\n  needsImprovementHabits: Array<{\n    habitId: string;\n    habitName: string;\n    completionRate: number;\n    totalCompletions: number;\n    totalTracked: number;\n  }>;\n  /** Habits by category performance */\n  categoryPerformance: Record<HabitCategory, { completions: number; total: number; rate: number }>;\n  /** Daily completion trend */\n  dailyTrend: Array<{ date: string; completions: number; total: number; rate: number }>;\n  /** Total active days (days with any activity) */\n  totalActiveDays: number;\n  /** Average daily completion rate */\n  avgDailyCompletionRate: number;\n}"
}
Now let me add the period statistics function at the end of the file:

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\statisticsService.ts",
  "offset": 860
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\statisticsService.ts",
  "old_string": "    return {\n      success: false,\n      error: new StatisticsServiceError(\n        'Failed to get completion stats for date',\n        StatisticsServiceErrorCode.OPERATION_FAILED,\n        error\n      ),\n    };\n  }\n}",
  "new_string": "    return {\n      success: false,\n      error: new StatisticsServiceError(\n        'Failed to get completion stats for date',\n        StatisticsServiceErrorCode.OPERATION_FAILED,\n        error\n      ),\n    };\n  }\n}\n\n/**\n * Get the start date for a given period\n */\nfunction getPeriodStartDate(period: StatisticsPeriod): string {\n  const now = new Date();\n\n  switch (period) {\n    case 'week': {\n      const dayOfWeek = now.getDay();\n      const startOfWeek = new Date(now);\n      startOfWeek.setDate(now.getDate() - dayOfWeek);\n      return startOfWeek.toISOString().split('T')[0];\n    }\n    case 'month': {\n      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);\n      return startOfMonth.toISOString().split('T')[0];\n    }\n    case 'year': {\n      const startOfYear = new Date(now.getFullYear(), 0, 1);\n      return startOfYear.toISOString().split('T')[0];\n    }\n    case 'all':\n    default:\n      return '1970-01-01';\n  }\n}\n\n/**\n * Get the number of days in the period (for calculating possible completions)\n */\nfunction getDaysInPeriod(period: StatisticsPeriod, startDate: string, endDate: string): number {\n  const start = new Date(startDate);\n  const end = new Date(endDate);\n  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;\n}\n\n/**\n * Get statistics for a specific time period\n *\n * @param period - The time period to calculate statistics for\n * @returns Promise with period statistics\n */\nexport async function getPeriodStatistics(\n  period: StatisticsPeriod\n): Promise<StatisticsServiceResult<PeriodStatistics>> {\n  try {\n    const db = await getDatabaseOrThrow();\n    const today = getTodayDate();\n    const startDate = period === 'all' ? '' : getPeriodStartDate(period);\n    const endDate = today;\n\n    // Get active habits\n    const activeHabits = await db.habits\n      .find({ selector: { isArchived: false } })\n      .exec();\n    const habitsData = activeHabits.map((doc) => doc.toJSON() as HabitDocType);\n    const habitMap = new Map<string, HabitDocType>();\n    for (const habit of habitsData) {\n      habitMap.set(habit.id, habit);\n    }\n\n    // Get logs for the period\n    const logsQuery = period === 'all'\n      ? db.habit_logs.find()\n      : db.habit_logs.find({\n          selector: {\n            date: {\n              $gte: startDate,\n              $lte: endDate,\n            },\n          },\n        });\n\n    const logs = await logsQuery.exec();\n    const logsData = logs.map((doc) => doc.toJSON() as HabitLogDocType);\n\n    // Filter logs for active habits only\n    const activeHabitIds = new Set(habitsData.map((h) => h.id));\n    const activeLogs = logsData.filter((log) => activeHabitIds.has(log.habitId));\n\n    // Calculate statistics\n    const completionsByDayOfWeek = initDayOfWeekCounts();\n    const trackedDaysByDayOfWeek = initDayOfWeekCounts();\n    const habitStats = new Map<string, { completions: number; total: number }>();\n    const categoryStats = new Map<HabitCategory, { completions: number; total: number }>();\n    const dailyStats = new Map<string, { completions: number; total: number }>();\n    const activeDates = new Set<string>();\n\n    let totalCompletions = 0;\n\n    for (const log of activeLogs) {\n      const habit = habitMap.get(log.habitId);\n      if (!habit) continue;\n\n      const dayOfWeek = getDayOfWeek(log.date);\n      trackedDaysByDayOfWeek[dayOfWeek]++;\n      activeDates.add(log.date);\n\n      // Habit stats\n      const hs = habitStats.get(log.habitId) ?? { completions: 0, total: 0 };\n      hs.total++;\n\n      // Category stats\n      const cs = categoryStats.get(habit.category) ?? { completions: 0, total: 0 };\n      cs.total++;\n\n      // Daily stats\n      const ds = dailyStats.get(log.date) ?? { completions: 0, total: 0 };\n      ds.total++;\n\n      if (isSuccess(log.completed, habit.type)) {\n        totalCompletions++;\n        completionsByDayOfWeek[dayOfWeek]++;\n        hs.completions++;\n        cs.completions++;\n        ds.completions++;\n      }\n\n      habitStats.set(log.habitId, hs);\n      categoryStats.set(habit.category, cs);\n      dailyStats.set(log.date, ds);\n    }\n\n    // Calculate total possible and completion rate\n    const actualStartDate = period === 'all'\n      ? (activeLogs.length > 0 ? activeLogs.reduce((min, l) => l.date < min ? l.date : min, activeLogs[0].date) : today)\n      : startDate;\n    const totalPossible = activeLogs.length;\n    const completionRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;\n\n    // Calculate best and worst performing habits\n    const habitPerformance = Array.from(habitStats.entries())\n      .map(([habitId, stats]) => ({\n        habitId,\n        habitName: habitMap.get(habitId)?.name ?? 'Unknown',\n        completionRate: stats.total > 0 ? Math.round((stats.completions / stats.total) * 100) : 0,\n        totalCompletions: stats.completions,\n        totalTracked: stats.total,\n      }))\n      .filter((h) => h.totalTracked >= 1);\n\n    const bestPerformingHabits = [...habitPerformance]\n      .sort((a, b) => b.completionRate - a.completionRate || b.totalCompletions - a.totalCompletions)\n      .slice(0, 5);\n\n    const needsImprovementHabits = [...habitPerformance]\n      .sort((a, b) => a.completionRate - b.completionRate || a.totalCompletions - b.totalCompletions)\n      .slice(0, 5);\n\n    // Calculate category performance\n    const categoryPerformance: Record<HabitCategory, { completions: number; total: number; rate: number }> = {\n      health: { completions: 0, total: 0, rate: 0 },\n      fitness: { completions: 0, total: 0, rate: 0 },\n      productivity: { completions: 0, total: 0, rate: 0 },\n      mindfulness: { completions: 0, total: 0, rate: 0 },\n      learning: { completions: 0, total: 0, rate: 0 },\n      social: { completions: 0, total: 0, rate: 0 },\n      finance: { completions: 0, total: 0, rate: 0 },\n      creativity: { completions: 0, total: 0, rate: 0 },\n      other: { completions: 0, total: 0, rate: 0 },\n    };\n\n    for (const [category, stats] of categoryStats.entries()) {\n      categoryPerformance[category] = {\n        completions: stats.completions,\n        total: stats.total,\n        rate: stats.total > 0 ? Math.round((stats.completions / stats.total) * 100) : 0,\n      };\n    }\n\n    // Calculate daily trend\n    const dailyTrend = Array.from(dailyStats.entries())\n      .map(([date, stats]) => ({\n        date,\n        completions: stats.completions,\n        total: stats.total,\n        rate: stats.total > 0 ? Math.round((stats.completions / stats.total) * 100) : 0,\n      }))\n      .sort((a, b) => a.date.localeCompare(b.date));\n\n    // Calculate average daily completion rate\n    const avgDailyCompletionRate = dailyTrend.length > 0\n      ? Math.round(dailyTrend.reduce((sum, d) => sum + d.rate, 0) / dailyTrend.length)\n      : 0;\n\n    return {\n      success: true,\n      data: {\n        period,\n        startDate: actualStartDate,\n        endDate,\n        totalCompletions,\n        totalPossible,\n        completionRate,\n        completionsByDayOfWeek,\n        trackedDaysByDayOfWeek,\n        bestPerformingHabits,\n        needsImprovementHabits,\n        categoryPerformance,\n        dailyTrend,\n        totalActiveDays: activeDates.size,\n        avgDailyCompletionRate,\n      },\n    };\n  } catch (error) {\n    if (error instanceof StatisticsServiceError) {\n      return { success: false, error };\n    }\n    return {\n      success: false,\n      error: new StatisticsServiceError(\n        'Failed to get period statistics',\n        StatisticsServiceErrorCode.OPERATION_FAILED,\n        error\n      ),\n    };\n  }\n}"
}
Now let me update the exports in the index.ts file:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\index.ts",
  "old_string": "// Statistics Service Functions\nexport {\n  // Single habit statistics\n  getHabitStatistics,\n  getStatisticsForHabits,\n  // Dashboard statistics\n  getDashboardStatistics,\n  // Trends\n  getWeeklyTrends,\n  // Date-specific stats\n  getCompletionStatsForDate,\n  // Constants\n  DAY_NAMES,\n  DAY_NAMES_SHORT,\n  // Error class and codes\n  StatisticsServiceError,\n  StatisticsServiceErrorCode,\n} from './statisticsService';\n\nexport type {\n  DayOfWeek,\n  HabitStatistics,\n  DashboardStatistics,\n  WeeklyTrendPoint,\n  StatisticsServiceResult,\n} from './statisticsService';",
  "new_string": "// Statistics Service Functions\nexport {\n  // Single habit statistics\n  getHabitStatistics,\n  getStatisticsForHabits,\n  // Dashboard statistics\n  getDashboardStatistics,\n  // Trends\n  getWeeklyTrends,\n  // Date-specific stats\n  getCompletionStatsForDate,\n  // Period statistics\n  getPeriodStatistics,\n  // Constants\n  DAY_NAMES,\n  DAY_NAMES_SHORT,\n  // Error class and codes\n  StatisticsServiceError,\n  StatisticsServiceErrorCode,\n} from './statisticsService';\n\nexport type {\n  DayOfWeek,\n  HabitStatistics,\n  DashboardStatistics,\n  WeeklyTrendPoint,\n  StatisticsServiceResult,\n  StatisticsPeriod,\n  PeriodStatistics,\n} from './statisticsService';"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Extend statistics service with time period filtering (week, month, year, all-time)",
      "status": "completed",
      "activeForm": "Extending statistics service with time period filtering"
    },
    {
      "content": "Create hooks for period-filtered statistics",
      "status": "in_progress",
      "activeForm": "Creating hooks for period-filtered statistics"
    },
    {
      "content": "Build comprehensive statistics page with all sections",
      "status": "pending",
      "activeForm": "Building comprehensive statistics page"
    },
    {
      "content": "Add time period filter UI (select component)",
      "status": "pending",
      "activeForm": "Adding time period filter UI"
    },
    {
      "content": "Implement best performing habits section",
      "status": "pending",
      "activeForm": "Implementing best performing habits section"
    },
    {
      "content": "Implement patterns and trends section",
      "status": "pending",
      "activeForm": "Implementing patterns and trends section"
    },
    {
      "content": "Add motivational insights section",
      "status": "pending",
      "activeForm": "Adding motivational insights section"
    },
    {
      "content": "Test the statistics page with Playwright",
      "status": "pending",
      "activeForm": "Testing statistics page with Playwright"
    },
    {
      "content": "Commit changes",
      "status": "pending",
      "activeForm": "Committing changes"
    }
  ]
}
Now let me add the hook for period statistics to the useStatistics file:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\useStatistics.ts",
  "old_string": "import {\n  getHabitStatistics,\n  getDashboardStatistics,\n  getWeeklyTrends,\n  getCompletionStatsForDate,\n  type HabitStatistics,\n  type DashboardStatistics,\n  type WeeklyTrendPoint,\n} from './statisticsService';",
  "new_string": "import {\n  getHabitStatistics,\n  getDashboardStatistics,\n  getWeeklyTrends,\n  getCompletionStatsForDate,\n  getPeriodStatistics,\n  type HabitStatistics,\n  type DashboardStatistics,\n  type WeeklyTrendPoint,\n  type StatisticsPeriod,\n  type PeriodStatistics,\n} from './statisticsService';"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\useStatistics.ts",
  "old_string": "export interface UseDateCompletionStatsResult {\n  /** Completion stats for the date */\n  stats: {\n    completed: number;\n    total: number;\n    rate: number;\n    habits: Array<{ habitId: string; habitName: string; completed: boolean }>;\n  } | null;\n  /** Whether the data is loading */\n  isLoading: boolean;\n  /** Error if any occurred */\n  error: Error | null;\n  /** Manually refresh the data */\n  refresh: () => Promise<void>;\n}",
  "new_string": "export interface UseDateCompletionStatsResult {\n  /** Completion stats for the date */\n  stats: {\n    completed: number;\n    total: number;\n    rate: number;\n    habits: Array<{ habitId: string; habitName: string; completed: boolean }>;\n  } | null;\n  /** Whether the data is loading */\n  isLoading: boolean;\n  /** Error if any occurred */\n  error: Error | null;\n  /** Manually refresh the data */\n  refresh: () => Promise<void>;\n}\n\nexport interface UsePeriodStatisticsResult {\n  /** Statistics for the selected period */\n  statistics: PeriodStatistics | null;\n  /** Whether the data is loading */\n  isLoading: boolean;\n  /** Error if any occurred */\n  error: Error | null;\n  /** Manually refresh the data */\n  refresh: () => Promise<void>;\n}"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\useStatistics.ts",
  "offset": 380
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\useStatistics.ts",
  "old_string": "  return { stats, isLoading, error, refresh };\n}",
  "new_string": "  return { stats, isLoading, error, refresh };\n}\n\n/**\n * Hook to get statistics for a specific time period\n *\n * @param period - The time period ('week', 'month', 'year', 'all')\n * @returns Period statistics, loading state, error, and refresh function\n *\n * @example\n * ```tsx\n * function PeriodStatsDisplay() {\n *   const [period, setPeriod] = useState<StatisticsPeriod>('month');\n *   const { statistics, isLoading, error } = usePeriodStatistics(period);\n *\n *   if (isLoading) return <div>Loading...</div>;\n *   if (error) return <div>Error: {error.message}</div>;\n *   if (!statistics) return null;\n *\n *   return (\n *     <div>\n *       <span>Completion rate: {statistics.completionRate}%</span>\n *       <span>Total completions: {statistics.totalCompletions}</span>\n *     </div>\n *   );\n * }\n * ```\n */\nexport function usePeriodStatistics(\n  period: StatisticsPeriod\n): UsePeriodStatisticsResult {\n  const { database, isReady } = useDatabase();\n  const [statistics, setStatistics] = useState<PeriodStatistics | null>(null);\n  const [isLoading, setIsLoading] = useState(true);\n  const [error, setError] = useState<Error | null>(null);\n\n  const refresh = useCallback(async () => {\n    if (!isReady || !database) {\n      setStatistics(null);\n      setIsLoading(false);\n      return;\n    }\n\n    setIsLoading(true);\n    setError(null);\n\n    try {\n      const result = await getPeriodStatistics(period);\n      if (result.success && result.data) {\n        setStatistics(result.data);\n      } else {\n        setError(result.error ?? new Error('Failed to get period statistics'));\n        setStatistics(null);\n      }\n    } catch (err) {\n      setError(err instanceof Error ? err : new Error('Unknown error'));\n      setStatistics(null);\n    } finally {\n      setIsLoading(false);\n    }\n  }, [isReady, database, period]);\n\n  // Initial load\n  useEffect(() => {\n    refresh();\n  }, [refresh]);\n\n  // Subscribe to habit and habit log changes\n  useEffect(() => {\n    if (!database || !isReady) return;\n\n    // Subscribe to habit changes\n    const habitsSubscription = database.habits.find().$.subscribe(() => {\n      refresh();\n    });\n\n    // Subscribe to habit log changes\n    const logsSubscription = database.habit_logs.find().$.subscribe(() => {\n      refresh();\n    });\n\n    return () => {\n      habitsSubscription.unsubscribe();\n      logsSubscription.unsubscribe();\n    };\n  }, [database, isReady, refresh]);\n\n  return { statistics, isLoading, error, refresh };\n}"
}
Now let me update the index.ts to export the new hook and types:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\lib\\database\\index.ts",
  "old_string": "// React hooks - Statistics\nexport {\n  useHabitStatistics,\n  useDashboardStatistics,\n  useWeeklyTrends,\n  useDateCompletionStats,\n} from './useStatistics';\n\nexport type {\n  UseHabitStatisticsResult,\n  UseDashboardStatisticsResult,\n  UseWeeklyTrendsResult,\n  UseDateCompletionStatsResult,\n} from './useStatistics';",
  "new_string": "// React hooks - Statistics\nexport {\n  useHabitStatistics,\n  useDashboardStatistics,\n  useWeeklyTrends,\n  useDateCompletionStats,\n  usePeriodStatistics,\n} from './useStatistics';\n\nexport type {\n  UseHabitStatisticsResult,\n  UseDashboardStatisticsResult,\n  UseWeeklyTrendsResult,\n  UseDateCompletionStatsResult,\n  UsePeriodStatisticsResult,\n} from './useStatistics';"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Extend statistics service with time period filtering (week, month, year, all-time)",
      "status": "completed",
      "activeForm": "Extending statistics service with time period filtering"
    },
    {
      "content": "Create hooks for period-filtered statistics",
      "status": "completed",
      "activeForm": "Creating hooks for period-filtered statistics"
    },
    {
      "content": "Build comprehensive statistics page with all sections",
      "status": "in_progress",
      "activeForm": "Building comprehensive statistics page"
    },
    {
      "content": "Test the statistics page with Playwright",
      "status": "pending",
      "activeForm": "Testing statistics page with Playwright"
    },
    {
      "content": "Commit changes",
      "status": "pending",
      "activeForm": "Committing changes"
    }
  ]
}
Now let me build the comprehensive statistics page. I'll rewrite the existing page with all the new features:

🔧 Tool: Write
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\app\\statistics\\page.tsx",
  "content": "'use client';\n\nimport { useState, useMemo } from 'react';\nimport {\n  Card,\n  CardContent,\n  CardDescription,\n  CardHeader,\n  CardTitle,\n} from '@/components/ui/card';\nimport {\n  Select,\n  SelectContent,\n  SelectItem,\n  SelectTrigger,\n  SelectValue,\n} from '@/components/ui/select';\nimport {\n  usePeriodStatistics,\n  useDashboardStatistics,\n  useWeeklyTrends,\n  DAY_NAMES_SHORT,\n  DAY_NAMES,\n  type DayOfWeek,\n  type StatisticsPeriod,\n} from '@/lib/database';\nimport {\n  TrendingUp,\n  TrendingDown,\n  Trophy,\n  Target,\n  Flame,\n  Calendar,\n  BarChart3,\n  Award,\n  AlertCircle,\n  Sparkles,\n  Loader2,\n  Activity,\n  CheckCircle2,\n} from 'lucide-react';\nimport { cn } from '@/lib/utils';\n\n// Category display labels\nconst CATEGORY_LABELS: Record<string, string> = {\n  health: 'Health',\n  fitness: 'Fitness',\n  productivity: 'Productivity',\n  mindfulness: 'Mindfulness',\n  learning: 'Learning',\n  social: 'Social',\n  finance: 'Finance',\n  creativity: 'Creativity',\n  other: 'Other',\n};\n\n// Period labels\nconst PERIOD_LABELS: Record<StatisticsPeriod, string> = {\n  week: 'This Week',\n  month: 'This Month',\n  year: 'This Year',\n  all: 'All Time',\n};\n\nfunction StatCard({\n  title,\n  value,\n  description,\n  icon,\n  trend,\n  isLoading,\n}: {\n  title: string;\n  value: string | number;\n  description?: string;\n  icon?: React.ReactNode;\n  trend?: 'up' | 'down' | 'neutral';\n  isLoading?: boolean;\n}) {\n  return (\n    <Card data-testid=\"stat-card\">\n      <CardHeader className=\"flex flex-row items-center justify-between pb-2\">\n        <CardTitle className=\"text-sm font-medium text-muted-foreground\">\n          {title}\n        </CardTitle>\n        {icon && <div className=\"text-muted-foreground\">{icon}</div>}\n      </CardHeader>\n      <CardContent className=\"-mt-4\">\n        {isLoading ? (\n          <div className=\"h-8 w-16 animate-pulse rounded bg-muted\" />\n        ) : (\n          <div className=\"flex items-center gap-2\">\n            <span className=\"text-2xl font-bold\">{value}</span>\n            {trend === 'up' && (\n              <TrendingUp className=\"size-4 text-green-500\" />\n            )}\n            {trend === 'down' && (\n              <TrendingDown className=\"size-4 text-red-500\" />\n            )}\n          </div>\n        )}\n        {description && (\n          <p className=\"mt-1 text-xs text-muted-foreground\">{description}</p>\n        )}\n      </CardContent>\n    </Card>\n  );\n}\n\nfunction DayOfWeekChart({\n  completionsByDayOfWeek,\n  trackedDaysByDayOfWeek,\n  isLoading,\n}: {\n  completionsByDayOfWeek: Record<DayOfWeek, number>;\n  trackedDaysByDayOfWeek: Record<DayOfWeek, number>;\n  isLoading?: boolean;\n}) {\n  const days = [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[];\n  const maxCompletions = Math.max(...Object.values(completionsByDayOfWeek), 1);\n\n  // Find best day\n  let bestDay: DayOfWeek = 0;\n  let bestCount = 0;\n  for (const day of days) {\n    if (completionsByDayOfWeek[day] > bestCount) {\n      bestCount = completionsByDayOfWeek[day];\n      bestDay = day;\n    }\n  }\n\n  return (\n    <Card data-testid=\"day-of-week-chart\">\n      <CardHeader>\n        <CardTitle className=\"flex items-center gap-2\">\n          <Calendar className=\"size-5\" />\n          Completions by Day\n        </CardTitle>\n        <CardDescription>\n          Your habit completion patterns across the week\n        </CardDescription>\n      </CardHeader>\n      <CardContent>\n        {isLoading ? (\n          <div className=\"flex h-40 items-end justify-around gap-2\">\n            {days.map((day) => (\n              <div key={day} className=\"flex flex-1 flex-col items-center gap-2\">\n                <div className=\"h-28 w-full animate-pulse rounded bg-muted\" />\n                <span className=\"text-xs text-muted-foreground\">\n                  {DAY_NAMES_SHORT[day]}\n                </span>\n              </div>\n            ))}\n          </div>\n        ) : (\n          <>\n            <div className=\"flex h-40 items-end justify-around gap-2\">\n              {days.map((day) => {\n                const count = completionsByDayOfWeek[day] ?? 0;\n                const tracked = trackedDaysByDayOfWeek[day] ?? 0;\n                const height = (count / maxCompletions) * 100;\n                const isBest = day === bestDay && bestCount > 0;\n                return (\n                  <div\n                    key={day}\n                    className=\"flex flex-1 flex-col items-center gap-2\"\n                  >\n                    <div className=\"relative w-full flex-1 flex items-end\">\n                      <div\n                        className={cn(\n                          'w-full rounded-t transition-all',\n                          isBest ? 'bg-primary' : 'bg-primary/60'\n                        )}\n                        style={{ height: `${Math.max(height, 4)}%` }}\n                        title={`${count} completions / ${tracked} tracked`}\n                      />\n                      {isBest && count > 0 && (\n                        <Trophy className=\"absolute -top-5 left-1/2 size-4 -translate-x-1/2 text-yellow-500\" />\n                      )}\n                    </div>\n                    <div className=\"text-center\">\n                      <span\n                        className={cn(\n                          'text-xs',\n                          isBest && count > 0\n                            ? 'font-bold text-primary'\n                            : 'text-muted-foreground'\n                        )}\n                      >\n                        {DAY_NAMES_SHORT[day]}\n                      </span>\n                      <div className=\"text-xs text-muted-foreground\">\n                        {count}\n                      </div>\n                    </div>\n                  </div>\n                );\n              })}\n            </div>\n            {bestCount > 0 && (\n              <p className=\"mt-4 text-center text-sm text-muted-foreground\">\n                <span className=\"font-medium text-foreground\">\n                  {DAY_NAMES[bestDay]}\n                </span>{' '}\n                is your best day with {bestCount} completions\n              </p>\n            )}\n          </>\n        )}\n      </CardContent>\n    </Card>\n  );\n}\n\nfunction WeeklyTrendsChart({ weeks = 8 }: { weeks?: number }) {\n  const { trends, isLoading } = useWeeklyTrends(weeks);\n\n  const maxRate = Math.max(...trends.map((t) => t.rate), 1);\n\n  // Calculate trend direction\n  const trendDirection = useMemo(() => {\n    if (trends.length < 2) return 'neutral';\n    const recent = trends.slice(-3);\n    const older = trends.slice(-6, -3);\n    if (recent.length === 0 || older.length === 0) return 'neutral';\n    const recentAvg = recent.reduce((sum, t) => sum + t.rate, 0) / recent.length;\n    const olderAvg = older.reduce((sum, t) => sum + t.rate, 0) / older.length;\n    if (recentAvg > olderAvg + 5) return 'up';\n    if (recentAvg < olderAvg - 5) return 'down';\n    return 'neutral';\n  }, [trends]);\n\n  return (\n    <Card data-testid=\"weekly-trends-chart\">\n      <CardHeader>\n        <CardTitle className=\"flex items-center gap-2\">\n          <BarChart3 className=\"size-5\" />\n          Weekly Trends\n          {trendDirection === 'up' && (\n            <TrendingUp className=\"size-4 text-green-500\" />\n          )}\n          {trendDirection === 'down' && (\n            <TrendingDown className=\"size-4 text-red-500\" />\n          )}\n        </CardTitle>\n        <CardDescription>\n          Your habit completion rate over the past {weeks} weeks\n        </CardDescription>\n      </CardHeader>\n      <CardContent>\n        {isLoading ? (\n          <div className=\"flex h-40 items-end justify-around gap-1\">\n            {Array.from({ length: weeks }).map((_, i) => (\n              <div key={i} className=\"flex flex-1 flex-col items-center gap-2\">\n                <div className=\"h-28 w-full animate-pulse rounded bg-muted\" />\n                <span className=\"text-xs text-muted-foreground\">W{i + 1}</span>\n              </div>\n            ))}\n          </div>\n        ) : trends.length === 0 ? (\n          <p className=\"py-8 text-center text-sm text-muted-foreground\">\n            No data available yet. Start tracking habits to see trends!\n          </p>\n        ) : (\n          <div className=\"flex h-40 items-end justify-around gap-1\">\n            {trends.map((week, index) => {\n              const height = (week.rate / maxRate) * 100;\n              const isRecent = index >= trends.length - 2;\n              return (\n                <div\n                  key={week.weekStart}\n                  className=\"flex flex-1 flex-col items-center gap-2\"\n                >\n                  <div className=\"relative w-full flex-1 flex items-end\">\n                    <div\n                      className={cn(\n                        'w-full rounded-t transition-all',\n                        isRecent ? 'bg-green-500' : 'bg-green-500/60'\n                      )}\n                      style={{ height: `${Math.max(height, 4)}%` }}\n                      title={`${week.rate}% (${week.completions}/${week.totalPossible})`}\n                    />\n                  </div>\n                  <div className=\"text-center\">\n                    <span className=\"text-xs text-muted-foreground\">\n                      W{index + 1}\n                    </span>\n                    <div className=\"text-xs font-medium\">{week.rate}%</div>\n                  </div>\n                </div>\n              );\n            })}\n          </div>\n        )}\n      </CardContent>\n    </Card>\n  );\n}\n\nfunction BestPerformingHabits({\n  habits,\n  isLoading,\n}: {\n  habits: Array<{\n    habitId: string;\n    habitName: string;\n    completionRate: number;\n    totalCompletions: number;\n    totalTracked: number;\n  }>;\n  isLoading?: boolean;\n}) {\n  return (\n    <Card data-testid=\"best-habits-card\">\n      <CardHeader>\n        <CardTitle className=\"flex items-center gap-2\">\n          <Award className=\"size-5 text-yellow-500\" />\n          Top Performers\n        </CardTitle>\n        <CardDescription>Your most consistent habits</CardDescription>\n      </CardHeader>\n      <CardContent>\n        {isLoading ? (\n          <div className=\"space-y-3\">\n            {[1, 2, 3].map((i) => (\n              <div key={i} className=\"h-12 animate-pulse rounded bg-muted\" />\n            ))}\n          </div>\n        ) : habits.length === 0 ? (\n          <p className=\"py-4 text-center text-sm text-muted-foreground\">\n            No habits tracked yet in this period\n          </p>\n        ) : (\n          <div className=\"space-y-3\">\n            {habits.map((habit, index) => (\n              <div\n                key={habit.habitId}\n                className=\"flex items-center justify-between rounded-lg border p-3\"\n              >\n                <div className=\"flex items-center gap-3\">\n                  <div\n                    className={cn(\n                      'flex size-8 items-center justify-center rounded-full text-sm font-bold',\n                      index === 0\n                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'\n                        : index === 1\n                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'\n                        : index === 2\n                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'\n                        : 'bg-muted text-muted-foreground'\n                    )}\n                  >\n                    {index + 1}\n                  </div>\n                  <div>\n                    <p className=\"font-medium\">{habit.habitName}</p>\n                    <p className=\"text-xs text-muted-foreground\">\n                      {habit.totalCompletions} / {habit.totalTracked} completed\n                    </p>\n                  </div>\n                </div>\n                <div className=\"text-right\">\n                  <p className=\"text-lg font-bold text-green-600 dark:text-green-400\">\n                    {habit.completionRate}%\n                  </p>\n                </div>\n              </div>\n            ))}\n          </div>\n        )}\n      </CardContent>\n    </Card>\n  );\n}\n\nfunction NeedsImprovementHabits({\n  habits,\n  isLoading,\n}: {\n  habits: Array<{\n    habitId: string;\n    habitName: string;\n    completionRate: number;\n    totalCompletions: number;\n    totalTracked: number;\n  }>;\n  isLoading?: boolean;\n}) {\n  // Only show habits with rate < 50%\n  const lowPerformers = habits.filter((h) => h.completionRate < 50);\n\n  if (lowPerformers.length === 0 && !isLoading) {\n    return (\n      <Card data-testid=\"needs-improvement-card\">\n        <CardHeader>\n          <CardTitle className=\"flex items-center gap-2\">\n            <Sparkles className=\"size-5 text-purple-500\" />\n            All Habits Doing Well!\n          </CardTitle>\n        </CardHeader>\n        <CardContent>\n          <p className=\"text-sm text-muted-foreground\">\n            Great job! All your habits have a completion rate above 50%.\n            Keep up the excellent work!\n          </p>\n        </CardContent>\n      </Card>\n    );\n  }\n\n  return (\n    <Card data-testid=\"needs-improvement-card\">\n      <CardHeader>\n        <CardTitle className=\"flex items-center gap-2\">\n          <AlertCircle className=\"size-5 text-orange-500\" />\n          Room for Improvement\n        </CardTitle>\n        <CardDescription>\n          Focus on these habits to boost your overall progress\n        </CardDescription>\n      </CardHeader>\n      <CardContent>\n        {isLoading ? (\n          <div className=\"space-y-3\">\n            {[1, 2, 3].map((i) => (\n              <div key={i} className=\"h-12 animate-pulse rounded bg-muted\" />\n            ))}\n          </div>\n        ) : (\n          <div className=\"space-y-3\">\n            {lowPerformers.slice(0, 5).map((habit) => (\n              <div\n                key={habit.habitId}\n                className=\"flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950\"\n              >\n                <div>\n                  <p className=\"font-medium\">{habit.habitName}</p>\n                  <p className=\"text-xs text-muted-foreground\">\n                    {habit.totalCompletions} / {habit.totalTracked} completed\n                  </p>\n                </div>\n                <div className=\"text-right\">\n                  <p className=\"text-lg font-bold text-orange-600 dark:text-orange-400\">\n                    {habit.completionRate}%\n                  </p>\n                </div>\n              </div>\n            ))}\n          </div>\n        )}\n      </CardContent>\n    </Card>\n  );\n}\n\nfunction CategoryPerformance({\n  categoryPerformance,\n  isLoading,\n}: {\n  categoryPerformance: Record<\n    string,\n    { completions: number; total: number; rate: number }\n  >;\n  isLoading?: boolean;\n}) {\n  // Filter to only show categories with data\n  const activeCategories = Object.entries(categoryPerformance)\n    .filter(([_, stats]) => stats.total > 0)\n    .sort((a, b) => b[1].rate - a[1].rate);\n\n  return (\n    <Card data-testid=\"category-performance-card\">\n      <CardHeader>\n        <CardTitle className=\"flex items-center gap-2\">\n          <Target className=\"size-5\" />\n          Performance by Category\n        </CardTitle>\n        <CardDescription>\n          How you're doing across different habit categories\n        </CardDescription>\n      </CardHeader>\n      <CardContent>\n        {isLoading ? (\n          <div className=\"space-y-3\">\n            {[1, 2, 3].map((i) => (\n              <div key={i} className=\"h-8 animate-pulse rounded bg-muted\" />\n            ))}\n          </div>\n        ) : activeCategories.length === 0 ? (\n          <p className=\"py-4 text-center text-sm text-muted-foreground\">\n            No category data available yet\n          </p>\n        ) : (\n          <div className=\"space-y-4\">\n            {activeCategories.map(([category, stats]) => (\n              <div key={category} className=\"space-y-1\">\n                <div className=\"flex items-center justify-between text-sm\">\n                  <span className=\"font-medium\">\n                    {CATEGORY_LABELS[category] ?? category}\n                  </span>\n                  <span className=\"text-muted-foreground\">\n                    {stats.rate}% ({stats.completions}/{stats.total})\n                  </span>\n                </div>\n                <div className=\"h-2 w-full overflow-hidden rounded-full bg-secondary\">\n                  <div\n                    className={cn(\n                      'h-full transition-all',\n                      stats.rate >= 80\n                        ? 'bg-green-500'\n                        : stats.rate >= 50\n                        ? 'bg-yellow-500'\n                        : 'bg-orange-500'\n                    )}\n                    style={{ width: `${stats.rate}%` }}\n                  />\n                </div>\n              </div>\n            ))}\n          </div>\n        )}\n      </CardContent>\n    </Card>\n  );\n}\n\nfunction MotivationalInsights({\n  statistics,\n  dashboardStats,\n  isLoading,\n}: {\n  statistics: {\n    completionRate: number;\n    totalActiveDays: number;\n    avgDailyCompletionRate: number;\n    bestPerformingHabits: Array<{ habitName: string; completionRate: number }>;\n  } | null;\n  dashboardStats: {\n    totalActiveStreaks: number;\n    bestCurrentStreak: { habitName: string; days: number } | null;\n    bestStreakEver: { habitName: string; days: number } | null;\n    bestDayOfWeek: { name: string; completions: number } | null;\n  } | null;\n  isLoading?: boolean;\n}) {\n  const insights = useMemo(() => {\n    if (!statistics && !dashboardStats) return [];\n\n    const items: Array<{\n      icon: React.ReactNode;\n      title: string;\n      message: string;\n      type: 'success' | 'info' | 'warning';\n    }> = [];\n\n    // Completion rate insight\n    if (statistics) {\n      if (statistics.completionRate >= 80) {\n        items.push({\n          icon: <Trophy className=\"size-5 text-yellow-500\" />,\n          title: 'Outstanding Performance!',\n          message: `You're completing ${statistics.completionRate}% of your habits. Keep up this exceptional work!`,\n          type: 'success',\n        });\n      } else if (statistics.completionRate >= 50) {\n        items.push({\n          icon: <TrendingUp className=\"size-5 text-green-500\" />,\n          title: 'Good Progress',\n          message: `You're at ${statistics.completionRate}% completion. You're on the right track!`,\n          type: 'info',\n        });\n      } else if (statistics.completionRate > 0) {\n        items.push({\n          icon: <Target className=\"size-5 text-orange-500\" />,\n          title: 'Room to Grow',\n          message: `At ${statistics.completionRate}% completion, focus on building consistency one habit at a time.`,\n          type: 'warning',\n        });\n      }\n\n      // Active days insight\n      if (statistics.totalActiveDays > 0) {\n        items.push({\n          icon: <Calendar className=\"size-5 text-blue-500\" />,\n          title: 'Consistency Check',\n          message: `You've been active for ${statistics.totalActiveDays} days in this period with an average of ${statistics.avgDailyCompletionRate}% daily completion.`,\n          type: 'info',\n        });\n      }\n\n      // Best habit insight\n      if (statistics.bestPerformingHabits.length > 0) {\n        const best = statistics.bestPerformingHabits[0];\n        if (best.completionRate >= 80) {\n          items.push({\n            icon: <Award className=\"size-5 text-purple-500\" />,\n            title: 'Star Habit',\n            message: `\"${best.habitName}\" is your most consistent habit at ${best.completionRate}%!`,\n            type: 'success',\n          });\n        }\n      }\n    }\n\n    // Streak insights\n    if (dashboardStats) {\n      if (dashboardStats.bestCurrentStreak && dashboardStats.bestCurrentStreak.days >= 7) {\n        items.push({\n          icon: <Flame className=\"size-5 text-orange-500\" />,\n          title: 'Streak On Fire!',\n          message: `Amazing! \"${dashboardStats.bestCurrentStreak.habitName}\" has a ${dashboardStats.bestCurrentStreak.days}-day streak!`,\n          type: 'success',\n        });\n      }\n\n      if (dashboardStats.totalActiveStreaks >= 3) {\n        items.push({\n          icon: <Sparkles className=\"size-5 text-indigo-500\" />,\n          title: 'Multiple Streaks',\n          message: `You have ${dashboardStats.totalActiveStreaks} active streaks going. Great momentum!`,\n          type: 'success',\n        });\n      }\n\n      // Best day insight\n      if (dashboardStats.bestDayOfWeek && dashboardStats.bestDayOfWeek.completions > 0) {\n        items.push({\n          icon: <CheckCircle2 className=\"size-5 text-green-500\" />,\n          title: 'Peak Performance Day',\n          message: `${dashboardStats.bestDayOfWeek.name} is your strongest day with ${dashboardStats.bestDayOfWeek.completions} completions overall.`,\n          type: 'info',\n        });\n      }\n    }\n\n    return items;\n  }, [statistics, dashboardStats]);\n\n  return (\n    <Card data-testid=\"motivational-insights-card\">\n      <CardHeader>\n        <CardTitle className=\"flex items-center gap-2\">\n          <Sparkles className=\"size-5 text-purple-500\" />\n          Insights & Motivation\n        </CardTitle>\n        <CardDescription>\n          Personalized insights based on your habit data\n        </CardDescription>\n      </CardHeader>\n      <CardContent>\n        {isLoading ? (\n          <div className=\"space-y-3\">\n            {[1, 2, 3].map((i) => (\n              <div key={i} className=\"h-16 animate-pulse rounded bg-muted\" />\n            ))}\n          </div>\n        ) : insights.length === 0 ? (\n          <p className=\"py-4 text-center text-sm text-muted-foreground\">\n            Start tracking habits to unlock personalized insights!\n          </p>\n        ) : (\n          <div className=\"space-y-3\">\n            {insights.map((insight, index) => (\n              <div\n                key={index}\n                className={cn(\n                  'flex items-start gap-3 rounded-lg border p-3',\n                  insight.type === 'success' &&\n                    'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950',\n                  insight.type === 'info' &&\n                    'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',\n                  insight.type === 'warning' &&\n                    'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950'\n                )}\n              >\n                <div className=\"mt-0.5\">{insight.icon}</div>\n                <div>\n                  <p className=\"font-medium\">{insight.title}</p>\n                  <p className=\"text-sm text-muted-foreground\">\n                    {insight.message}\n                  </p>\n                </div>\n              </div>\n            ))}\n          </div>\n        )}\n      </CardContent>\n    </Card>\n  );\n}\n\nexport default function StatisticsPage() {\n  const [period, setPeriod] = useState<StatisticsPeriod>('month');\n  const { statistics: periodStats, isLoading: periodLoading, error: periodError } = usePeriodStatistics(period);\n  const { statistics: dashboardStats, isLoading: dashboardLoading, error: dashboardError } = useDashboardStatistics();\n\n  const isLoading = periodLoading || dashboardLoading;\n  const error = periodError || dashboardError;\n\n  if (error) {\n    return (\n      <div className=\"rounded-lg border border-destructive bg-destructive/10 p-4\" data-testid=\"statistics-error\">\n        <p className=\"text-sm text-destructive\">\n          Error loading statistics: {error.message}\n        </p>\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"space-y-6\" data-testid=\"statistics-page\">\n      {/* Header with Period Selector */}\n      <div className=\"flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between\">\n        <div>\n          <h1 className=\"text-2xl font-bold\">Statistics</h1>\n          <p className=\"mt-1 text-muted-foreground\">\n            Track your progress and discover patterns in your habits\n          </p>\n        </div>\n        <div className=\"flex items-center gap-2\">\n          <span className=\"text-sm text-muted-foreground\">Show:</span>\n          <Select\n            value={period}\n            onValueChange={(value) => setPeriod(value as StatisticsPeriod)}\n          >\n            <SelectTrigger className=\"w-[140px]\" data-testid=\"period-selector\">\n              <SelectValue />\n            </SelectTrigger>\n            <SelectContent>\n              <SelectItem value=\"week\">This Week</SelectItem>\n              <SelectItem value=\"month\">This Month</SelectItem>\n              <SelectItem value=\"year\">This Year</SelectItem>\n              <SelectItem value=\"all\">All Time</SelectItem>\n            </SelectContent>\n          </Select>\n        </div>\n      </div>\n\n      {/* Loading State */}\n      {isLoading && !periodStats && (\n        <div className=\"flex items-center justify-center py-12\" data-testid=\"statistics-loading\">\n          <Loader2 className=\"size-8 animate-spin text-muted-foreground\" />\n        </div>\n      )}\n\n      {/* Overview Stats */}\n      <div className=\"grid gap-4 sm:grid-cols-2 lg:grid-cols-4\" data-testid=\"overview-stats\">\n        <StatCard\n          title=\"Completion Rate\"\n          value={`${periodStats?.completionRate ?? 0}%`}\n          description={`${PERIOD_LABELS[period]} average`}\n          icon={<Activity className=\"size-5\" />}\n          isLoading={periodLoading}\n        />\n        <StatCard\n          title=\"Total Completions\"\n          value={periodStats?.totalCompletions ?? 0}\n          description={`Out of ${periodStats?.totalPossible ?? 0} tracked`}\n          icon={<CheckCircle2 className=\"size-5\" />}\n          isLoading={periodLoading}\n        />\n        <StatCard\n          title=\"Active Days\"\n          value={periodStats?.totalActiveDays ?? 0}\n          description=\"Days with activity\"\n          icon={<Calendar className=\"size-5\" />}\n          isLoading={periodLoading}\n        />\n        <StatCard\n          title=\"Active Streaks\"\n          value={dashboardStats?.totalActiveStreaks ?? 0}\n          description={\n            dashboardStats?.bestCurrentStreak\n              ? `Best: ${dashboardStats.bestCurrentStreak.days} days`\n              : 'Start a streak today!'\n          }\n          icon={<Flame className=\"size-5 text-orange-500\" />}\n          isLoading={dashboardLoading}\n        />\n      </div>\n\n      {/* Charts Row */}\n      <div className=\"grid gap-6 lg:grid-cols-2\">\n        <DayOfWeekChart\n          completionsByDayOfWeek={\n            periodStats?.completionsByDayOfWeek ?? {\n              0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,\n            }\n          }\n          trackedDaysByDayOfWeek={\n            periodStats?.trackedDaysByDayOfWeek ?? {\n              0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,\n            }\n          }\n          isLoading={periodLoading}\n        />\n        <WeeklyTrendsChart weeks={8} />\n      </div>\n\n      {/* Habit Performance Section */}\n      <div className=\"grid gap-6 lg:grid-cols-2\">\n        <BestPerformingHabits\n          habits={periodStats?.bestPerformingHabits ?? []}\n          isLoading={periodLoading}\n        />\n        <NeedsImprovementHabits\n          habits={periodStats?.needsImprovementHabits ?? []}\n          isLoading={periodLoading}\n        />\n      </div>\n\n      {/* Category Performance and Insights */}\n      <div className=\"grid gap-6 lg:grid-cols-2\">\n        <CategoryPerformance\n          categoryPerformance={periodStats?.categoryPerformance ?? {}}\n          isLoading={periodLoading}\n        />\n        <MotivationalInsights\n          statistics={periodStats ? {\n            completionRate: periodStats.completionRate,\n            totalActiveDays: periodStats.totalActiveDays,\n            avgDailyCompletionRate: periodStats.avgDailyCompletionRate,\n            bestPerformingHabits: periodStats.bestPerformingHabits,\n          } : null}\n          dashboardStats={dashboardStats ? {\n            totalActiveStreaks: dashboardStats.totalActiveStreaks,\n            bestCurrentStreak: dashboardStats.bestCurrentStreak,\n            bestStreakEver: dashboardStats.bestStreakEver,\n            bestDayOfWeek: dashboardStats.bestDayOfWeek,\n          } : null}\n          isLoading={isLoading}\n        />\n      </div>\n\n      {/* Streak Records */}\n      <div className=\"grid gap-6 lg:grid-cols-2\">\n        <Card data-testid=\"streak-records-card\">\n          <CardHeader>\n            <CardTitle className=\"flex items-center gap-2\">\n              <Flame className=\"size-5 text-orange-500\" />\n              Streak Records\n            </CardTitle>\n            <CardDescription>Your best habit streaks</CardDescription>\n          </CardHeader>\n          <CardContent>\n            {dashboardLoading ? (\n              <div className=\"space-y-3\">\n                <div className=\"h-12 animate-pulse rounded bg-muted\" />\n                <div className=\"h-12 animate-pulse rounded bg-muted\" />\n              </div>\n            ) : (\n              <div className=\"space-y-4\">\n                {dashboardStats?.bestStreakEver ? (\n                  <div className=\"flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950\">\n                    <div className=\"flex items-center gap-3\">\n                      <Trophy className=\"size-8 text-yellow-500\" />\n                      <div>\n                        <p className=\"text-sm text-muted-foreground\">\n                          All-Time Best\n                        </p>\n                        <p className=\"font-medium\">\n                          {dashboardStats.bestStreakEver.habitName}\n                        </p>\n                      </div>\n                    </div>\n                    <div className=\"text-right\">\n                      <p className=\"text-2xl font-bold text-yellow-600 dark:text-yellow-400\">\n                        {dashboardStats.bestStreakEver.days}\n                      </p>\n                      <p className=\"text-xs text-muted-foreground\">days</p>\n                    </div>\n                  </div>\n                ) : (\n                  <p className=\"py-4 text-center text-sm text-muted-foreground\">\n                    No streaks recorded yet. Start completing habits to build your streaks!\n                  </p>\n                )}\n                {dashboardStats?.bestCurrentStreak &&\n                  dashboardStats.bestCurrentStreak.habitId !==\n                    dashboardStats.bestStreakEver?.habitId && (\n                    <div className=\"flex items-center justify-between rounded-lg border p-4\">\n                      <div className=\"flex items-center gap-3\">\n                        <Flame className=\"size-6 text-orange-500\" />\n                        <div>\n                          <p className=\"text-sm text-muted-foreground\">\n                            Current Best\n                          </p>\n                          <p className=\"font-medium\">\n                            {dashboardStats.bestCurrentStreak.habitName}\n                          </p>\n                        </div>\n                      </div>\n                      <div className=\"text-right\">\n                        <p className=\"text-xl font-bold\">\n                          {dashboardStats.bestCurrentStreak.days}\n                        </p>\n                        <p className=\"text-xs text-muted-foreground\">days</p>\n                      </div>\n                    </div>\n                  )}\n              </div>\n            )}\n          </CardContent>\n        </Card>\n\n        <Card data-testid=\"consistency-card\">\n          <CardHeader>\n            <CardTitle className=\"flex items-center gap-2\">\n              <Award className=\"size-5 text-purple-500\" />\n              Consistency Champion\n            </CardTitle>\n            <CardDescription>Your most reliable habit</CardDescription>\n          </CardHeader>\n          <CardContent>\n            {dashboardLoading ? (\n              <div className=\"h-20 animate-pulse rounded bg-muted\" />\n            ) : dashboardStats?.mostConsistentHabit ? (\n              <div className=\"flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950\">\n                <div className=\"flex items-center gap-3\">\n                  <div className=\"flex size-12 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-800\">\n                    <Award className=\"size-6 text-purple-600 dark:text-purple-300\" />\n                  </div>\n                  <div>\n                    <p className=\"font-medium\">\n                      {dashboardStats.mostConsistentHabit.habitName}\n                    </p>\n                    <p className=\"text-sm text-muted-foreground\">\n                      Most consistent (7+ days tracked)\n                    </p>\n                  </div>\n                </div>\n                <div className=\"text-right\">\n                  <p className=\"text-2xl font-bold text-purple-600 dark:text-purple-400\">\n                    {dashboardStats.mostConsistentHabit.rate}%\n                  </p>\n                  <p className=\"text-xs text-muted-foreground\">completion</p>\n                </div>\n              </div>\n            ) : (\n              <p className=\"py-4 text-center text-sm text-muted-foreground\">\n                Track habits for at least 7 days to see your most consistent habit.\n              </p>\n            )}\n          </CardContent>\n        </Card>\n      </div>\n    </div>\n  );\n}\n"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\app\\statistics\\page.tsx"
}
I see the file was modified and has some chart components that may not exist. Let me check if those components exist:

🔧 Tool: Glob
Input: {
  "pattern": "**/components/charts/**"
}
The chart components exist. Let me check them to understand the existing pattern:

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\charts\\index.ts"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\components\\charts\\WeeklySummaryChart.tsx"
}
Good, I see the charts use recharts and are already set up. Now let me rewrite the statistics page to add the comprehensive features (period filters, best performing habits, patterns, insights) while keeping the existing charts:

🔧 Tool: Write
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\src\\app\\statistics\\page.tsx",
  "content": "'use client';\n\nimport { useState, useMemo } from 'react';\nimport {\n  Card,\n  CardContent,\n  CardDescription,\n  CardHeader,\n  CardTitle,\n} from '@/components/ui/card';\nimport {\n  Select,\n  SelectContent,\n  SelectItem,\n  SelectTrigger,\n  SelectValue,\n} from '@/components/ui/select';\nimport {\n  usePeriodStatistics,\n  useDashboardStatistics,\n  DAY_NAMES,\n  type StatisticsPeriod,\n} from '@/lib/database';\nimport {\n  CompletionTrendsChart,\n  WeeklySummaryChart,\n  MonthlySummaryChart,\n  CategoryDistributionChart,\n} from '@/components/charts';\nimport {\n  TrendingUp,\n  TrendingDown,\n  Trophy,\n  Target,\n  Flame,\n  Calendar,\n  Award,\n  AlertCircle,\n  Sparkles,\n  Loader2,\n  Activity,\n  CheckCircle2,\n} from 'lucide-react';\nimport { cn } from '@/lib/utils';\n\n// Period labels\nconst PERIOD_LABELS: Record<StatisticsPeriod, string> = {\n  week: 'This Week',\n  month: 'This Month',\n  year: 'This Year',\n  all: 'All Time',\n};\n\nfunction StatCard({\n  title,\n  value,\n  description,\n  icon,\n  trend,\n  isLoading,\n}: {\n  title: string;\n  value: string | number;\n  description?: string;\n  icon?: React.ReactNode;\n  trend?: 'up' | 'down' | 'neutral';\n  isLoading?: boolean;\n}) {\n  return (\n    <Card data-testid=\"stat-card\">\n      <CardHeader className=\"flex flex-row items-center justify-between pb-2\">\n        <CardTitle className=\"text-sm font-medium text-muted-foreground\">\n          {title}\n        </CardTitle>\n        {icon && <div className=\"text-muted-foreground\">{icon}</div>}\n      </CardHeader>\n      <CardContent className=\"-mt-4\">\n        {isLoading ? (\n          <div className=\"h-8 w-16 animate-pulse rounded bg-muted\" />\n        ) : (\n          <div className=\"flex items-center gap-2\">\n            <span className=\"text-2xl font-bold\">{value}</span>\n            {trend === 'up' && (\n              <TrendingUp className=\"size-4 text-green-500\" />\n            )}\n            {trend === 'down' && (\n              <TrendingDown className=\"size-4 text-red-500\" />\n            )}\n          </div>\n        )}\n        {description && (\n          <p className=\"mt-1 text-xs text-muted-foreground\">{description}</p>\n        )}\n      </CardContent>\n    </Card>\n  );\n}\n\nfunction BestPerformingHabits({\n  habits,\n  isLoading,\n}: {\n  habits: Array<{\n    habitId: string;\n    habitName: string;\n    completionRate: number;\n    totalCompletions: number;\n    totalTracked: number;\n  }>;\n  isLoading?: boolean;\n}) {\n  return (\n    <Card data-testid=\"best-habits-card\">\n      <CardHeader>\n        <CardTitle className=\"flex items-center gap-2\">\n          <Award className=\"size-5 text-yellow-500\" />\n          Top Performers\n        </CardTitle>\n        <CardDescription>Your most consistent habits</CardDescription>\n      </CardHeader>\n      <CardContent>\n        {isLoading ? (\n          <div className=\"space-y-3\">\n            {[1, 2, 3].map((i) => (\n              <div key={i} className=\"h-12 animate-pulse rounded bg-muted\" />\n            ))}\n          </div>\n        ) : habits.length === 0 ? (\n          <p className=\"py-4 text-center text-sm text-muted-foreground\">\n            No habits tracked yet in this period\n          </p>\n        ) : (\n          <div className=\"space-y-3\">\n            {habits.map((habit, index) => (\n              <div\n                key={habit.habitId}\n                className=\"flex items-center justify-between rounded-lg border p-3\"\n              >\n                <div className=\"flex items-center gap-3\">\n                  <div\n                    className={cn(\n                      'flex size-8 items-center justify-center rounded-full text-sm font-bold',\n                      index === 0\n                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'\n                        : index === 1\n                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'\n                        : index === 2\n                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'\n                        : 'bg-muted text-muted-foreground'\n                    )}\n                  >\n                    {index + 1}\n                  </div>\n                  <div>\n                    <p className=\"font-medium\">{habit.habitName}</p>\n                    <p className=\"text-xs text-muted-foreground\">\n                      {habit.totalCompletions} / {habit.totalTracked} completed\n                    </p>\n                  </div>\n                </div>\n                <div className=\"text-right\">\n                  <p className=\"text-lg font-bold text-green-600 dark:text-green-400\">\n                    {habit.completionRate}%\n                  </p>\n                </div>\n              </div>\n            ))}\n          </div>\n        )}\n      </CardContent>\n    </Card>\n  );\n}\n\nfunction NeedsImprovementHabits({\n  habits,\n  isLoading,\n}: {\n  habits: Array<{\n    habitId: string;\n    habitName: string;\n    completionRate: number;\n    totalCompletions: number;\n    totalTracked: number;\n  }>;\n  isLoading?: boolean;\n}) {\n  // Only show habits with rate < 50%\n  const lowPerformers = habits.filter((h) => h.completionRate < 50);\n\n  if (lowPerformers.length === 0 && !isLoading) {\n    return (\n      <Card data-testid=\"needs-improvement-card\">\n        <CardHeader>\n          <CardTitle className=\"flex items-center gap-2\">\n            <Sparkles className=\"size-5 text-purple-500\" />\n            All Habits Doing Well!\n          </CardTitle>\n        </CardHeader>\n        <CardContent>\n          <p className=\"text-sm text-muted-foreground\">\n            Great job! All your habits have a completion rate above 50%.\n            Keep up the excellent work!\n          </p>\n        </CardContent>\n      </Card>\n    );\n  }\n\n  return (\n    <Card data-testid=\"needs-improvement-card\">\n      <CardHeader>\n        <CardTitle className=\"flex items-center gap-2\">\n          <AlertCircle className=\"size-5 text-orange-500\" />\n          Room for Improvement\n        </CardTitle>\n        <CardDescription>\n          Focus on these habits to boost your overall progress\n        </CardDescription>\n      </CardHeader>\n      <CardContent>\n        {isLoading ? (\n          <div className=\"space-y-3\">\n            {[1, 2, 3].map((i) => (\n              <div key={i} className=\"h-12 animate-pulse rounded bg-muted\" />\n            ))}\n          </div>\n        ) : (\n          <div className=\"space-y-3\">\n            {lowPerformers.slice(0, 5).map((habit) => (\n              <div\n                key={habit.habitId}\n                className=\"flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950\"\n              >\n                <div>\n                  <p className=\"font-medium\">{habit.habitName}</p>\n                  <p className=\"text-xs text-muted-foreground\">\n                    {habit.totalCompletions} / {habit.totalTracked} completed\n                  </p>\n                </div>\n                <div className=\"text-right\">\n                  <p className=\"text-lg font-bold text-orange-600 dark:text-orange-400\">\n                    {habit.completionRate}%\n                  </p>\n                </div>\n              </div>\n            ))}\n          </div>\n        )}\n      </CardContent>\n    </Card>\n  );\n}\n\nfunction MotivationalInsights({\n  statistics,\n  dashboardStats,\n  isLoading,\n}: {\n  statistics: {\n    completionRate: number;\n    totalActiveDays: number;\n    avgDailyCompletionRate: number;\n    bestPerformingHabits: Array<{ habitName: string; completionRate: number }>;\n  } | null;\n  dashboardStats: {\n    totalActiveStreaks: number;\n    bestCurrentStreak: { habitName: string; days: number } | null;\n    bestStreakEver: { habitName: string; days: number } | null;\n    bestDayOfWeek: { name: string; completions: number } | null;\n  } | null;\n  isLoading?: boolean;\n}) {\n  const insights = useMemo(() => {\n    if (!statistics && !dashboardStats) return [];\n\n    const items: Array<{\n      icon: React.ReactNode;\n      title: string;\n      message: string;\n      type: 'success' | 'info' | 'warning';\n    }> = [];\n\n    // Completion rate insight\n    if (statistics) {\n      if (statistics.completionRate >= 80) {\n        items.push({\n          icon: <Trophy className=\"size-5 text-yellow-500\" />,\n          title: 'Outstanding Performance!',\n          message: `You're completing ${statistics.completionRate}% of your habits. Keep up this exceptional work!`,\n          type: 'success',\n        });\n      } else if (statistics.completionRate >= 50) {\n        items.push({\n          icon: <TrendingUp className=\"size-5 text-green-500\" />,\n          title: 'Good Progress',\n          message: `You're at ${statistics.completionRate}% completion. You're on the right track!`,\n          type: 'info',\n        });\n      } else if (statistics.completionRate > 0) {\n        items.push({\n          icon: <Target className=\"size-5 text-orange-500\" />,\n          title: 'Room to Grow',\n          message: `At ${statistics.completionRate}% completion, focus on building consistency one habit at a time.`,\n          type: 'warning',\n        });\n      }\n\n      // Active days insight\n      if (statistics.totalActiveDays > 0) {\n        items.push({\n          icon: <Calendar className=\"size-5 text-blue-500\" />,\n          title: 'Consistency Check',\n          message: `You've been active for ${statistics.totalActiveDays} days in this period with an average of ${statistics.avgDailyCompletionRate}% daily completion.`,\n          type: 'info',\n        });\n      }\n\n      // Best habit insight\n      if (statistics.bestPerformingHabits.length > 0) {\n        const best = statistics.bestPerformingHabits[0];\n        if (best.completionRate >= 80) {\n          items.push({\n            icon: <Award className=\"size-5 text-purple-500\" />,\n            title: 'Star Habit',\n            message: `\"${best.habitName}\" is your most consistent habit at ${best.completionRate}%!`,\n            type: 'success',\n          });\n        }\n      }\n    }\n\n    // Streak insights\n    if (dashboardStats) {\n      if (dashboardStats.bestCurrentStreak && dashboardStats.bestCurrentStreak.days >= 7) {\n        items.push({\n          icon: <Flame className=\"size-5 text-orange-500\" />,\n          title: 'Streak On Fire!',\n          message: `Amazing! \"${dashboardStats.bestCurrentStreak.habitName}\" has a ${dashboardStats.bestCurrentStreak.days}-day streak!`,\n          type: 'success',\n        });\n      }\n\n      if (dashboardStats.totalActiveStreaks >= 3) {\n        items.push({\n          icon: <Sparkles className=\"size-5 text-indigo-500\" />,\n          title: 'Multiple Streaks',\n          message: `You have ${dashboardStats.totalActiveStreaks} active streaks going. Great momentum!`,\n          type: 'success',\n        });\n      }\n\n      // Best day insight\n      if (dashboardStats.bestDayOfWeek && dashboardStats.bestDayOfWeek.completions > 0) {\n        items.push({\n          icon: <CheckCircle2 className=\"size-5 text-green-500\" />,\n          title: 'Peak Performance Day',\n          message: `${dashboardStats.bestDayOfWeek.name} is your strongest day with ${dashboardStats.bestDayOfWeek.completions} completions overall.`,\n          type: 'info',\n        });\n      }\n    }\n\n    return items;\n  }, [statistics, dashboardStats]);\n\n  return (\n    <Card data-testid=\"motivational-insights-card\">\n      <CardHeader>\n        <CardTitle className=\"flex items-center gap-2\">\n          <Sparkles className=\"size-5 text-purple-500\" />\n          Insights & Motivation\n        </CardTitle>\n        <CardDescription>\n          Personalized insights based on your habit data\n        </CardDescription>\n      </CardHeader>\n      <CardContent>\n        {isLoading ? (\n          <div className=\"space-y-3\">\n            {[1, 2, 3].map((i) => (\n              <div key={i} className=\"h-16 animate-pulse rounded bg-muted\" />\n            ))}\n          </div>\n        ) : insights.length === 0 ? (\n          <p className=\"py-4 text-center text-sm text-muted-foreground\">\n            Start tracking habits to unlock personalized insights!\n          </p>\n        ) : (\n          <div className=\"space-y-3\">\n            {insights.map((insight, index) => (\n              <div\n                key={index}\n                className={cn(\n                  'flex items-start gap-3 rounded-lg border p-3',\n                  insight.type === 'success' &&\n                    'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950',\n                  insight.type === 'info' &&\n                    'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',\n                  insight.type === 'warning' &&\n                    'border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950'\n                )}\n              >\n                <div className=\"mt-0.5\">{insight.icon}</div>\n                <div>\n                  <p className=\"font-medium\">{insight.title}</p>\n                  <p className=\"text-sm text-muted-foreground\">\n                    {insight.message}\n                  </p>\n                </div>\n              </div>\n            ))}\n          </div>\n        )}\n      </CardContent>\n    </Card>\n  );\n}\n\nexport default function StatisticsPage() {\n  const [period, setPeriod] = useState<StatisticsPeriod>('month');\n  const { statistics: periodStats, isLoading: periodLoading, error: periodError } = usePeriodStatistics(period);\n  const { statistics: dashboardStats, isLoading: dashboardLoading, error: dashboardError } = useDashboardStatistics();\n\n  const isLoading = periodLoading || dashboardLoading;\n  const error = periodError || dashboardError;\n\n  if (error) {\n    return (\n      <div className=\"rounded-lg border border-destructive bg-destructive/10 p-4\" data-testid=\"statistics-error\">\n        <p className=\"text-sm text-destructive\">\n          Error loading statistics: {error.message}\n        </p>\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"space-y-6\" data-testid=\"statistics-page\">\n      {/* Header with Period Selector */}\n      <div className=\"flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between\">\n        <div>\n          <h1 className=\"text-2xl font-bold\">Statistics</h1>\n          <p className=\"mt-1 text-muted-foreground\">\n            Track your progress and discover patterns in your habits\n          </p>\n        </div>\n        <div className=\"flex items-center gap-2\">\n          <span className=\"text-sm text-muted-foreground\">Show:</span>\n          <Select\n            value={period}\n            onValueChange={(value) => setPeriod(value as StatisticsPeriod)}\n          >\n            <SelectTrigger className=\"w-[140px]\" data-testid=\"period-selector\">\n              <SelectValue />\n            </SelectTrigger>\n            <SelectContent>\n              <SelectItem value=\"week\">This Week</SelectItem>\n              <SelectItem value=\"month\">This Month</SelectItem>\n              <SelectItem value=\"year\">This Year</SelectItem>\n              <SelectItem value=\"all\">All Time</SelectItem>\n            </SelectContent>\n          </Select>\n        </div>\n      </div>\n\n      {/* Loading State */}\n      {isLoading && !periodStats && !dashboardStats && (\n        <div className=\"flex items-center justify-center py-12\" data-testid=\"statistics-loading\">\n          <Loader2 className=\"size-8 animate-spin text-muted-foreground\" />\n        </div>\n      )}\n\n      {/* Overview Stats - Period Based */}\n      <div className=\"grid gap-4 sm:grid-cols-2 lg:grid-cols-4\" data-testid=\"overview-stats\">\n        <StatCard\n          title=\"Completion Rate\"\n          value={`${periodStats?.completionRate ?? 0}%`}\n          description={`${PERIOD_LABELS[period]} average`}\n          icon={<Activity className=\"size-5\" />}\n          isLoading={periodLoading}\n        />\n        <StatCard\n          title=\"Total Completions\"\n          value={periodStats?.totalCompletions ?? 0}\n          description={`Out of ${periodStats?.totalPossible ?? 0} tracked`}\n          icon={<CheckCircle2 className=\"size-5\" />}\n          isLoading={periodLoading}\n        />\n        <StatCard\n          title=\"Active Days\"\n          value={periodStats?.totalActiveDays ?? 0}\n          description=\"Days with activity\"\n          icon={<Calendar className=\"size-5\" />}\n          isLoading={periodLoading}\n        />\n        <StatCard\n          title=\"Active Streaks\"\n          value={dashboardStats?.totalActiveStreaks ?? 0}\n          description={\n            dashboardStats?.bestCurrentStreak\n              ? `Best: ${dashboardStats.bestCurrentStreak.days} days`\n              : 'Start a streak today!'\n          }\n          icon={<Flame className=\"size-5 text-orange-500\" />}\n          isLoading={dashboardLoading}\n        />\n      </div>\n\n      {/* Period Stats */}\n      <div className=\"grid gap-4 sm:grid-cols-3\">\n        <StatCard\n          title=\"Today\"\n          value={`${dashboardStats?.todayStats.completed ?? 0}/${dashboardStats?.todayStats.total ?? 0}`}\n          description={`${dashboardStats?.todayStats.rate ?? 0}% completion`}\n          isLoading={dashboardLoading}\n        />\n        <StatCard\n          title=\"This Week\"\n          value={`${dashboardStats?.thisWeekStats.completed ?? 0}/${dashboardStats?.thisWeekStats.total ?? 0}`}\n          description={`${dashboardStats?.thisWeekStats.rate ?? 0}% completion`}\n          isLoading={dashboardLoading}\n        />\n        <StatCard\n          title=\"This Month\"\n          value={`${dashboardStats?.thisMonthStats.completed ?? 0}/${dashboardStats?.thisMonthStats.total ?? 0}`}\n          description={`${dashboardStats?.thisMonthStats.rate ?? 0}% completion`}\n          isLoading={dashboardLoading}\n        />\n      </div>\n\n      {/* Completion Trends Chart - Full Width */}\n      <div>\n        <CompletionTrendsChart\n          weeks={12}\n          title=\"Completion Trends\"\n          description=\"Your habit completion rate over the past 12 weeks\"\n        />\n      </div>\n\n      {/* Charts Row - Weekly and Monthly */}\n      <div className=\"grid gap-4 md:grid-cols-2\">\n        <WeeklySummaryChart\n          title=\"Completions by Day\"\n          description=\"Distribution of habit completions across the week\"\n        />\n        <MonthlySummaryChart\n          months={6}\n          title=\"Monthly Summary\"\n          description=\"Your habit completion rate by month\"\n        />\n      </div>\n\n      {/* Best and Needs Improvement Habits */}\n      <div className=\"grid gap-6 lg:grid-cols-2\">\n        <BestPerformingHabits\n          habits={periodStats?.bestPerformingHabits ?? []}\n          isLoading={periodLoading}\n        />\n        <NeedsImprovementHabits\n          habits={periodStats?.needsImprovementHabits ?? []}\n          isLoading={periodLoading}\n        />\n      </div>\n\n      {/* Category Distribution and Completion Rate */}\n      <div className=\"grid gap-4 md:grid-cols-2\">\n        <CategoryDistributionChart\n          title=\"Habits by Category\"\n          description=\"Distribution of your habits across categories\"\n        />\n        <WeeklySummaryChart\n          title=\"Completion Rate by Day\"\n          description=\"Average completion rate for each day of the week\"\n          showCompletionRate={true}\n        />\n      </div>\n\n      {/* Motivational Insights */}\n      <MotivationalInsights\n        statistics={periodStats ? {\n          completionRate: periodStats.completionRate,\n          totalActiveDays: periodStats.totalActiveDays,\n          avgDailyCompletionRate: periodStats.avgDailyCompletionRate,\n          bestPerformingHabits: periodStats.bestPerformingHabits,\n        } : null}\n        dashboardStats={dashboardStats ? {\n          totalActiveStreaks: dashboardStats.totalActiveStreaks,\n          bestCurrentStreak: dashboardStats.bestCurrentStreak,\n          bestStreakEver: dashboardStats.bestStreakEver,\n          bestDayOfWeek: dashboardStats.bestDayOfWeek,\n        } : null}\n        isLoading={isLoading}\n      />\n\n      {/* Streak and Consistency Cards */}\n      <div className=\"grid gap-4 md:grid-cols-2\">\n        <Card data-testid=\"streak-records-card\">\n          <CardHeader>\n            <CardTitle className=\"flex items-center gap-2\">\n              <Flame className=\"size-5 text-orange-500\" />\n              Streak Records\n            </CardTitle>\n            <CardDescription>Your best habit streaks</CardDescription>\n          </CardHeader>\n          <CardContent>\n            {dashboardLoading ? (\n              <div className=\"space-y-3\">\n                <div className=\"h-12 animate-pulse rounded bg-muted\" />\n                <div className=\"h-12 animate-pulse rounded bg-muted\" />\n              </div>\n            ) : dashboardStats?.bestStreakEver ? (\n              <div className=\"space-y-4\">\n                <div className=\"flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950\">\n                  <div className=\"flex items-center gap-3\">\n                    <Trophy className=\"size-8 text-yellow-500\" />\n                    <div>\n                      <p className=\"text-sm text-muted-foreground\">\n                        All-Time Best\n                      </p>\n                      <p className=\"font-medium\">\n                        {dashboardStats.bestStreakEver.habitName}\n                      </p>\n                    </div>\n                  </div>\n                  <div className=\"text-right\">\n                    <p className=\"text-2xl font-bold text-yellow-600 dark:text-yellow-400\">\n                      {dashboardStats.bestStreakEver.days}\n                    </p>\n                    <p className=\"text-xs text-muted-foreground\">days</p>\n                  </div>\n                </div>\n                {dashboardStats.bestCurrentStreak &&\n                  dashboardStats.bestCurrentStreak.habitId !==\n                    dashboardStats.bestStreakEver.habitId && (\n                    <div className=\"flex items-center justify-between rounded-lg border p-4\">\n                      <div className=\"flex items-center gap-3\">\n                        <Flame className=\"size-6 text-orange-500\" />\n                        <div>\n                          <p className=\"text-sm text-muted-foreground\">\n                            Current Best\n                          </p>\n                          <p className=\"font-medium\">\n                            {dashboardStats.bestCurrentStreak.habitName}\n                          </p>\n                        </div>\n                      </div>\n                      <div className=\"text-right\">\n                        <p className=\"text-xl font-bold\">\n                          {dashboardStats.bestCurrentStreak.days}\n                        </p>\n                        <p className=\"text-xs text-muted-foreground\">days</p>\n                      </div>\n                    </div>\n                  )}\n              </div>\n            ) : (\n              <p className=\"py-4 text-center text-sm text-muted-foreground\">\n                No streaks recorded yet. Start completing habits to build your streaks!\n              </p>\n            )}\n          </CardContent>\n        </Card>\n\n        <Card data-testid=\"consistency-card\">\n          <CardHeader>\n            <CardTitle className=\"flex items-center gap-2\">\n              <Award className=\"size-5 text-purple-500\" />\n              Consistency Champion\n            </CardTitle>\n            <CardDescription>Your most reliable habit</CardDescription>\n          </CardHeader>\n          <CardContent>\n            {dashboardLoading ? (\n              <div className=\"h-20 animate-pulse rounded bg-muted\" />\n            ) : dashboardStats?.mostConsistentHabit ? (\n              <div className=\"space-y-4\">\n                <div className=\"flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950\">\n                  <div className=\"flex items-center gap-3\">\n                    <div className=\"flex size-12 items-center justify-center rounded-full bg-purple-200 dark:bg-purple-800\">\n                      <Award className=\"size-6 text-purple-600 dark:text-purple-300\" />\n                    </div>\n                    <div>\n                      <p className=\"font-medium\">\n                        {dashboardStats.mostConsistentHabit.habitName}\n                      </p>\n                      <p className=\"text-sm text-muted-foreground\">\n                        Most consistent (7+ days tracked)\n                      </p>\n                    </div>\n                  </div>\n                  <div className=\"text-right\">\n                    <p className=\"text-2xl font-bold text-purple-600 dark:text-purple-400\">\n                      {dashboardStats.mostConsistentHabit.rate}%\n                    </p>\n                    <p className=\"text-xs text-muted-foreground\">completion</p>\n                  </div>\n                </div>\n                {dashboardStats.bestDayOfWeek && dashboardStats.bestDayOfWeek.completions > 0 && (\n                  <div className=\"rounded-lg border p-3\">\n                    <p className=\"text-sm text-muted-foreground\">\n                      Best day:{' '}\n                      <span className=\"font-medium text-foreground\">\n                        {dashboardStats.bestDayOfWeek.name}\n                      </span>{' '}\n                      ({dashboardStats.bestDayOfWeek.completions} completions)\n                    </p>\n                  </div>\n                )}\n              </div>\n            ) : (\n              <p className=\"py-4 text-center text-sm text-muted-foreground\">\n                Track habits for at least 7 days to see your most consistent habit.\n              </p>\n            )}\n          </CardContent>\n        </Card>\n      </div>\n    </div>\n  );\n}\n"
}
Now let me verify the build works by running the build command:

🔧 Tool: Bash
Input: {
  "command": "npm run build 2>&1 | head -100",
  "description": "Build the Next.js app to check for errors",
  "timeout": 120000
}
The build is running. Let me wait for it to complete:

🔧 Tool: Bash
Input: {
  "command": "npm run build 2>&1 | tail -50",
  "description": "Finish building the Next.js app",
  "timeout": 180000
}
The build is taking a while. Let me run it with more time:

🔧 Tool: Bash
Input: {
  "command": "cd C:\\\\Users\\\\timjn\\\\Workspace\\\\habit-tracker && npm run build 2>&1",
  "description": "Build the Next.js app",
  "timeout": 300000
}

🔧 Tool: Bash
Input: {
  "command": "npm run build 2>&1",
  "description": "Build the Next.js app",
  "timeout": 300000
}
Let me check TypeScript errors:

🔧 Tool: Bash
Input: {
  "command": "npx tsc --noEmit 2>&1",
  "description": "Check TypeScript errors",
  "timeout": 120000
}
Let me try a simpler type check:

🔧 Tool: Bash
Input: {
  "command": "pnpm exec tsc --noEmit --pretty 2>&1 | head -50",
  "description": "Check TypeScript errors with pnpm",
  "timeout": 120000
}
No TypeScript errors. Let me run the dev server to ensure the page loads:

🔧 Tool: Bash
Input: {
  "command": "pnpm dev &\nsleep 15\ncurl -s http://localhost:3000 | head -100",
  "description": "Start dev server and test",
  "timeout": 60000
}
The dev server is already running. Let me update the todo list and write a Playwright test to verify the feature:

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Extend statistics service with time period filtering (week, month, year, all-time)",
      "status": "completed",
      "activeForm": "Extending statistics service with time period filtering"
    },
    {
      "content": "Create hooks for period-filtered statistics",
      "status": "completed",
      "activeForm": "Creating hooks for period-filtered statistics"
    },
    {
      "content": "Build comprehensive statistics page with all sections",
      "status": "completed",
      "activeForm": "Building comprehensive statistics page"
    },
    {
      "content": "Test the statistics page with Playwright",
      "status": "in_progress",
      "activeForm": "Testing statistics page with Playwright"
    },
    {
      "content": "Commit changes",
      "status": "pending",
      "activeForm": "Committing changes"
    }
  ]
}

🔧 Tool: Write
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\e2e\\statistics-verification.spec.ts",
  "content": "import { test, expect } from '@playwright/test';\n\ntest.describe('Statistics Page Verification', () => {\n  test('should load the statistics page with all required sections', async ({ page }) => {\n    // Navigate to the statistics page\n    await page.goto('/statistics');\n\n    // Wait for the page to load\n    await expect(page.getByTestId('statistics-page')).toBeVisible({ timeout: 10000 });\n\n    // Verify the page header\n    await expect(page.getByRole('heading', { name: 'Statistics' })).toBeVisible();\n    await expect(page.getByText('Track your progress and discover patterns')).toBeVisible();\n\n    // Verify period selector exists\n    await expect(page.getByTestId('period-selector')).toBeVisible();\n\n    // Verify overview stats section\n    await expect(page.getByTestId('overview-stats')).toBeVisible();\n\n    // Verify stat cards are present (should have multiple)\n    const statCards = page.getByTestId('stat-card');\n    await expect(statCards.first()).toBeVisible();\n    expect(await statCards.count()).toBeGreaterThanOrEqual(4);\n\n    // Verify charts sections exist\n    await expect(page.getByText('Completions by Day')).toBeVisible();\n    await expect(page.getByText('Monthly Summary')).toBeVisible();\n    await expect(page.getByText('Completion Trends')).toBeVisible();\n\n    // Verify best habits section\n    await expect(page.getByTestId('best-habits-card')).toBeVisible();\n    await expect(page.getByText('Top Performers')).toBeVisible();\n\n    // Verify needs improvement section\n    await expect(page.getByTestId('needs-improvement-card')).toBeVisible();\n\n    // Verify insights section\n    await expect(page.getByTestId('motivational-insights-card')).toBeVisible();\n    await expect(page.getByText('Insights & Motivation')).toBeVisible();\n\n    // Verify streak records section\n    await expect(page.getByTestId('streak-records-card')).toBeVisible();\n    await expect(page.getByText('Streak Records')).toBeVisible();\n\n    // Verify consistency champion section\n    await expect(page.getByTestId('consistency-card')).toBeVisible();\n    await expect(page.getByText('Consistency Champion')).toBeVisible();\n  });\n\n  test('should be able to change the time period filter', async ({ page }) => {\n    // Navigate to the statistics page\n    await page.goto('/statistics');\n\n    // Wait for page to load\n    await expect(page.getByTestId('statistics-page')).toBeVisible({ timeout: 10000 });\n\n    // Click on the period selector\n    await page.getByTestId('period-selector').click();\n\n    // Verify all period options are available\n    await expect(page.getByRole('option', { name: 'This Week' })).toBeVisible();\n    await expect(page.getByRole('option', { name: 'This Month' })).toBeVisible();\n    await expect(page.getByRole('option', { name: 'This Year' })).toBeVisible();\n    await expect(page.getByRole('option', { name: 'All Time' })).toBeVisible();\n\n    // Select a different period\n    await page.getByRole('option', { name: 'This Week' }).click();\n\n    // Verify the selector shows the new value\n    await expect(page.getByTestId('period-selector')).toContainText('This Week');\n\n    // Change to another period\n    await page.getByTestId('period-selector').click();\n    await page.getByRole('option', { name: 'All Time' }).click();\n\n    // Verify the selector shows the new value\n    await expect(page.getByTestId('period-selector')).toContainText('All Time');\n  });\n\n  test('should show category distribution chart', async ({ page }) => {\n    // Navigate to the statistics page\n    await page.goto('/statistics');\n\n    // Wait for page to load\n    await expect(page.getByTestId('statistics-page')).toBeVisible({ timeout: 10000 });\n\n    // Verify category distribution section\n    await expect(page.getByText('Habits by Category')).toBeVisible();\n    await expect(page.getByText('Distribution of your habits across categories')).toBeVisible();\n  });\n\n  test('should display today, this week, and this month stats', async ({ page }) => {\n    // Navigate to the statistics page\n    await page.goto('/statistics');\n\n    // Wait for page to load\n    await expect(page.getByTestId('statistics-page')).toBeVisible({ timeout: 10000 });\n\n    // Verify period stats are displayed\n    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();\n    await expect(page.getByRole('heading', { name: 'This Week' })).toBeVisible();\n    await expect(page.getByRole('heading', { name: 'This Month' })).toBeVisible();\n  });\n\n  test('should load without errors', async ({ page }) => {\n    // Navigate to the statistics page\n    await page.goto('/statistics');\n\n    // Check that error state is not shown\n    const errorElement = page.getByTestId('statistics-error');\n    await expect(errorElement).not.toBeVisible({ timeout: 10000 });\n\n    // Verify main page is visible\n    await expect(page.getByTestId('statistics-page')).toBeVisible();\n  });\n});\n"
}

🔧 Tool: Bash
Input: {
  "command": "pnpm exec playwright test e2e/statistics-verification.spec.ts --reporter=list 2>&1",
  "description": "Run Playwright test for statistics page",
  "timeout": 120000
}

🔧 Tool: Bash
Input: {
  "command": "pnpm exec playwright test statistics-verification --reporter=list 2>&1",
  "description": "Run Playwright test for statistics page",
  "timeout": 120000
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\playwright.config.ts"
}
I see - the test directory is `./tests`, not `./e2e`. Let me move the test file:

🔧 Tool: Bash
Input: {
  "command": "mv e2e/statistics-verification.spec.ts tests/statistics-verification.spec.ts 2>&1",
  "description": "Move test file to tests directory"
}

🔧 Tool: Bash
Input: {
  "command": "pnpm exec playwright test statistics-verification --reporter=list 2>&1",
  "description": "Run Playwright test for statistics page",
  "timeout": 120000
}
4 out of 5 tests pass. Let me fix the failing test - the issue is that "Today", "This Week", etc. are not headings but card titles:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\tests\\statistics-verification.spec.ts",
  "old_string": "  test('should display today, this week, and this month stats', async ({ page }) => {\n    // Navigate to the statistics page\n    await page.goto('/statistics');\n\n    // Wait for page to load\n    await expect(page.getByTestId('statistics-page')).toBeVisible({ timeout: 10000 });\n\n    // Verify period stats are displayed\n    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();\n    await expect(page.getByRole('heading', { name: 'This Week' })).toBeVisible();\n    await expect(page.getByRole('heading', { name: 'This Month' })).toBeVisible();\n  });",
  "new_string": "  test('should display today, this week, and this month stats', async ({ page }) => {\n    // Navigate to the statistics page\n    await page.goto('/statistics');\n\n    // Wait for page to load\n    await expect(page.getByTestId('statistics-page')).toBeVisible({ timeout: 10000 });\n\n    // Verify period stats are displayed (these are CardTitle elements with \"Today\", \"This Week\", \"This Month\")\n    const statCards = page.getByTestId('stat-card');\n\n    // Should have at least 7 stat cards (4 overview + 3 period)\n    expect(await statCards.count()).toBeGreaterThanOrEqual(7);\n\n    // Check specific stat labels are present\n    await expect(page.getByText('Completion Rate')).toBeVisible();\n    await expect(page.getByText('Total Completions')).toBeVisible();\n    await expect(page.getByText('Active Days')).toBeVisible();\n    await expect(page.getByText('Active Streaks')).toBeVisible();\n  });"
}

🔧 Tool: Read
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\tests\\statistics-verification.spec.ts"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\tests\\statistics-verification.spec.ts",
  "old_string": "  test('should display today, this week, and this month stats', async ({ page }) => {\n    // Navigate to the statistics page\n    await page.goto('/statistics');\n\n    // Wait for page to load\n    await expect(page.getByTestId('statistics-page')).toBeVisible({ timeout: 10000 });\n\n    // Verify period stats are displayed\n    await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();\n    await expect(page.getByRole('heading', { name: 'This Week' })).toBeVisible();\n    await expect(page.getByRole('heading', { name: 'This Month' })).toBeVisible();\n  });",
  "new_string": "  test('should display overview stats', async ({ page }) => {\n    // Navigate to the statistics page\n    await page.goto('/statistics');\n\n    // Wait for page to load\n    await expect(page.getByTestId('statistics-page')).toBeVisible({ timeout: 10000 });\n\n    // Verify stat cards are displayed (there should be 7 stat cards: 4 overview + 3 period)\n    const statCards = page.getByTestId('stat-card');\n    expect(await statCards.count()).toBeGreaterThanOrEqual(7);\n\n    // Check specific stat labels are present\n    await expect(page.getByText('Completion Rate')).toBeVisible();\n    await expect(page.getByText('Total Completions')).toBeVisible();\n    await expect(page.getByText('Active Days')).toBeVisible();\n    await expect(page.getByText('Active Streaks')).toBeVisible();\n  });"
}

🔧 Tool: Bash
Input: {
  "command": "pnpm exec playwright test statistics-verification --reporter=list 2>&1",
  "description": "Run Playwright test for statistics page",
  "timeout": 120000
}
The tests are failing due to strict mode violations - there are multiple matching elements. Let me fix the tests to be more specific:

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\tests\\statistics-verification.spec.ts",
  "old_string": "    // Verify charts sections exist\n    await expect(page.getByText('Completions by Day')).toBeVisible();\n    await expect(page.getByText('Monthly Summary')).toBeVisible();\n    await expect(page.getByText('Completion Trends')).toBeVisible();",
  "new_string": "    // Verify charts sections exist\n    await expect(page.getByText('Completions by Day').first()).toBeVisible();\n    await expect(page.getByText('Monthly Summary', { exact: true })).toBeVisible();\n    await expect(page.getByText('Completion Trends', { exact: true })).toBeVisible();"
}

🔧 Tool: Edit
Input: {
  "file_path": "C:\\Users\\timjn\\Workspace\\habit-tracker\\tests\\statistics-verification.spec.ts",
  "old_string": "    // Check specific stat labels are present\n    await expect(page.getByText('Completion Rate')).toBeVisible();\n    await expect(page.getByText('Total Completions')).toBeVisible();\n    await expect(page.getByText('Active Days')).toBeVisible();\n    await expect(page.getByText('Active Streaks')).toBeVisible();",
  "new_string": "    // Check specific stat labels are present in the overview stats section\n    const overviewStats = page.getByTestId('overview-stats');\n    await expect(overviewStats.getByText('Completion Rate')).toBeVisible();\n    await expect(overviewStats.getByText('Total Completions')).toBeVisible();\n    await expect(overviewStats.getByText('Active Days')).toBeVisible();\n    await expect(overviewStats.getByText('Active Streaks')).toBeVisible();"
}

🔧 Tool: Bash
Input: {
  "command": "pnpm exec playwright test statistics-verification --reporter=list 2>&1",
  "description": "Run Playwright test for statistics page",
  "timeout": 120000
}
All 5 tests pass. Now let me delete the test file as required and update the todo list:

🔧 Tool: Bash
Input: {
  "command": "rm tests/statistics-verification.spec.ts 2>&1",
  "description": "Delete verification test file"
}

🔧 Tool: Bash
Input: {
  "command": "rmdir e2e 2>&1 || rm -rf e2e 2>&1 || echo \"No e2e dir to remove\"",
  "description": "Clean up empty e2e directory"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Extend statistics service with time period filtering (week, month, year, all-time)",
      "status": "completed",
      "activeForm": "Extending statistics service with time period filtering"
    },
    {
      "content": "Create hooks for period-filtered statistics",
      "status": "completed",
      "activeForm": "Creating hooks for period-filtered statistics"
    },
    {
      "content": "Build comprehensive statistics page with all sections",
      "status": "completed",
      "activeForm": "Building comprehensive statistics page"
    },
    {
      "content": "Test the statistics page with Playwright",
      "status": "completed",
      "activeForm": "Testing statistics page with Playwright"
    },
    {
      "content": "Commit changes",
      "status": "in_progress",
      "activeForm": "Committing changes"
    }
  ]
}
Now let me commit the changes:

🔧 Tool: Bash
Input: {
  "command": "git status 2>&1",
  "description": "Check git status"
}

🔧 Tool: Bash
Input: {
  "command": "git diff src/app/statistics/page.tsx --stat 2>&1",
  "description": "Check what changed in statistics page"
}

🔧 Tool: Bash
Input: {
  "command": "git diff --stat src/app/statistics/page.tsx 2>&1",
  "description": "Check what changed in statistics page"
}

🔧 Tool: Bash
Input: {
  "command": "git log --oneline -5 2>&1",
  "description": "Check recent commits"
}

🔧 Tool: Bash
Input: {
  "command": "git add src/app/statistics/page.tsx src/lib/database/statisticsService.ts src/lib/database/useStatistics.ts src/lib/database/index.ts && git status 2>&1",
  "description": "Stage files for commit"
}

🔧 Tool: Bash
Input: {
  "command": "git commit -m \"$(cat <<'EOF'\nfeat(statistics): Build comprehensive statistics dashboard with period filters\n\n- Add time period filtering (week, month, year, all-time) to statistics service\n- Create usePeriodStatistics hook for reactive period-based statistics\n- Add PeriodStatistics interface with detailed metrics:\n  - Best/worst performing habits\n  - Category performance breakdown\n  - Daily completion trends\n  - Active days and average daily completion rate\n- Enhance statistics page with:\n  - Period selector dropdown (week/month/year/all-time)\n  - Top performers and needs improvement habit sections\n  - Motivational insights based on completion rates and streaks\n  - Streak records and consistency champion cards\n  - Category distribution and completion rate by day charts\n- Export new types (StatisticsPeriod, PeriodStatistics) and hooks\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>\nEOF\n)\"",
  "description": "Commit the statistics dashboard changes"
}

🔧 Tool: TodoWrite
Input: {
  "todos": [
    {
      "content": "Extend statistics service with time period filtering (week, month, year, all-time)",
      "status": "completed",
      "activeForm": "Extending statistics service with time period filtering"
    },
    {
      "content": "Create hooks for period-filtered statistics",
      "status": "completed",
      "activeForm": "Creating hooks for period-filtered statistics"
    },
    {
      "content": "Build comprehensive statistics page with all sections",
      "status": "completed",
      "activeForm": "Building comprehensive statistics page"
    },
    {
      "content": "Test the statistics page with Playwright",
      "status": "completed",
      "activeForm": "Testing statistics page with Playwright"
    },
    {
      "content": "Commit changes",
      "status": "completed",
      "activeForm": "Committing changes"
    }
  ]
}
<summary>
## Summary: Build comprehensive statistics page displaying overall habit performance

### Changes Implemented
- Extended statistics service with time period filtering (week, month, year, all-time)
- Created `getPeriodStatistics` function that calculates comprehensive period-based statistics
- Added `PeriodStatistics` interface with detailed metrics including:
  - Best/worst performing habits with completion rates
  - Category performance breakdown
  - Daily completion trends
  - Active days and average daily completion rate
  - Completions by day of week
- Created `usePeriodStatistics` hook for reactive period-based statistics
- Enhanced statistics page with:
  - Period selector dropdown UI (week/month/year/all-time)
  - Overview stats cards showing completion rate, total completions, active days, and active streaks
  - Best Performing Habits section (Top Performers) showing top 5 habits by completion rate
  - Needs Improvement section showing habits with completion rate below 50%
  - Motivational Insights section with personalized messages based on performance data
  - Streak Records card showing all-time best and current best streaks
  - Consistency Champion card showing most reliable habit
  - Integration with existing chart components (completion trends, weekly summary, monthly summary, category distribution)

### Files Modified
- `src/lib/database/statisticsService.ts` - Added StatisticsPeriod type, PeriodStatistics interface, and getPeriodStatistics function
- `src/lib/database/useStatistics.ts` - Added usePeriodStatistics hook and UsePeriodStatisticsResult type
- `src/lib/database/index.ts` - Exported new types and functions
- `src/app/statistics/page.tsx` - Complete rewrite with comprehensive statistics dashboard

### Notes for Developer
- The period filter defaults to "This Month" and can be changed to "This Week", "This Year", or "All Time"
- Best performing habits shows top 5 habits sorted by completion rate
- Needs improvement section only shows habits with completion rate below 50%
- Motivational insights are dynamically generated based on current performance metrics
- All data is reactive and updates automatically when habits or logs change

### Verification Status
- Verified with Playwright tests (5 tests passed):
  - Page loads with all required sections
  - Period selector works (can change between week/month/year/all-time)
  - Category distribution chart displays
  - Overview stats display correctly
  - Page loads without errors
- Test file deleted after verification as requested
</summary>