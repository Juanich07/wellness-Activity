'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { AlertCircle, Target } from 'lucide-react';
import Card from '@/components/common/Card';
import { auth, db } from '@/lib/firebase';
import { asDailyProgressRecord, DailyProgressRecord, getWeekDateKeys } from '@/lib/dailyProgress';

type ProgressRecord = {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  active?: boolean;
};

export default function ProgressPage() {
  const [goals, setGoals] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dailyRecords, setDailyRecords] = useState<DailyProgressRecord[]>([]);

  useEffect(() => {
    const loadDailyProgress = async () => {
      if (!auth.currentUser) {
        return;
      }

      try {
        const snapshot = await getDocs(query(collection(db, 'dailyProgress'), where('userId', '==', auth.currentUser.uid)));
        setDailyRecords(snapshot.docs
          .map((documentSnapshot) => asDailyProgressRecord(documentSnapshot.id, documentSnapshot.data()))
          .filter((record) => record.userId === auth.currentUser?.uid));
      } catch (progressError) {
        console.error('Failed to load daily progress', progressError);
      }
    };

    void loadDailyProgress();

    const unsubscribe = onSnapshot(
      collection(db, 'progress'),
      (snapshot) => {
        const loadedGoals = snapshot.docs
          .map((documentSnapshot) => ({
            id: documentSnapshot.id,
            title: String(documentSnapshot.data().title || '').trim(),
            description: String(documentSnapshot.data().description || '').trim(),
            targetValue: Number(documentSnapshot.data().targetValue ?? 0),
            unit: String(documentSnapshot.data().unit || 'days').trim(),
            active: documentSnapshot.data().active !== false,
          }))
          .filter((goal) => goal.active !== false)
          .sort((a, b) => a.title.localeCompare(b.title));

        setGoals(loadedGoals);
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        console.error('Failed to load progress goals', snapshotError);
        setError('Could not load progress goals from Firestore right now.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const week = getWeekDateKeys();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Daily Progress</h1>
        <p className="mt-2 text-slate-600">Track your wellness journey and current goals.</p>
      </div>

      {error ? (
        <Card className="border border-amber-200 bg-amber-50 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Progress goals could not be loaded</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <Card title="This Week (Monday - Sunday)">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {week.map((dateKey) => {
            const record = dailyRecords.find((item) => item.dateKey === dateKey);
            const percentage = record?.ids.length ? Math.round((record.completedIds.length / record.ids.length) * 100) : 0;
            const dayLabel = new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' });
            return <div key={dateKey} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center"><p className="text-xs font-semibold text-slate-500">{dayLabel}</p><p className="mt-2 text-2xl font-bold text-teal-600">{percentage}%</p><p className="mt-1 text-[11px] text-slate-500">{record?.completedIds.length ?? 0}/{record?.ids.length ?? 0} complete</p></div>;
          })}
        </div>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <p className="text-sm text-slate-600">Loading progress goals...</p>
          </Card>
        ) : goals.length > 0 ? (
          goals.map((goal) => (
            <Card key={goal.id} className="border border-slate-200 bg-white">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl bg-teal-50 p-2 text-teal-600">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{goal.title || 'Untitled goal'}</h2>
                  <p className="mt-1 text-sm text-slate-600">{goal.description || 'No description available.'}</p>
                  <p className="mt-3 text-sm font-semibold text-teal-700">Target: {goal.targetValue || 0} {goal.unit || 'days'}</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-sm text-slate-600">No progress goals available yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
