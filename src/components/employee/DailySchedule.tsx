'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { collection, doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { Lottie } from 'lottie-react';
import { Bell, BellOff, CheckCircle2, Clock3, Pause, Play, RotateCcw, X } from 'lucide-react';
import { Icon } from '@/components/common/Icon';
import Card from '@/components/common/Card';
import walkingOfficeManAnimation from '@/assets/animations/walking-office-man.json';
import exerciseInOfficeAnimation from '@/assets/animations/exercise-in-office.json';
import forearmStretchAnimation from '@/assets/animations/forearm-stretch.json';
import deepBreathingAnimation from '@/assets/animations/deep-breathing.json';
import breathingExerciseAnimation from '@/assets/animations/breathing-exercise.json';
import { auth, db } from '@/lib/firebase';
import { mockActivities } from '@/lib/mockData';
import { safeNotify } from '@/lib/notify';

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  type: string;
  duration: number;
  description?: string;
  difficulty?: string;
  animationKey?: string;
  icon?: string;
}

interface DailyScheduleProps {
  items?: ScheduleItem[];
  onProgressChange?: (completedCount: number, totalCount: number) => void;
}

type ScheduleSourceActivity = {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: number;
  difficulty: string;
  animationKey: string;
  icon: string;
};

type PersistedDailyPlan = {
  dateKey: string;
  ids: string[];
  completedIds: string[];
};

type DailyProgressDocument = PersistedDailyPlan & {
  userId: string;
  activities: ScheduleItem[];
  startedIds: string[];
};

const DAILY_PLAN_STORAGE_KEY = 'wellness-daily-plan-v1';
const DAILY_PROGRESS_COLLECTION = 'dailyProgress';
const WALKING_OFFICE_ANIMATION_KEY = 'walking-office-man';
const EXERCISE_IN_OFFICE_ANIMATION_KEY = 'exercise-in-office';
const FOREARM_STRETCH_ANIMATION_KEY = 'forearm-stretch';
const DEEP_BREATHING_ANIMATION_KEY = 'deep-breathing';
const BREATHING_EXERCISE_ANIMATION_KEY = 'breathing-exercise';
const TIME_SLOTS = ['9:00 AM', '12:00 PM', '3:00 PM'];
const ALARM_DURATION_SECONDS = 180;
const SLOT_START_MINUTES = [9 * 60, 12 * 60, 15 * 60];
const EMERGENCY_ACTIVITIES: ScheduleSourceActivity[] = [
  {
    id: 'emergency-1',
    title: 'Morning Stretching Routine',
    description: 'Gentle full-body stretching to start your day.',
    type: 'Stretching',
    duration: 10,
    difficulty: 'Easy',
    animationKey: '',
    icon: 'Accessibility',
  },
  {
    id: 'emergency-2',
    title: 'Walk Around the Office',
    description: 'Step away from your workstation and take a short walk around your office.',
    type: 'Walking',
    duration: 5,
    difficulty: 'Easy',
    animationKey: 'walking-office-man',
    icon: 'Footprints',
  },
  {
    id: 'emergency-3',
    title: 'Desk Exercise Break',
    description: 'Quick desk-safe movements to loosen up and improve circulation.',
    type: 'Desk exercises',
    duration: 8,
    difficulty: 'Easy',
    animationKey: EXERCISE_IN_OFFICE_ANIMATION_KEY,
    icon: 'Monitor',
  },
  {
    id: 'emergency-4',
    title: 'Aerobic Dance Session',
    description: 'Fun and energetic movement to boost heart rate and mood.',
    type: 'Aerobic',
    duration: 12,
    difficulty: 'Medium',
    animationKey: '',
    icon: 'Music2',
  },
];

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const shuffle = <T,>(items: T[]) => {
  const cloned = [...items];

  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[randomIndex]] = [cloned[randomIndex], cloned[i]];
  }

  return cloned;
};

const readPersistedPlan = (): PersistedDailyPlan | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(DAILY_PLAN_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedDailyPlan;
    if (!parsed || !Array.isArray(parsed.ids) || !Array.isArray(parsed.completedIds) || typeof parsed.dateKey !== 'string') {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse persisted daily plan', error);
    return null;
  }
};

