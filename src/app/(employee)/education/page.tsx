'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import Card from '@/components/common/Card';
import { AlertCircle, MoreHorizontal, X } from 'lucide-react';
import { db } from '@/lib/firebase';

type EducationRecord = {
  id: string;
  topic: string;
  shortDescription: string;
  keyPoints: string;
  category?: string;
  active?: boolean;
};

export default function EducationPage() {
  const [topics, setTopics] = useState<EducationRecord[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<EducationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'education'),
      (snapshot) => {
        const loadedTopics = snapshot.docs
          .map((documentSnapshot) => ({
            id: documentSnapshot.id,
            topic: String(documentSnapshot.data().topic || '').trim(),
            shortDescription: String(documentSnapshot.data().shortDescription || '').trim(),
            keyPoints: String(documentSnapshot.data().keyPoints || '').trim(),
            category: String(documentSnapshot.data().category || 'Education').trim(),
            active: documentSnapshot.data().active !== false,
          }))
          .filter((topic) => topic.active !== false)
          .sort((a, b) => a.topic.localeCompare(b.topic));

        setTopics(loadedTopics);
        setSelectedTopic((current) => {
          if (!current) {
            return current;
          }

          return loadedTopics.find((topic) => topic.id === current.id) ?? null;
        });
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        console.error('Failed to load education topics', snapshotError);
        setError('Could not load education topics from Firestore right now.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Education</h1>
        <p className="mt-2 text-slate-600">Wellness education topics for employees.</p>
      </div>

      {error ? (
        <Card className="border border-amber-200 bg-amber-50 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Education topics could not be loaded</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <Card className="border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2 xl:col-span-3">
            <p className="text-sm text-slate-600">Loading education topics...</p>
          </Card>
        ) : topics.length > 0 ? (
          topics.map((item) => (
          <Card key={item.id} className="relative border border-slate-200 bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={() => setSelectedTopic(item)}
              className="absolute right-3 top-3 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label={`Open details for ${item.topic}`}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            <p className="pr-10 text-sm font-semibold uppercase tracking-wide text-teal-600">
              {item.category || 'Education'}
            </p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">{item.topic}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.shortDescription}</p>
            <p className="mt-3 text-xs font-medium text-slate-500">
              Tap the three dots to view the full text.
            </p>
          </Card>
          ))
        ) : (
          <Card className="border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2 xl:col-span-3">
            <p className="text-sm text-slate-600">No education topics available yet.</p>
          </Card>
        )}
      </div>

      {selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                  Education Topic
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedTopic.topic}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTopic(null)}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Full Description</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {selectedTopic.shortDescription} {selectedTopic.keyPoints}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Key Points</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {selectedTopic.keyPoints}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
