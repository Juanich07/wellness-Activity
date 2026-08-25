'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  LineChart,
  MessageSquare,
  Goal,
  Target,
  Users,
  UserCog,
  ShieldCheck,
} from 'lucide-react';
import Card from '@/components/common/Card';
import ProgressRing from '@/components/common/ProgressRing';
import {
  mockDashboardStats,
} from '@/lib/mockData';

/**
 * Admin Dashboard Page
 * Entry point for admin management and reporting.
 */
export default function AdminDashboard() {
  const stats = mockDashboardStats;

  const adminCards = [
    {
      href: '/admin/users',
      title: 'User Management',
      description: 'Create, update, and remove employee user accounts.',
      Icon: UserCog,
    },
    {
      href: '/admin/participation',
      title: 'Employee Participation',
      description: 'View every employee account and open their profile details.',
      Icon: Users,
    },
    {
      href: '/admin/activities',
      title: 'Wellness Activity Management',
      description: 'Review and manage the office wellness activity catalog.',
      Icon: Target,
    },
    {
      href: '/admin/education',
      title: 'Health Education Management',
      description: 'Review education topics, cards, and learning content.',
      Icon: BookOpen,
    },
    {
      href: '/admin/progress',
      title: 'Progress Management',
      description: 'Manage goals and progress content shown to employees.',
      Icon: Goal,
    },
    {
      href: '/admin/reports',
      title: 'Participation Statistics',
      description: 'Open admin reports for participation and engagement trends.',
      Icon: LineChart,
    },
    {
      href: '/admin/feedback',
      title: 'Feedback Summary',
      description: 'See employee feedback themes and common suggestions.',
      Icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin Login → Dashboard → Participation → Reports
        </div>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Manage employee participation, wellness content, feedback, and reporting from one place.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-1 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible">
        <Card className="min-w-[12rem] flex-shrink-0 md:min-w-0 md:flex-shrink md:grow">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">Total Employees</p>
            <p className="mt-3 text-4xl font-bold text-teal-600">
              {stats.totalEmployees}
            </p>
            <p className="mt-2 text-xs text-slate-500">Active in system</p>
          </div>
        </Card>

        <Card className="min-w-[12rem] flex flex-shrink-0 flex-col items-center justify-center md:min-w-0 md:flex-shrink md:grow">
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

        <Card className="min-w-[12rem] flex-shrink-0 md:min-w-0 md:flex-shrink md:grow">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">Active Streaks</p>
            <p className="mt-3 text-4xl font-bold text-emerald-500">
              {stats.activeStreaks}
            </p>
            <p className="mt-2 text-xs text-slate-500">Employees with streaks</p>
          </div>
        </Card>

        <Card className="min-w-[12rem] flex-shrink-0 md:min-w-0 md:flex-shrink md:grow">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">Breaks Completed</p>
            <p className="mt-3 text-4xl font-bold text-blue-600">
              {stats.completedBreaksToday}
            </p>
            <p className="mt-2 text-xs text-slate-500">Today</p>
          </div>
        </Card>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible xl:grid-cols-3">
        {adminCards.map(({ href, title, description, Icon }) => (
          <Link key={href} href={href} className="block min-w-[18rem] flex-shrink-0 md:min-w-0 md:flex-shrink md:grow">
            <Card className="h-full rounded-[22px] border-0 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{description}</p>
                  </div>
                </div>

                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
    </div>
  );
}
