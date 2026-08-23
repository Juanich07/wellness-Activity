'use client';

import { User } from 'lucide-react';
import Card from '@/components/common/Card';
import ProgressRing from '@/components/common/ProgressRing';
import {
  mockDashboardStats,
  mockActivityFeed,
} from '@/lib/mockData';

/**
 * Admin Dashboard Page
 * High-level metrics and analytics with Lucide icons
 * - Total employees count
 * - Overall participation rate
 * - Active streaks
 * - Breaks completed today
 * - Recent activity feed
 */
export default function AdminDashboard() {
  const stats = mockDashboardStats;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard Overview
        </h1>
        <p className="mt-2 text-slate-600">
          Monitor employee wellness engagement and participation metrics
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Employees */}
        <Card>
          <div className="text-center">
            <p className="text-sm text-slate-600 font-medium">Total Employees</p>
            <p className="mt-3 text-4xl font-bold text-teal-600">
              {stats.totalEmployees}
            </p>
            <p className="mt-2 text-xs text-slate-500">Active in system</p>
          </div>
        </Card>

        {/* Participation Rate */}
        <Card className="flex flex-col items-center justify-center">
          <ProgressRing
            percentage={Math.round(stats.participationRate)}
            label="Participation"
            size="sm"
            color="emerald"
          />
          <p className="mt-3 text-xs text-slate-500 text-center">
            Of employees engaging
          </p>
        </Card>

        {/* Active Streaks */}
        <Card>
          <div className="text-center">
            <p className="text-sm text-slate-600 font-medium">Active Streaks</p>
            <p className="mt-3 text-4xl font-bold text-emerald-500">
              {stats.activeStreaks}
            </p>
            <p className="mt-2 text-xs text-slate-500">Employees with streaks</p>
          </div>
        </Card>

        {/* Completed Breaks Today */}
        <Card>
          <div className="text-center">
            <p className="text-sm text-slate-600 font-medium">
              Breaks Completed
            </p>
            <p className="mt-3 text-4xl font-bold text-blue-600">
              {stats.completedBreaksToday}
            </p>
            <p className="mt-2 text-xs text-slate-500">Today</p>
          </div>
        </Card>
      </div>

      {/* Analytics and Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Participation Trend Chart */}
        <Card title="Participation Trend (Last 7 Days)">
          <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-2">📈</p>
              <p className="text-sm text-slate-600">
                Line chart visualization
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Recommend: Recharts or Chart.js
              </p>
            </div>
          </div>
        </Card>

        {/* Activity Distribution Chart */}
        <Card title="Activity Distribution">
          <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-5xl mb-2">🥧</p>
              <p className="text-sm text-slate-600">
                Pie chart visualization
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Shows breakdown by activity type
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-600 font-medium">
            Average Sessions/Week
          </p>
          <p className="mt-2 text-3xl font-bold text-teal-600">
            {stats.averageSessions}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-600 font-medium">
            Most Popular Activity
          </p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            Morning Stretches
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-600 font-medium">
            Engagement Score
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-500">8.5/10</p>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card title="Recent Activity Feed">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {mockActivityFeed.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 border-b border-slate-200 pb-3 last:border-b-0"
            >
              <div className={`flex-shrink-0 rounded-full p-2 ${activity.avatarColor}`}>
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">
                  {activity.userName}
                </p>
                <p className="text-sm text-slate-600">
                  {activity.activity}
                </p>
              </div>
              <div className="text-xs text-slate-500 flex-shrink-0">
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Health Indicators */}
      <Card title="System Health">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Database Status
            </span>
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500"></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              API Response
            </span>
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500"></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Firebase Sync
            </span>
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500"></span>
          </div>
        </div>
      </Card>
    </div>
  );
}
