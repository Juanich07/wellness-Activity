'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { AlertCircle, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { db } from '@/lib/firebase';

type ActivityRecord = {
  id: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  difficulty: string;
  caloriesBurned: number;
  animationKey: string;
  active: boolean;
  [key: string]: unknown;
};

type ActivityFormState = {
  title: string;
  description: string;
  category: string;
  durationMinutes: string;
  difficulty: string;
  caloriesBurned: string;
  animationKey: string;
  active: boolean;
};

const defaultFormState: ActivityFormState = {
  title: '',
  description: '',
  category: '',
  durationMinutes: '5',
  difficulty: 'Easy',
  caloriesBurned: '25',
  animationKey: '',
  active: true,
};

const asText = (value: unknown) => String(value ?? '').trim();

const toNumber = (value: string, fallbackValue: number) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallbackValue;
};

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityRecord | null>(null);
  const [form, setForm] = useState<ActivityFormState>(defaultFormState);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'activities'),
      (snapshot) => {
        const loadedActivities = snapshot.docs
          .map((documentSnapshot) => ({
            id: documentSnapshot.id,
            title: asText(documentSnapshot.data().title),
            description: asText(documentSnapshot.data().description),
            category: asText(documentSnapshot.data().category),
            durationMinutes: Number(documentSnapshot.data().durationMinutes ?? 0),
            difficulty: asText(documentSnapshot.data().difficulty || 'Easy'),
            caloriesBurned: Number(documentSnapshot.data().caloriesBurned ?? 0),
            animationKey: asText(documentSnapshot.data().animationKey),
            active: documentSnapshot.data().active !== false,
            ...documentSnapshot.data(),
          }) as ActivityRecord)
          .sort((a, b) => a.title.localeCompare(b.title));

        setActivities(loadedActivities);
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        console.error('Failed to load activities', snapshotError);
        setError('Could not load activities from Firestore. Check admin permissions and rules for activities.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return activities;
    }

    return activities.filter((activity) => {
      return [activity.title, activity.description, activity.category, activity.difficulty]
        .map((value) => asText(value).toLowerCase())
        .some((value) => value.includes(query));
    });
  }, [activities, search]);

  const openCreateModal = () => {
    setEditingActivity(null);
    setForm(defaultFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (activity: ActivityRecord) => {
    setEditingActivity(activity);
    setForm({
      title: asText(activity.title),
      description: asText(activity.description),
      category: asText(activity.category),
      durationMinutes: String(activity.durationMinutes || 0),
      difficulty: asText(activity.difficulty || 'Easy'),
      caloriesBurned: String(activity.caloriesBurned || 0),
      animationKey: asText(activity.animationKey),
      active: activity.active !== false,
    });
    setIsModalOpen(true);
  };

  const closeModal = (force = false) => {
    if (saving && !force) {
      return;
    }

    setIsModalOpen(false);
    setEditingActivity(null);
    setForm(defaultFormState);
  };

  const handleSaveActivity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        durationMinutes: toNumber(form.durationMinutes, 0),
        difficulty: form.difficulty.trim() || 'Easy',
        caloriesBurned: toNumber(form.caloriesBurned, 0),
        animationKey: form.animationKey.trim(),
        active: form.active,
        updatedAt: serverTimestamp(),
      };

      if (editingActivity) {
        await updateDoc(doc(db, 'activities', editingActivity.id), payload);
      } else {
        await addDoc(collection(db, 'activities'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      closeModal(true);
    } catch (saveError) {
      console.error('Failed to save activity', saveError);
      setError('Could not save this activity. Check Firestore rules for activities create and update.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async (activity: ActivityRecord) => {
    const confirmed = window.confirm(`Delete activity "${activity.title}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(activity.id);
    setError('');

    try {
      await deleteDoc(doc(db, 'activities', activity.id));
    } catch (deleteError) {
      console.error('Failed to delete activity', deleteError);
      setError('Could not delete this activity. Check Firestore rules for activities delete access.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Wellness Activity Management</h1>
          <p className="mt-2 text-slate-600">Add, edit, and delete activities shown in the employee app.</p>
        </div>
        <Button type="button" onClick={openCreateModal} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Activity
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, category, difficulty, or description..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {error ? (
        <Card className="border border-amber-200 bg-amber-50 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Action could not be completed</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="p-0">
        {loading ? (
          <div className="px-6 py-8 text-sm text-slate-600">Loading activities...</div>
        ) : filteredActivities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Title</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Category</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Difficulty</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Calories</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Animation</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="max-w-[20rem] px-5 py-3">
                      <p className="font-semibold text-slate-900">{activity.title || 'Untitled activity'}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{activity.description || 'No description'}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{activity.category || '—'}</td>
                    <td className="px-5 py-3 text-slate-700">{activity.durationMinutes || 0} mins</td>
                    <td className="px-5 py-3 text-slate-700">{activity.difficulty || 'Easy'}</td>
                    <td className="px-5 py-3 text-slate-700">{activity.caloriesBurned || 0}</td>
                    <td className="px-5 py-3 text-slate-700">{activity.animationKey || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${activity.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {activity.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(activity)}
                          className="inline-flex items-center gap-1.5"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => void handleDeleteActivity(activity)}
                          disabled={deletingId === activity.id}
                          className="inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingId === activity.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-sm text-slate-600">No activities found.</div>
        )}
      </Card>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Card className="w-full max-w-2xl border border-slate-200 bg-white p-0 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingActivity ? 'Edit Activity' : 'Add Activity'}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingActivity ? 'Update selected activity details.' : 'Create a new activity for the employee app.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => closeModal()}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close activity modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(event) => void handleSaveActivity(event)} className="space-y-4 px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Title</span>
                  <input
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Activity title"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Description</span>
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Describe this activity"
                    rows={4}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Category</span>
                  <input
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    placeholder="Stretching, Walking..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Difficulty</span>
                  <select
                    value={form.difficulty}
                    onChange={(event) => setForm((current) => ({ ...current, difficulty: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Duration (mins)</span>
                  <input
                    type="number"
                    min={1}
                    value={form.durationMinutes}
                    onChange={(event) => setForm((current) => ({ ...current, durationMinutes: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Calories</span>
                  <input
                    type="number"
                    min={0}
                    value={form.caloriesBurned}
                    onChange={(event) => setForm((current) => ({ ...current, caloriesBurned: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Animation</span>
                  <select
                    value={form.animationKey}
                    onChange={(event) => setForm((current) => ({ ...current, animationKey: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="">None</option>
                    <option value="walking-office-man">Walking office man</option>
                  </select>
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                Active activity
              </label>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <Button type="button" variant="secondary" onClick={() => closeModal()} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  {editingActivity ? 'Save Changes' : 'Create Activity'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
