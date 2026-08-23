'use client';

import {
  MessageSquare,
  Play,
  Sparkles,
  Wind,
} from 'lucide-react';
import Card from '@/components/common/Card';

const phases = [
  { label: 'Warm-up', Icon: Sparkles },
  { label: 'Main Activity', Icon: Play },
  { label: 'Cool-down', Icon: Wind },
  { label: 'Message', Icon: MessageSquare },
];

/**
 * BreakLauncher Component
 * Compact mobile-first version matching the provided phone mockup.
 */
export default function BreakLauncher() {
  return (
    <Card className="rounded-[22px] border-0 bg-gradient-to-br from-[#74c8d3] via-[#7bc9d3] to-[#a7e0d9] p-0 shadow-none">
      <div className="rounded-[22px] p-4">
        <h3 className="text-lg font-bold text-slate-900">Today's Wellness Break</h3>

        <div className="mt-3 flex flex-wrap gap-2">
          {phases.map(({ label, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-full bg-white/55 px-2 py-1 text-[10px] font-medium text-slate-700"
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
