'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import Card from '@/components/common/Card';
import { db } from '@/lib/firebase';
import { asDailyProgressRecord, DailyProgressRecord } from '@/lib/dailyProgress';

type UserRecord = { id: string; name?: string; email?: string };

export default function ReportsPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [records, setRecords] = useState<DailyProgressRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [userSnapshot, progressSnapshot] = await Promise.all([
          getDocs(collection(db, 'user')),
          getDocs(collection(db, 'dailyProgress')),
        ]);
        setUsers(userSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as UserRecord[]);
        setRecords(progressSnapshot.docs.map((item) => asDailyProgressRecord(item.id, item.data())));
      } catch (loadError) {
        console.error('Failed to load historical progress reports', loadError);
      }
    };
    void load();
  }, []);

  const userName = (userId: string) => {
    const user = users.find((item) => item.id === userId);
    return user?.name || user?.email || userId;
  };

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Participation Reports</h1>
          <p className="mt-2 text-slate-600">Historical daily progress logs for every employee.</p>
        </div>

        <Card title="Daily Progress History">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Employee</th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Participation</th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Completion</th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Activities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length > 0 ? [...records].sort((a, b) => b.dateKey.localeCompare(a.dateKey)).map((record) => (
                  <tr key={record.id}>
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-900">{record.dateKey}</td>
                    <td className="px-3 py-3 text-slate-700">{userName(record.userId)}</td>
                    <td className="px-3 py-3">{record.startedIds.length > 0 ? 'Active' : 'Inactive'}</td>
                    <td className="px-3 py-3">{record.ids.length ? Math.round((record.completedIds.length / record.ids.length) * 100) : 0}%</td>
                    <td className="px-3 py-3 text-slate-600">{record.activities.filter((activity) => record.completedIds.includes(activity.id)).map((activity) => activity.title).join(', ') || 'None completed'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-3 py-8 text-center text-slate-500">No progress logs have been recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
}