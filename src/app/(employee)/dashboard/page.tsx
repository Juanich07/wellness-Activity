'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import BreakLauncher from '@/components/employee/BreakLauncher';
import StreakCard from '@/components/employee/StreakCard';
import DailySchedule from '@/components/employee/DailySchedule';
import WellnessTip from '@/components/employee/WellnessTip';
import {
  mockUserProgress,
  mockDailySchedule,
  wellnessTips,
} from '@/lib/mockData';

/**
 * Employee Dashboard Page
 * Mobile-first design matching the provided phone mockup.
 */
export default function EmployeeDashboard() {
  const [tip, setTip] = useState(wellnessTips[0]);

  useEffect(() => {
    const randomTip =
      wellnessTips[Math.floor(Math.random() * wellnessTips.length)];
    setTip(randomTip);
  }, []);

  return (
    <div className="mx-auto max-w-[390px] space-y-3 rounded-[28px] bg-[#edf2f2] p-3 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:max-w-none md:space-y-6 md:bg-transparent md:p-0 md:shadow-none">
      <div className="flex items-center gap-2 rounded-2xl bg-white/40 px-2 py-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <h1 className="text-[15px] font-bold text-slate-900">Daily Wellness</h1>
      </div>

      <div className="hidden md:block">
        <h1 className="text-3xl font-bold text-slate-900">Welcome Back!</h1>
        <p className="mt-2 text-slate-600">
          Let's keep up your wellness streak. You're doing great! 🎉
        </p>
      </div>

      <div className="space-y-3 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-2">
          <BreakLauncher />
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          <StreakCard data={mockUserProgress} />
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          <DailySchedule items={mockDailySchedule} />
        </div>

        <div className="md:col-span-2 lg:col-span-4">
          <WellnessTip tip={tip} />
        </div>
      </div>
    </div>
  );
}
