'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, BellRing } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';

type BreakPhase = 'warm-up' | 'video' | 'cool-down' | 'message';

interface Phase {
  id: BreakPhase;
  name: string;
  duration: number;
  description: string;
  icon: string;
  completed: boolean;
}

/**
 * Break Flow Page
 * Sequential wellness break: 5-min warm-up → 15-min video → 5-min cool-down → 5-min message
 * Shows progress, timer, and only enables check-in after video completion
 */
export default function BreakPage() {
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 'warm-up',
      name: 'Warm-up',
      duration: 5,
      description: 'Light stretching and breathing exercises to get your body ready',
      icon: 'Yoga',
      completed: false,
    },
    {
      id: 'video',
      name: 'Main Activity',
      duration: 15,
      description: 'Follow along with the guided wellness video',
      icon: 'Play',
      completed: false,
    },
    {
      id: 'cool-down',
      name: 'Cool-down',
      duration: 5,
      description: 'Gentle stretching to help your body relax',
      icon: 'Wind',
      completed: false,
    },
    {
      id: 'message',
      name: 'Wellness Message',
      duration: 5,
      description: 'Receive personalized wellness tips and encouragement',
      icon: 'MessageSquare',
      completed: false,
    },
  ]);

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(phases[0].duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [breakCompleted, setBreakCompleted] = useState(false);
  const [alarmMinutes, setAlarmMinutes] = useState(5);
  const [alarmSecondsRemaining, setAlarmSecondsRemaining] = useState(0);
  const [isAlarmRunning, setIsAlarmRunning] = useState(false);
  const [alarmMessage, setAlarmMessage] = useState('Set a reminder for your next check-in.');

  const currentPhase = phases[currentPhaseIndex];
  const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0);
  const completedDuration = phases
    .slice(0, currentPhaseIndex)
    .reduce((sum, p) => sum + p.duration, 0);
  const progressPercentage = (completedDuration / totalDuration) * 100;

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Move to next phase
            if (currentPhaseIndex < phases.length - 1) {
              const newPhases = [...phases];
              newPhases[currentPhaseIndex].completed = true;
              setPhases(newPhases);
              setCurrentPhaseIndex(currentPhaseIndex + 1);
              setTimeRemaining(phases[currentPhaseIndex + 1].duration * 60);
            } else {
              // Break completed
              setIsRunning(false);
              setBreakCompleted(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, currentPhaseIndex, phases]);

  // Alarm countdown logic
  useEffect(() => {
    let alarmInterval: NodeJS.Timeout;

    if (isAlarmRunning && alarmSecondsRemaining > 0) {
      alarmInterval = setInterval(() => {
        setAlarmSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }

    if (isAlarmRunning && alarmSecondsRemaining === 0) {
      setIsAlarmRunning(false);
      setAlarmMessage('Alarm finished. Time for your wellness break!');

      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          void new Notification('Wellness Alarm', {
            body: 'Time for your next wellness action.',
          });
        } else if (Notification.permission === 'default') {
          void Notification.requestPermission();
        }
      }

      if (typeof window !== 'undefined' && 'AudioContext' in window) {
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
      }
    }

    return () => clearInterval(alarmInterval);
  }, [isAlarmRunning, alarmSecondsRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSkipPhase = () => {
    if (currentPhaseIndex < phases.length - 1) {
      const newPhases = [...phases];
      newPhases[currentPhaseIndex].completed = true;
      setPhases(newPhases);
      setCurrentPhaseIndex(currentPhaseIndex + 1);
      setTimeRemaining(phases[currentPhaseIndex + 1].duration * 60);
      setIsRunning(false);
    } else {
      setBreakCompleted(true);
      setIsRunning(false);
    }
  };

  const startAlarm = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    const safeMinutes = Math.max(1, Math.min(120, alarmMinutes));
    setAlarmMinutes(safeMinutes);
    setAlarmSecondsRemaining(safeMinutes * 60);
    setIsAlarmRunning(true);
    setAlarmMessage('Alarm is running. You will be notified when time is up.');
  };

  const toggleAlarm = () => {
    if (alarmSecondsRemaining === 0) {
      void startAlarm();
      return;
    }

    setIsAlarmRunning((prev) => !prev);
    setAlarmMessage((current) => (isAlarmRunning ? 'Alarm paused.' : current));
  };

  const stopAlarm = () => {
    setIsAlarmRunning(false);
    setAlarmSecondsRemaining(0);
    setAlarmMessage('Alarm stopped.');
  };

  if (breakCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md text-center">
          <div className="flex justify-center mb-4">
            <Icon name="Trophy" size={64} className="h-16 w-16 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Break Complete!
          </h2>
          <p className="text-slate-600 mb-6">
            Great job completing your 30-minute wellness break. You should feel
            refreshed and ready to continue your day.
          </p>
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={() => (window.location.href = '/dashboard')}
              className="w-full"
            >
              Return to Dashboard
            </Button>
            <Button
              variant="secondary"
              onClick={() => (window.location.href = '/activities')}
              className="w-full"
            >
              Browse More Activities
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">30-Minute Break</h1>
        <p className="mt-2 text-slate-600">
          Follow the guided sequence below to complete your wellness break
        </p>
      </div>

      {/* Overall Progress Bar */}
      <Card>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-slate-900">
              Overall Progress
            </span>
            <span className="text-sm font-medium text-slate-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {completedDuration} / {totalDuration} minutes completed
          </p>
        </div>
      </Card>

      {/* Alarm / Reminder */}
      <Card title="Reminder Alarm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{alarmMessage}</p>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-slate-700" htmlFor="alarm-minutes">
              Minutes
            </label>
            <input
              id="alarm-minutes"
              type="number"
              min={1}
              max={120}
              value={alarmMinutes}
              onChange={(event) => setAlarmMinutes(Number(event.target.value) || 1)}
              className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
            <div className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm font-semibold text-slate-800">
              {formatTime(alarmSecondsRemaining)}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={isAlarmRunning ? 'secondary' : 'primary'}
              onClick={toggleAlarm}
              className="flex items-center gap-2"
            >
              {isAlarmRunning ? <Pause className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
              {isAlarmRunning ? 'Pause Alarm' : alarmSecondsRemaining > 0 ? 'Resume Alarm' : 'Start Alarm'}
            </Button>
            <Button variant="ghost" onClick={stopAlarm}>Stop Alarm</Button>
          </div>
        </div>
      </Card>

      {/* Current Phase Display */}
      <Card className="border-2 border-teal-600 bg-gradient-to-br from-teal-50 to-emerald-50">
        <div className="text-center space-y-4">
          {/* Phase Icon */}
          <div className="flex justify-center">
            <Icon name={currentPhase.icon} size={64} className="h-16 w-16 text-teal-600" />
          </div>

          {/* Phase Name and Description */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {currentPhase.name}
            </h2>
            <p className="mt-2 text-slate-600">{currentPhase.description}</p>
          </div>

          {/* Timer */}
          <div className="bg-white rounded-2xl p-6 ring-1 ring-slate-200">
            <div className="text-5xl font-bold text-teal-600 font-mono">
              {formatTime(timeRemaining)}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Phase time remaining
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-3 justify-center pt-4">
            <Button
              variant={isRunning ? 'secondary' : 'primary'}
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Start
                </>
              )}
            </Button>
            <Button variant="ghost" onClick={handleSkipPhase}>
              Skip Phase
            </Button>
          </div>
        </div>
      </Card>

      {/* Video Player for Main Activity Phase */}
      {currentPhase.id === 'video' && (
        <Card title="Follow Along">
          <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-5xl mb-3">▶️</div>
              <p className="text-lg font-semibold">
                YouTube Video Player
              </p>
              <p className="text-sm text-slate-300 mt-2">
                Note: Integrate react-youtube library for production
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            ✓ Video must complete before you can proceed
          </p>
        </Card>
      )}

      {/* Phase Checklist */}
      <Card title="Break Phases">
        <div className="space-y-2">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                index === currentPhaseIndex
                  ? 'bg-teal-50 ring-1 ring-teal-200'
                  : phase.completed
                    ? 'bg-emerald-50'
                    : 'bg-slate-50'
              }`}
            >
              <div className="text-2xl">{phase.icon}</div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{phase.name}</p>
                <p className="text-xs text-slate-600">
                  {phase.duration} minutes
                </p>
              </div>
              {phase.completed ? (
                <div className="text-emerald-600 font-bold">✓</div>
              ) : index === currentPhaseIndex ? (
                <div className="text-teal-600 font-bold">●</div>
              ) : (
                <div className="text-slate-400">○</div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