const writePersistedPlan = (plan: PersistedDailyPlan) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DAILY_PLAN_STORAGE_KEY, JSON.stringify(plan));
};

const resolveActivityAnimation = (item: ScheduleItem) => {
  const animationKey = item.animationKey?.trim().toLowerCase();
  const title = item.title.trim().toLowerCase();

  if (animationKey === WALKING_OFFICE_ANIMATION_KEY || title === 'walk around the office') {
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

const formatSeconds = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const playAlarmTone = () => {
  if (typeof window === 'undefined' || !('AudioContext' in window)) {
    return;
  }

  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 880;
  gain.gain.value = 0.08;
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.6);
};

/**
 * DailySchedule Component
 * Random 3 activities per day with timer + completion tracking.
 */
export default function DailySchedule({ items = [], onProgressChange }: DailyScheduleProps) {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(items.slice(0, 3));
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [startedIds, setStartedIds] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDateKey, setActiveDateKey] = useState(getLocalDateKey());
  const [alarmsEnabled, setAlarmsEnabled] = useState(() => (
    typeof window !== 'undefined' && window.localStorage.getItem('wellness-notifications-enabled') === 'true'
  ));
  const [activeAlarmItem, setActiveAlarmItem] = useState<ScheduleItem | null>(null);
  const [alarmSecondsRemaining, setAlarmSecondsRemaining] = useState(0);
  const [triggeredAlarmKeys, setTriggeredAlarmKeys] = useState<string[]>([]);
  const progressWriteTimeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (progressWriteTimeoutRef.current) {
      window.clearTimeout(progressWriteTimeoutRef.current);
    }
  }, []);

  const iconMap: Record<string, string> = {
    Stretching: 'Accessibility',
    Walking: 'Footprints',
    Aerobic: 'Music2',
    Strengthening: 'Dumbbell',
    'Desk exercises': 'Monitor',
  };

  const fallbackActivities: ScheduleSourceActivity[] = mockActivities.map((activity) => ({
    id: String(activity.activityId),
    title: activity.title,
    description: activity.description,
    type: activity.category,
    duration: Number(activity.durationMinutes || 5),
    difficulty: String(activity.difficulty || ''),
    animationKey: '',
    icon: String(activity.icon || ''),
  }));

  const applyDailyPlan = async (sourceActivities: ScheduleSourceActivity[]) => {
    const todayKey = getLocalDateKey();
    setActiveDateKey(todayKey);

    if (sourceActivities.length === 0) {
      setScheduleItems([]);
      setCompletedIds([]);
      setStartedIds([]);
      setIsLoading(false);
      return;
    }

    const persisted = readPersistedPlan();
    const userId = auth.currentUser?.uid;
    const progressReference = userId ? doc(db, DAILY_PROGRESS_COLLECTION, `${userId}_${todayKey}`) : null;
    let remoteProgress: DailyProgressDocument | null = null;
    if (progressReference) {
      try {
        const remoteSnapshot = await getDoc(progressReference);
        remoteProgress = remoteSnapshot.exists() ? remoteSnapshot.data() as DailyProgressDocument : null;
      } catch (progressError) {
        console.error('Failed to load saved daily progress; using local schedule state.', progressError);
      }
    }
    const canReusePersisted =
      remoteProgress?.dateKey === todayKey &&
      remoteProgress.activities?.length > 0 &&
      remoteProgress.activities.every((activity) => sourceActivities.some((source) => source.id === activity.id));
    const canReuseLocal =
      !remoteProgress &&
      persisted?.dateKey === todayKey &&
      persisted.ids.every((id) => sourceActivities.some((activity) => activity.id === id));

    const dailyIds = canReusePersisted
      ? (remoteProgress?.ids ?? [])
      : canReuseLocal
        ? (persisted?.ids ?? [])
        : shuffle(sourceActivities.map((activity) => activity.id)).slice(0, Math.min(3, sourceActivities.length));

    const dailyActivities = dailyIds
      .map((id, index) => {
        const found = sourceActivities.find((activity) => activity.id === id);
        if (!found) {
          return null;
        }

        return {
          id: found.id,
          title: found.title,
          time: TIME_SLOTS[index] ?? `${9 + index}:00 AM`,
          type: found.type,
          duration: found.duration > 0 ? found.duration : 5,
          description: found.description,
          difficulty: found.difficulty,
          animationKey: found.animationKey,
          icon: found.icon,
        } as ScheduleItem;
      })
      .filter((activity): activity is ScheduleItem => Boolean(activity));

    const safeCompleted = (canReusePersisted ? remoteProgress?.completedIds ?? [] : canReuseLocal ? persisted?.completedIds ?? [] : [])
      .filter((id) => dailyActivities.some((activity) => activity.id === id));
    const safeStarted = (canReusePersisted ? remoteProgress?.startedIds ?? [] : [])
      .filter((id) => dailyActivities.some((activity) => activity.id === id));

    setScheduleItems(dailyActivities);
    setCompletedIds(safeCompleted);
    setStartedIds(safeStarted);
    writePersistedPlan({
      dateKey: todayKey,
      ids: dailyActivities.map((activity) => activity.id),
      completedIds: safeCompleted,
    });
    if (progressReference && (!remoteProgress || !canReusePersisted)) {
      try {
        await setDoc(progressReference, {
          userId,
          dateKey: todayKey,
          ids: dailyActivities.map((activity) => activity.id),
          activities: dailyActivities,
          startedIds: safeStarted,
          completedIds: safeCompleted,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (progressError) {
        console.error('Failed to save daily schedule; local state will continue to work.', progressError);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'activities'),
      (snapshot) => {
        const allActivities: ScheduleSourceActivity[] = snapshot.docs
          .map((documentSnapshot) => ({
            id: documentSnapshot.id,
            title: String(documentSnapshot.data().title ?? '').trim(),
            description: String(documentSnapshot.data().description ?? '').trim(),
            type: String(documentSnapshot.data().category ?? 'Activity').trim() || 'Activity',
            duration: Number(documentSnapshot.data().durationMinutes ?? 5),
            difficulty: String(documentSnapshot.data().difficulty ?? '').trim(),
            animationKey: String(documentSnapshot.data().animationKey ?? '').trim(),
            icon: String(documentSnapshot.data().icon ?? '').trim(),
            active: documentSnapshot.data().active !== false,
          }))
          .filter((activity) => activity.active && activity.title)
          .map(({ active, ...activity }) => activity);

        const source = allActivities.length > 0
          ? allActivities
          : (fallbackActivities.length > 0 ? fallbackActivities : EMERGENCY_ACTIVITIES);

        void applyDailyPlan(source);
      },
      (error) => {
        console.error('Failed to load schedule activities', error);
        const fromPropItems: ScheduleSourceActivity[] = items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          type: item.type,
          duration: item.duration,
          difficulty: item.difficulty || '',
          animationKey: item.animationKey || '',
          icon: item.icon || '',
        }));

        const source = fromPropItems.length > 0
          ? fromPropItems
          : (fallbackActivities.length > 0 ? fallbackActivities : EMERGENCY_ACTIVITIES);

        void applyDailyPlan(source);
      }
    );

    return () => unsubscribe();
  }, [items, fallbackActivities]);

  useEffect(() => {
    if (!selectedItem || !isTimerRunning || secondsRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedItem, isTimerRunning, secondsRemaining]);

  useEffect(() => {
    if (!selectedItem || secondsRemaining !== 0 || !isTimerRunning) {
      return;
    }

    setIsTimerRunning(false);
    setCompletedIds((current) => {
      if (current.includes(selectedItem.id)) {
        return current;
      }

      return [...current, selectedItem.id];
    });
  }, [isTimerRunning, secondsRemaining, selectedItem]);

  useEffect(() => {
    writePersistedPlan({
      dateKey: activeDateKey,
      ids: scheduleItems.map((item) => item.id),
      completedIds,
    });

    onProgressChange?.(completedIds.length, scheduleItems.length);
    const userId = auth.currentUser?.uid;
    if (!userId || scheduleItems.length === 0) {
      return;
    }

    // Debounce Firestore writes so rapid taps coalesce into a single write and stay within quota.
    if (progressWriteTimeoutRef.current) {
      window.clearTimeout(progressWriteTimeoutRef.current);
    }

    progressWriteTimeoutRef.current = window.setTimeout(() => {
      void setDoc(doc(db, DAILY_PROGRESS_COLLECTION, `${userId}_${activeDateKey}`), {
        userId,
        dateKey: activeDateKey,
        ids: scheduleItems.map((item) => item.id),
        activities: scheduleItems,
        startedIds,
        completedIds,
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch((progressError) => {
        console.error('Failed to sync daily progress; local state is preserved.', progressError);
      });
    }, 2000);
  }, [activeDateKey, completedIds, onProgressChange, scheduleItems, startedIds]);

  useEffect(() => {
    if (isLoading || scheduleItems.length > 0) {
      return;
    }

    const todayKey = getLocalDateKey();
    const emergencyIds = shuffle(EMERGENCY_ACTIVITIES.map((activity) => activity.id)).slice(0, 3);
    const emergencySchedule = emergencyIds
      .map((id, index) => {
        const found = EMERGENCY_ACTIVITIES.find((activity) => activity.id === id);
        if (!found) {
          return null;
        }

        return {
          id: found.id,
          title: found.title,
          time: TIME_SLOTS[index] ?? `${9 + index}:00 AM`,
          type: found.type,
          duration: found.duration,
          description: found.description,
          difficulty: found.difficulty,
          animationKey: found.animationKey,
          icon: found.icon,
        } as ScheduleItem;
      })
      .filter((activity): activity is ScheduleItem => Boolean(activity));

    setActiveDateKey(todayKey);
    setScheduleItems(emergencySchedule);
    setStartedIds([]);
    setCompletedIds([]);
    writePersistedPlan({
      dateKey: todayKey,
      ids: emergencySchedule.map((activity) => activity.id),
      completedIds: [],
    });
  }, [isLoading, scheduleItems.length]);

  useEffect(() => {
    if (!alarmsEnabled || activeAlarmItem || scheduleItems.length === 0) {
      return;
    }

    const checkScheduleAlarm = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const slotIndex = SLOT_START_MINUTES.findIndex((slot) => currentMinutes >= slot && currentMinutes < slot + ALARM_DURATION_SECONDS / 60);

      if (slotIndex === -1) {
        return;
      }

      const alarmKey = `${activeDateKey}-${slotIndex}`;
      const alarmItem = scheduleItems[slotIndex];

      if (!alarmItem || triggeredAlarmKeys.includes(alarmKey)) {
        return;
      }

      setTriggeredAlarmKeys((current) => [...current, alarmKey]);
      setActiveAlarmItem(alarmItem);
      setAlarmSecondsRemaining(ALARM_DURATION_SECONDS - now.getSeconds());
      playAlarmTone();

      if ('Notification' in window && Notification.permission === 'granted') {
        void safeNotify('Wellness activity time', {
          body: `${alarmItem.time}: ${alarmItem.title}`,
        });
      }
    };

    checkScheduleAlarm();
    const interval = window.setInterval(checkScheduleAlarm, 1000);
    return () => window.clearInterval(interval);
  }, [activeDateKey, activeAlarmItem, alarmsEnabled, scheduleItems, triggeredAlarmKeys]);

  useEffect(() => {
    if (!activeAlarmItem || alarmSecondsRemaining <= 0) {
      return;
    }

    playAlarmTone();
    const interval = window.setInterval(() => {
      setAlarmSecondsRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeAlarmItem, alarmSecondsRemaining]);

  useEffect(() => {
    if (alarmSecondsRemaining === 0 && activeAlarmItem) {
      setActiveAlarmItem(null);
    }
  }, [activeAlarmItem, alarmSecondsRemaining]);

  const completedSet = useMemo(() => new Set(completedIds), [completedIds]);

  const handleOpenItem = (item: ScheduleItem) => {
    setSelectedItem(item);
    setSecondsRemaining(item.duration * 60);
    setIsTimerRunning(false);
  };

  const markStarted = (itemId: string) => {
    setStartedIds((current) => (current.includes(itemId) ? current : [...current, itemId]));
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsTimerRunning(false);
    setSecondsRemaining(0);
  };

  const markComplete = (itemId: string) => {
    setCompletedIds((current) => (current.includes(itemId) ? current : [...current, itemId]));
  };

  const enableAlarms = async () => {
    setAlarmsEnabled(true);
    window.localStorage.setItem('wellness-notifications-enabled', 'true');
    playAlarmTone();

    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const stopAlarm = () => {
    setActiveAlarmItem(null);
    setAlarmSecondsRemaining(0);
  };

  return (
    <>
      <Card className="rounded-[22px] bg-[#f5f8f8] p-4 shadow-none ring-0">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Schedule</h3>
          <span className="text-lg text-slate-400">...</span>
        </div>

        <div className="mb-3 rounded-xl bg-white px-3 py-2 text-xs shadow-sm">
          {alarmsEnabled ? (
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 font-medium text-teal-700"><Bell className="h-3.5 w-3.5" /> Alarms on at 9:00 AM, 12:00 PM, and 3:00 PM</span>
              <button type="button" onClick={() => { setAlarmsEnabled(false); window.localStorage.setItem('wellness-notifications-enabled', 'false'); }} className="font-semibold text-slate-500 hover:text-slate-800">Turn off</button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-slate-600"><BellOff className="h-3.5 w-3.5" /> Enable 3-minute activity alarms</span>
              <button type="button" onClick={() => void enableAlarms()} className="font-semibold text-teal-700 hover:text-teal-800">Enable</button>
            </div>
          )}
        </div>

        {activeAlarmItem ? (
          <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-amber-900">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-sm font-bold">Time for {activeAlarmItem.title}</p><p className="mt-1 text-xs">Alarm rings for {formatSeconds(alarmSecondsRemaining)}.</p></div>
              <button type="button" onClick={stopAlarm} className="rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold">Stop</button>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          {isLoading ? (
            <p className="text-center text-sm text-slate-500">Loading schedule...</p>
          ) : scheduleItems.length === 0 ? (
            <p className="text-center text-sm text-slate-500">No activities scheduled yet</p>
          ) : (
            scheduleItems.map((item) => {
              const iconName = item.icon || iconMap[item.type] || 'Calendar';
              const isCompleted = completedSet.has(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenItem(item)}
                  className="flex w-full items-center gap-3 rounded-xl bg-white px-3 py-2 text-left shadow-sm transition hover:bg-teal-50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Icon name={iconName} size={18} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-500">{item.time} | {item.duration}min</p>
                  </div>
                  {isCompleted ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                </button>
              );
            })
          )}
        </div>
      </Card>

      {selectedItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">Today&apos;s Activity</p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{selectedItem.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedItem.type} | {selectedItem.duration} min
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close schedule activity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {resolveActivityAnimation(selectedItem) ? (
              <div className="mt-4 flex justify-center rounded-2xl bg-slate-50 py-3">
                {(() => {
                  const animation = resolveActivityAnimation(selectedItem);
                  return animation ? <Lottie src={animation} loop autoplay className="h-24 w-24" /> : null;
                })()}
              </div>
            ) : null}

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Description</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {selectedItem.description || 'No description available.'}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-600">
                <Clock3 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Timer</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{formatSeconds(secondsRemaining)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning((current) => !current)}
                  onMouseDown={() => markStarted(selectedItem.id)}
                  className="inline-flex items-center gap-1 rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setSecondsRemaining(selectedItem.duration * 60);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => markComplete(selectedItem.id)}
                  onMouseDown={() => markStarted(selectedItem.id)}
                  className="rounded-full border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700"
                >
                  Mark Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
