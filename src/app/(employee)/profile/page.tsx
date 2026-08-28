'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { AlertCircle, Bell, CheckCircle2, UserCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { auth, db } from '@/lib/firebase';

type Profile = {
  name: string;
  email: string;
  department: string;
  role: string;
  active: boolean;
};

const emptyProfile: Profile = {
  name: '',
  email: '',
  department: '',
  role: 'employee',
  active: true,
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'unsupported' | 'default' | 'granted' | 'denied'>('default');

  useEffect(() => {
    if (!('Notification' in window)) {
      setNotificationStatus('unsupported');
      return;
    }

    setNotificationStatus(Notification.permission);
    setNotificationsEnabled(window.localStorage.getItem('wellness-notifications-enabled') === 'true');
  }, []);

  const handleNotificationToggle = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('unsupported');
      return;
    }

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    setNotificationStatus(permission);
    const enabled = permission === 'granted';
    setNotificationsEnabled(enabled);
    window.localStorage.setItem('wellness-notifications-enabled', String(enabled));

    if (enabled) {
      new Notification('Wellness notifications enabled', { body: 'You will receive activity reminders while the schedule is open.' });
      setMessage('Phone notifications are enabled.');
    } else if (permission === 'denied') {
      setError('Notifications are blocked in your browser or phone settings.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError('Your session has expired. Please log in again.');
        setLoading(false);
        return;
      }

      setUserId(user.uid);
      try {
        const snapshot = await getDoc(doc(db, 'user', user.uid));
        const data = snapshot.exists() ? snapshot.data() : {};
        setProfile({
          name: String(data.name ?? ''),
          email: user.email || String(data.email ?? ''),
          department: String(data.department ?? ''),
          role: String(data.role ?? 'employee'),
          active: data.active !== false,
        });
      } catch (loadError) {
        console.error('Failed to load profile:', loadError);
        setError('Could not load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) {
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateDoc(doc(db, 'user', userId), {
        name: profile.name.trim(),
        department: profile.department.trim(),
        updatedAt: serverTimestamp(),
      });
      setMessage('Profile updated successfully.');
    } catch (saveError) {
      console.error('Failed to save profile:', saveError);
      setError('Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">Account</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-2 text-slate-600">View and update your employee information.</p>
      </div>

      {error ? (
        <Card className="border border-red-200 bg-red-50 text-red-700">
          <div className="flex items-center gap-3"><AlertCircle className="h-5 w-5" /><p className="text-sm">{error}</p></div>
        </Card>
      ) : null}
      {message ? (
        <Card className="border border-emerald-200 bg-emerald-50 text-emerald-700">
          <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5" /><p className="text-sm">{message}</p></div>
        </Card>
      ) : null}

      <Card>
        {loading ? <p className="text-sm text-slate-600">Loading profile...</p> : (
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700"><UserCircle className="h-8 w-8" /></div>
              <div><h2 className="text-xl font-bold text-slate-900">{profile.name || 'Employee profile'}</h2><p className="text-sm capitalize text-slate-500">{profile.role}</p></div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input type="email" value={profile.email} readOnly className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
              <input value={profile.department} onChange={(event) => setProfile((current) => ({ ...current, department: event.target.value }))} placeholder="Your department" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
              <div className="flex items-start gap-3">
                <Bell className="mt-0.5 h-5 w-5 text-teal-600" />
                <div><p className="text-sm font-semibold text-slate-800">Activity notifications</p><p className="mt-1 text-xs text-slate-500">Allow wellness reminders on this phone.</p></div>
              </div>
              <Button type="button" variant={notificationsEnabled ? 'secondary' : 'primary'} onClick={() => void handleNotificationToggle()} disabled={notificationStatus === 'unsupported'}>
                {notificationStatus === 'denied' ? 'Blocked' : notificationsEnabled ? 'Enabled' : 'Enable'}
              </Button>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-600">Account status: <span className={profile.active ? 'font-semibold text-emerald-600' : 'font-semibold text-red-600'}>{profile.active ? 'Active' : 'Inactive'}</span></p>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}