'use client';

import Card from '@/components/common/Card';
import ProgressRing from '@/components/common/ProgressRing';
import { UserProgress } from '@/lib/types';

interface StreakCardProps {
  data: UserProgress;
}

/**
 * StreakCard Component
 * Compact mobile-friendly participation card matching the mockup.
 */
export default function StreakCard({ data }: StreakCardProps) {
  const streakPercentage = Math.min((data.currentStreak / 365) * 100, 100);

  return (
    <Card className="rounded-[22px] bg-[#f4f7f7] p-4 shadow-none ring-0">
      <div className="flex items-center gap-3">
        <ProgressRing
          percentage={Math.round(streakPercentage)}
          label="Current"
          size="sm"
          color="emerald"
        />

        <div className="flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Participation Progress
          </p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {Math.round(streakPercentage)}%
            </span>
            <span className="pb-1 text-[10px] text-slate-500">
              {data.currentStreak} days in a row
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
