'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { AlertCircle, Search, User, X } from 'lucide-react';
import Card from '@/components/common/Card';
import { db } from '@/lib/firebase';
import { asDailyProgressRecord, DailyProgressRecord, getLocalDateKey } from '@/lib/dailyProgress';

type EmployeeRecord = { id: string; name?: string; email?: string; role?: string };
const labelFor = (user: EmployeeRecord) => user.name || user.email || user.id;

export default function ParticipationPage() {
  const [users, setUsers] = useState<EmployeeRecord[]>([]);
  const [records, setRecords] = useState<DailyProgressRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<EmployeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [userSnapshot, progressSnapshot] = await Promise.all([getDocs(collection(db, 'user')), getDocs(collection(db, 'dailyProgress'))]);
        const loadedUsers = userSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as EmployeeRecord).filter((user) => user.role !== 'admin');
        setUsers(loadedUsers);
        setRecords(progressSnapshot.docs.map((item) => asDailyProgressRecord(item.id, item.data())));
      } catch (loadError) {
        console.error('Failed to load participation data', loadError);
        setError('Could not load live participation data. Check Firestore permissions for users and dailyProgress.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const todayRecords = useMemo(() => new Map(records.filter((record) => record.dateKey === getLocalDateKey()).map((record) => [record.userId, record])), [records]);
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => !query || `${labelFor(user)} ${user.id}`.toLowerCase().includes(query));
  }, [search, users]);
  const selectedRecord = selectedUser ? todayRecords.get(selectedUser.id) : undefined;
  const completion = selectedRecord?.ids.length ? Math.round((selectedRecord.completedIds.length / selectedRecord.ids.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-slate-900">Employee Participation</h1><p className="mt-2 text-slate-600">Today&apos;s activity participation and completion details.</p></div>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" /></div>
      {error ? <Card className="border border-amber-200 bg-amber-50 text-amber-900"><div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5" /><p className="text-sm">{error}</p></div></Card> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? <Card><p className="text-sm text-slate-600">Loading employee participation...</p></Card> : filteredUsers.length ? filteredUsers.map((user) => {
            const record = todayRecords.get(user.id);
            const active = Boolean(record?.startedIds.length);
            const percentage = record?.ids.length ? Math.round((record.completedIds.length / record.ids.length) * 100) : 0;
            return <button key={user.id} type="button" onClick={() => setSelectedUser(user)} className="min-w-0 text-left"><Card className="h-full border border-slate-200 bg-white transition-colors hover:border-teal-300"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white"><User className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start gap-x-2 gap-y-1"><h2 className="min-w-0 flex-1 whitespace-normal break-words text-lg font-bold leading-6 text-slate-900">{labelFor(user)}</h2><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{active ? 'Active' : 'Inactive'}</span></div><p className="mt-2 text-sm text-slate-600">{percentage}% complete</p><p className="mt-1 text-xs text-slate-500">{record?.completedIds.length ?? 0}/{record?.ids.length ?? 0} activities completed</p></div></div></Card></button>;
          }) : <Card><p className="text-sm text-slate-600">No employees found.</p></Card>}
        </div>

      {selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="participation-dialog-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedUser(null); }}>
          <div className="max-h-[calc(100vh-3rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">Today&apos;s details</p>
                <h2 id="participation-dialog-title" className="mt-1 text-xl font-bold text-slate-900">{labelFor(selectedUser)}</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedRecord?.dateKey || getLocalDateKey()}</p>
              </div>
              <button type="button" onClick={() => setSelectedUser(null)} aria-label="Close employee details" className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-700">Completion</span><span className="text-2xl font-bold text-teal-600">{completion}%</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-teal-500" style={{ width: `${completion}%` }} /></div>
              <p className="mt-2 text-xs text-slate-500">{selectedRecord?.startedIds.length ? 'Active: activity started' : 'Inactive: no activity started'}</p>
            </div>
            <div className="mt-6"><h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Scheduled activities</h3><div className="mt-3 space-y-2">
              {selectedRecord?.activities.length ? selectedRecord.activities.map((activity) => { const done = selectedRecord.completedIds.includes(activity.id); const started = selectedRecord.startedIds.includes(activity.id); return <div key={activity.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-3"><div><p className="font-semibold text-slate-900">{activity.title}</p><p className="text-xs text-slate-500">{activity.time} | {activity.duration} min</p></div><span className={`text-xs font-semibold ${done ? 'text-emerald-600' : started ? 'text-amber-600' : 'text-slate-400'}`}>{done ? 'Completed' : started ? 'Started' : 'Not started'}</span></div>; }) : <p className="text-sm text-slate-500">No daily schedule has been recorded yet.</p>}
            </div></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
