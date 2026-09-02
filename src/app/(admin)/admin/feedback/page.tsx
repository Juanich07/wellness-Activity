'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { AlertCircle, MessageSquare, Star } from 'lucide-react';
import Card from '@/components/common/Card';
import { db } from '@/lib/firebase';

type FeedbackItem = {
  id: string;
  userId: string;
  userName: string;
  message: string;
  rating: number;
  createdAt?: { toDate: () => Date };
};

function formatDate(value: FeedbackItem['createdAt']) {
  if (!value) {
    return 'Submitting...';
  }

  return value.toDate().toLocaleString();
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'feedback'),
      (snapshot) => {
        const items = snapshot.docs
          .map((documentSnapshot) => ({
            id: documentSnapshot.id,
            userId: String(documentSnapshot.data().userId ?? ''),
            userName: String(documentSnapshot.data().userName ?? '').trim(),
            message: String(documentSnapshot.data().message ?? ''),
            rating: Number(documentSnapshot.data().rating ?? 0),
            createdAt: documentSnapshot.data().createdAt,
          }) as FeedbackItem)
          .sort((first, second) => (second.createdAt?.toDate().getTime() ?? 0) - (first.createdAt?.toDate().getTime() ?? 0));

        setFeedback(items);
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        console.error('Failed to load feedback', snapshotError);
        setError('Could not load employee feedback. Check the admin account and Firestore rules.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'user'), (snapshot) => {
      setUserNames(Object.fromEntries(snapshot.docs.map((documentSnapshot) => [
        documentSnapshot.id,
        String(documentSnapshot.data().name ?? documentSnapshot.data().email ?? '').trim(),
      ])));
    });

    return () => unsubscribe();
  }, []);

  const averageRating = useMemo(() => {
    if (feedback.length === 0) {
      return '0.0';
    }

    return (feedback.reduce((total, item) => total + item.rating, 0) / feedback.length).toFixed(1);
  }, [feedback]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Feedback Summary</h1>
        <p className="mt-2 text-slate-600">Review employee feedback and suggestions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm font-medium text-slate-600">Total submissions</p>
          <p className="mt-2 text-3xl font-bold text-teal-600">{feedback.length}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-600">Average rating</p>
          <p className="mt-2 flex items-center gap-2 text-3xl font-bold text-amber-500">
            {averageRating}<Star className="h-6 w-6 fill-amber-400 text-amber-400" />
          </p>
        </Card>
      </div>

      {error ? (
        <Card className="border border-red-200 bg-red-50 text-red-800">
          <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5" /><p className="text-sm font-medium">{error}</p></div>
        </Card>
      ) : null}

      <Card className="p-0">
        {loading ? (
          <p className="px-6 py-8 text-sm text-slate-600">Loading employee feedback...</p>
        ) : feedback.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center text-slate-600">
            <MessageSquare className="h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-medium">No feedback has been submitted yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {feedback.map((item) => (
              <article key={item.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Employee: {item.userName || userNames[item.userId] || 'Unknown employee'}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500" aria-label={`${item.rating} of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((value) => <Star key={value} className={value <= item.rating ? 'h-4 w-4 fill-amber-400' : 'h-4 w-4 text-slate-200'} />)}
                    <span className="ml-1 text-sm font-semibold text-slate-700">{item.rating}/5</span>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.message || 'No message provided.'}</p>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
