'use client';

import Card from '@/components/common/Card';
import ProgressRing from '@/components/common/ProgressRing';
import { UserProgress } from '@/lib/types';

interface StreakCardProps {
  data: UserProgress;
  completionPercent?: number;
  completedToday?: number;
  totalToday?: number;
}

/**
 * StreakCard Component
 * Compact mobile-friendly participation card matching the mockup.
 */
export default function StreakCard({
  data,
  completionPercent,
  completedToday,
  totalToday,
}: StreakCardProps) {
  const streakPercentage = Math.min((data.currentStreak / 365) * 100, 100);
  const percentage = typeof completionPercent === 'number'
    ? Math.max(0, Math.min(100, completionPercent))
    : streakPercentage;

  return (
    <Card className="rounded-[22px] bg-[#f4f7f7] p-4 shadow-none ring-0">
      <div className="flex items-center gap-3">
        <ProgressRing
          percentage={Math.round(percentage)}
          label="Current"
          size="sm"
          color="emerald"
        />

        <div className="flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Daily Progress
          </p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {Math.round(percentage)}%
            </span>
            <span className="pb-1 text-[10px] text-slate-500">
              {typeof completedToday === 'number' && typeof totalToday === 'number'
                ? `${completedToday}/${totalToday} completed today`
                : `${data.currentStreak} days in a row`}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
