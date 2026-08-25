'use client';

import Card from '@/components/common/Card';
import { mockDashboardStats, participationTrendData } from '@/lib/mockData';

export default function ReportsPage() {
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Participation Reports</h1>
        <p className="mt-2 text-slate-600">Summary views for admin reporting and participation trends.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-slate-600">Participation Rate</p>
          <p className="mt-2 text-3xl font-bold text-teal-600">{Math.round(stats.participationRate)}%</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-600">Active Streaks</p>
          <p className="mt-2 text-3xl font-bold text-emerald-500">{stats.activeStreaks}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-600">Breaks Completed</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats.completedBreaksToday}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-600">Average Sessions</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.averageSessions}</p>
        </Card>
      </div>

      <Card title="7-Day Participation Trend">
        <div className="space-y-3">
          {participationTrendData.map((item) => (
            <div key={item.day} className="flex items-center gap-3">
              <span className="w-8 text-sm font-medium text-slate-600">{item.day}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-teal-500" style={{ width: `${item.participation}%` }} />
              </div>
              <span className="w-10 text-right text-sm font-semibold text-slate-900">{item.participation}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}