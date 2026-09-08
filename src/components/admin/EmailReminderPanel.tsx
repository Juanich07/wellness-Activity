'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import Card from '@/components/common/Card';
import { auth } from '@/lib/firebase';

const SLOTS = [
  { slot: 'morning', label: '9:00 AM reminder' },
  { slot: 'midday', label: '12:00 PM reminder' },
  { slot: 'afternoon', label: '3:00 PM reminder' },
] as const;

export default function EmailReminderPanel() {
  const [loadingSlot, setLoadingSlot] = useState<string | null>(null);
  const [statusBySlot, setStatusBySlot] = useState<Record<string, string>>({});

  const sendReminder = async (slot: string) => {
    setLoadingSlot(slot);
    setStatusBySlot((previous) => ({ ...previous, [slot]: '' }));

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error('You must be signed in as an admin.');
      }

      const response = await fetch(`/api/notifications/send?slot=${slot}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to send reminder.');
      }

      setStatusBySlot((previous) => ({ ...previous, [slot]: `Sent to ${data.email?.sent ?? 0} of ${data.email?.recipients ?? 0} users.` }));
    } catch (error) {
      setStatusBySlot((previous) => ({
        ...previous,
        [slot]: error instanceof Error ? error.message : 'Failed to send reminder.',
      }));
    } finally {
      setLoadingSlot(null);
    }
  };

  return (
    <Card title="Send Schedule Reminder Emails">
      <p className="mb-4 text-sm text-slate-600">
        Manually push a reminder email to every active employee for a specific time slot.
      </p>
      <div className="flex flex-wrap gap-4">
        {SLOTS.map(({ slot, label }) => (
          <div key={slot} className="flex min-w-[12rem] flex-col gap-1.5">
            <button
              type="button"
              onClick={() => void sendReminder(slot)}
              disabled={loadingSlot === slot}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Mail className="h-4 w-4" />
              {loadingSlot === slot ? 'Sending…' : label}
            </button>
            {statusBySlot[slot] && <span className="text-xs text-slate-500">{statusBySlot[slot]}</span>}
          </div>
        ))}
      </div>
    </Card>
  );
}
