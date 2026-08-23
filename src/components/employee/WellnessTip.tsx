'use client';

import { Icon } from '@/components/common/Icon';
import Card from '@/components/common/Card';
import { WellnessTip as WellnessTipType } from '@/lib/types';

interface WellnessTipProps {
  tip: WellnessTipType;
}

/**
 * WellnessTip Component
 * Compact green tip card matching the mobile mockup.
 */
export default function WellnessTip({ tip }: WellnessTipProps) {
  const defaultIcon = 'Heart';
  const iconName = tip.icon || defaultIcon;

  return (
    <Card className="rounded-[22px] border-0 bg-gradient-to-br from-[#daf1ea] to-[#d2f1de] p-4 shadow-none">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-emerald-700 shadow-sm">
          <Icon name={iconName} size={20} className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Daily Wellness Tip
          </p>
          <h3 className="mt-1 text-sm font-bold text-slate-900">{tip.title}</h3>
          <p className="mt-1 text-xs text-slate-700">{tip.content}</p>
        </div>
      </div>
    </Card>
  );
}
