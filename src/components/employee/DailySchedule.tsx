'use client';

import { Icon } from '@/components/common/Icon';
import Card from '@/components/common/Card';

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  type: string;
  duration: number;
  icon?: string;
}

interface DailyScheduleProps {
  items: ScheduleItem[];
}

/**
 * DailySchedule Component
 * Compact mobile card matching the provided design.
 */
export default function DailySchedule({ items }: DailyScheduleProps) {
  const iconMap: Record<string, string> = {
    'Stretching': 'Yoga',
    'Walking': 'Footprints',
    'Aerobic': 'Music',
    'Strengthening': 'Zap',
    'Desk exercises': 'Monitor',
  };

  return (
    <Card className="rounded-[22px] bg-[#f5f8f8] p-4 shadow-none ring-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">Schedule</h3>
        <span className="text-lg text-slate-400">•••</span>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-center text-sm text-slate-500">No activities scheduled yet</p>
        ) : (
          items.slice(0, 3).map((item) => {
            const iconName = item.icon || iconMap[item.type] || 'Calendar';

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Icon name={iconName} size={18} className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-[11px] text-slate-500">{item.time} • {item.duration}min</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
