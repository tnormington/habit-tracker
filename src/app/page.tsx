'use client';

import { DailyCheckIn } from '@/components/habits';

function formatTodayDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Today's Check-In</h1>
        <p className="mt-1 text-muted-foreground">
          {formatTodayDate()}
        </p>
      </div>

      <DailyCheckIn />
    </div>
  );
}
