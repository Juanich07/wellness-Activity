'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { AlertCircle, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { db } from '@/lib/firebase';

type ProgressRecord = {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  active: boolean;
  [key: string]: unknown;
};

type ProgressFormState = {
  title: string;
  description: string;
  targetValue: string;
  unit: string;
  active: boolean;
};

const defaultFormState: ProgressFormState = {
  title: '',
  description: '',
  targetValue: '30',
  unit: 'days',
  active: true,
};

const asText = (value: unknown) => String(value ?? '').trim();

const toNumber = (value: string, fallbackValue: number) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallbackValue;
};

export default function AdminProgressPage() {
  const [items, setItems] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProgressRecord | null>(null);
  const [form, setForm] = useState<ProgressFormState>(defaultFormState);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'progress'),
      (snapshot) => {
        const loadedItems = snapshot.docs
          .map((documentSnapshot) => ({
            id: documentSnapshot.id,
            title: asText(documentSnapshot.data().title),
            description: asText(documentSnapshot.data().description),
            targetValue: Number(documentSnapshot.data().targetValue ?? 0),
            unit: asText(documentSnapshot.data().unit || 'days'),
            active: documentSnapshot.data().active !== false,
            ...documentSnapshot.data(),
          }) as ProgressRecord)
          .sort((a, b) => a.title.localeCompare(b.title));

        setItems(loadedItems);
        setLoading(false);
        setError('');
      },
      (snapshotError) => {
        console.error('Failed to load progress items', snapshotError);
        setError('Could not load progress data from Firestore. Check admin permissions and rules for progress.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) => {
      return [item.title, item.description, item.unit]
        .map((value) => asText(value).toLowerCase())
        .some((value) => value.includes(query));
    });
  }, [items, search]);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(defaultFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ProgressRecord) => {
    setEditingItem(item);
    setForm({
      title: asText(item.title),
      description: asText(item.description),
      targetValue: String(item.targetValue || 0),
      unit: asText(item.unit || 'days'),
      active: item.active !== false,
    });
    setIsModalOpen(true);
  };

  const closeModal = (force = false) => {
    if (saving && !force) {
      return;
    }

    setIsModalOpen(false);
    setEditingItem(null);
    setForm(defaultFormState);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        targetValue: toNumber(form.targetValue, 0),
        unit: form.unit.trim() || 'days',
        active: form.active,
        updatedAt: serverTimestamp(),
      };

      if (editingItem) {
        await updateDoc(doc(db, 'progress', editingItem.id), payload);
      } else {
        await addDoc(collection(db, 'progress'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      closeModal(true);
    } catch (saveError) {
      console.error('Failed to save progress item', saveError);
      setError('Could not save this progress item. Check Firestore rules for progress create and update.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ProgressRecord) => {
    const confirmed = window.confirm(`Delete progress item "${item.title}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setError('');

    try {
      await deleteDoc(doc(db, 'progress', item.id));
    } catch (deleteError) {
      console.error('Failed to delete progress item', deleteError);
      setError('Could not delete this progress item. Check Firestore rules for progress delete access.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Progress Management</h1>
          <p className="mt-2 text-slate-600">Add, edit, and delete progress goals shown in the employee app.</p>
        </div>
        <Button type="button" onClick={openCreateModal} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, unit, or description..."
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
          <div className="px-6 py-8 text-sm text-slate-600">Loading progress goals...</div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Goal</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Target</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3 font-semibold text-slate-900">{item.title || 'Untitled goal'}</td>
                    <td className="px-5 py-3 text-slate-700">{item.targetValue || 0} {item.unit || 'days'}</td>
                    <td className="max-w-[30rem] px-5 py-3 text-slate-700">
                      <p className="truncate">{item.description || 'No description'}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {item.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-1.5"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => void handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingId === item.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-sm text-slate-600">No progress goals found.</div>
        )}
      </Card>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Card className="w-full max-w-2xl border border-slate-200 bg-white p-0 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingItem ? 'Edit Goal' : 'Add Goal'}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingItem ? 'Update selected progress goal.' : 'Create a new progress goal for employees.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => closeModal()}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close progress modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(event) => void handleSave(event)} className="space-y-4 px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Goal Title</span>
                  <input
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Example: Keep a 30-day streak"
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-sm font-medium text-slate-700">Description</span>
                  <textarea
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Explain what this goal means"
                    rows={4}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Target Value</span>
                  <input
                    type="number"
                    min={1}
                    value={form.targetValue}
                    onChange={(event) => setForm((current) => ({ ...current, targetValue: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Unit</span>
                  <input
                    value={form.unit}
                    onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
                    placeholder="days"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                Active goal
              </label>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <Button type="button" variant="secondary" onClick={() => closeModal()} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  {editingItem ? 'Save Changes' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
