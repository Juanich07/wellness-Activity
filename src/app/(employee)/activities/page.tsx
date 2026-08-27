'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { Lottie } from 'lottie-react';
import Card from '@/components/common/Card';
import { AlertCircle, CheckCircle2, MoreHorizontal, X } from 'lucide-react';
import walkingOfficeManAnimation from '@/assets/animations/walking-office-man.json';
import exerciseInOfficeAnimation from '@/assets/animations/exercise-in-office.json';
import forearmStretchAnimation from '@/assets/animations/forearm-stretch.json';
import deepBreathingAnimation from '@/assets/animations/deep-breathing.json';
import breathingExerciseAnimation from '@/assets/animations/breathing-exercise.json';
import { db } from '@/lib/firebase';

type ActivityRecord = {
  id: string;
  title: string;
  description: string;
  category?: string;
  durationMinutes?: number;
  difficulty?: string;
  animationKey?: string;
  active?: boolean;
};

const WALKING_OFFICE_ANIMATION_KEY = 'walking-office-man';
const EXERCISE_IN_OFFICE_ANIMATION_KEY = 'exercise-in-office';
const FOREARM_STRETCH_ANIMATION_KEY = 'forearm-stretch';
const DEEP_BREATHING_ANIMATION_KEY = 'deep-breathing';
const BREATHING_EXERCISE_ANIMATION_KEY = 'breathing-exercise';

const resolveActivityAnimation = (activity: ActivityRecord) => {
  const title = activity.title.trim().toLowerCase();
  const animationKey = activity.animationKey?.trim().toLowerCase();

  if (
    animationKey === WALKING_OFFICE_ANIMATION_KEY ||
    title === 'walk around the office'
  ) {
    return walkingOfficeManAnimation;
  }

  if (
    animationKey === EXERCISE_IN_OFFICE_ANIMATION_KEY ||
    title.includes('desk') ||
    title.includes('shoulder') ||
    title.includes('neck')
  ) {
    return exerciseInOfficeAnimation;
  }

  if (
    animationKey === FOREARM_STRETCH_ANIMATION_KEY ||
    title.includes('chair exercise') ||
    title.includes('forearm')
  ) {
    return forearmStretchAnimation;
  }

  if (
    animationKey === DEEP_BREATHING_ANIMATION_KEY ||
    title.includes('fresh air') ||
    title.includes('breathing')
  ) {
    return deepBreathingAnimation;
  }

  if (
    animationKey === BREATHING_EXERCISE_ANIMATION_KEY ||
    title.includes('eye rest') ||
    title.includes('screen time')
  ) {
    return breathingExerciseAnimation;
  }

  return null;
};

const displayTitle = (title: string) => title.replace(/^\d+[.)]\s*/, '');

/**
 * Activities Page
 * Displays the approved office wellness activities and descriptions.
 */
export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'activities'),
      (snapshot) => {
        const loadedActivities = snapshot.docs
          .map((documentSnapshot) => ({
            id: documentSnapshot.id,
            title: String(documentSnapshot.data().title ?? '').trim(),
            description: String(documentSnapshot.data().description ?? '').trim(),
            category: String(documentSnapshot.data().category ?? '').trim(),
            durationMinutes: Number(documentSnapshot.data().durationMinutes ?? 0),
            difficulty: String(documentSnapshot.data().difficulty ?? '').trim(),
            animationKey: String(documentSnapshot.data().animationKey ?? '').trim(),
            active: documentSnapshot.data().active !== false,
          }))
          .filter((activity) => activity.active !== false)
          .sort((a, b) => a.title.localeCompare(b.title));

        setActivities(loadedActivities);
        setSelectedActivity((current) => {
          if (!current) {
            return current;
          }

          return loadedActivities.find((activity) => activity.id === current.id) ?? null;
        });
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        console.error('Failed to load activities', snapshotError);
        setError('Could not load activities from Firestore right now.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Activities</h1>
        <p className="mt-2 text-slate-600">
          Approved workplace wellness activities and descriptions.
        </p>
      </div>

      {error ? (
        <Card className="border border-amber-200 bg-amber-50 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Activities could not be loaded</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <Card className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Loading activities...</p>
          </Card>
        ) : activities.length > 0 ? (
          activities.map((activity, index) => {
            const activityAnimation = resolveActivityAnimation(activity);

            return (
          <Card
            key={activity.id}
            className="relative rounded-xl border border-slate-100 bg-slate-50 p-4"
          >
            <button
              type="button"
              onClick={() => setSelectedActivity(activity)}
              className="absolute right-3 top-3 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label={`Open details for ${activity.title}`}
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            <div
              className={activityAnimation
                ? 'flex items-start justify-between gap-3'
                : 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'}
            >
              {activityAnimation ? (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm sm:h-28 sm:w-28">
                  <Lottie
                    src={activityAnimation}
                    loop
                    autoplay
                    className="h-20 w-20 sm:h-24 sm:w-24"
                  />
                </div>
              ) : null}

              <div className="flex min-w-0 flex-1 items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-teal-600" />
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900">
                    {index + 1}. {displayTitle(activity.title)}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {activity.category ? <span>{activity.category}</span> : null}
                    {activity.durationMinutes ? <span>• {activity.durationMinutes} mins</span> : null}
                    {activity.difficulty ? <span>• {activity.difficulty}</span> : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{activity.description}</p>
                </div>
              </div>

            </div>
          </Card>
            );
          })
        ) : (
          <Card className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">No activities available yet.</p>
          </Card>
        )}
      </div>

      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                  Activity Details
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {displayTitle(selectedActivity.title)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Full Description</p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {selectedActivity.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
