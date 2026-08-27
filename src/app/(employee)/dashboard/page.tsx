'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Dumbbell } from 'lucide-react';
import Card from '@/components/common/Card';
import StreakCard from '@/components/employee/StreakCard';
import DailySchedule from '@/components/employee/DailySchedule';
import {
  mockUserProgress,
} from '@/lib/mockData';

/**
 * Employee Dashboard Page
 * Mobile-first design matching the provided phone mockup.
 */
export default function EmployeeDashboard() {
  const [completedToday, setCompletedToday] = useState(0);
  const [totalToday, setTotalToday] = useState(0);

  const completionPercent = useMemo(() => {
    if (totalToday <= 0) {
      return 0;
    }

    return (completedToday / totalToday) * 100;
  }, [completedToday, totalToday]);

  return (
    <div className="mx-auto max-w-[390px] space-y-3 rounded-[28px] bg-[#edf2f2] p-3 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:max-w-none md:space-y-6 md:bg-transparent md:p-0 md:shadow-none">
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/40 px-3 py-3 md:hidden">
        <h1 className="text-[15px] font-bold text-slate-900">Dashboard</h1>
        <Link
          href="/progress"
          className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white"
        >
          Daily Progress
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="hidden md:block">
        <h1 className="text-3xl font-bold text-slate-900">Welcome Back!</h1>
        <p className="mt-2 text-slate-600">
          Let&apos;s keep up your wellness streak. You&apos;re doing great! 🎉
        </p>
      </div>

      <div className="space-y-3 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-2">
          <Link href="/progress" className="block">
            <StreakCard
              data={mockUserProgress}
              completionPercent={completionPercent}
              completedToday={completedToday}
              totalToday={totalToday}
            />
          </Link>
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          <DailySchedule
            onProgressChange={(completedCount, totalCount) => {
              setCompletedToday(completedCount);
              setTotalToday(totalCount);
            }}
          />
        </div>

        <div className="grid gap-3 md:col-span-2 md:grid-cols-2 lg:col-span-4">
          <Link href="/activities" className="block">
            <Card className="rounded-[22px] border-0 bg-gradient-to-br from-[#f1f8ff] to-[#eef7ff] p-3 shadow-none transition-transform hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
                      Activities
                    </p>
                    <h3 className="mt-0.5 text-sm font-bold text-slate-900">
                      View activity cards
                    </h3>
                  </div>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-teal-600 shadow-sm">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/education" className="block">
            <Card className="rounded-[22px] border-0 bg-gradient-to-br from-[#ecf9f0] to-[#e4f3ff] p-3 shadow-none transition-transform hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
                      Education
                    </p>
                    <h3 className="mt-0.5 text-sm font-bold text-slate-900">
                      Learn wellness topics
                    </h3>
                  </div>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-teal-600 shadow-sm">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
