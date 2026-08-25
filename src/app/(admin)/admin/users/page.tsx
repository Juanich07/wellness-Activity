'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
} from 'firebase/firestore';
import { AlertCircle, Pencil, Plus, Search, Trash2, Users, X } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';

type UserRole = 'admin' | 'employee';

type UserRecord = {
  id: string;
  name?: string;
  email?: string;
  department?: string;
  role?: UserRole;
  active?: boolean;
  [key: string]: unknown;
};

type UserFormState = {
  uid: string;
  name: string;
  email: string;
  department: string;
  password: string;
  role: UserRole;
  active: boolean;
};

const defaultFormState: UserFormState = {
  uid: '',
  name: '',
  email: '',
  department: '',
  password: '',
  role: 'employee',
  active: true,
};

const normalizeText = (value: unknown) => String(value ?? '').trim();

const getTokenFromCookie = () => {
  const tokenEntry = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('token='));

  return tokenEntry ? decodeURIComponent(tokenEntry.slice('token='.length)) : '';
};

const waitForAuthState = async () => {
  if (auth.currentUser) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeoutId = window.setTimeout(() => {
      unsubscribe();
      resolve();
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
      resolve();
    });
  });
};

const getAdminToken = async () => {
  await waitForAuthState();

  if (auth.currentUser) {
    const refreshedToken = await auth.currentUser.getIdToken(true);
    document.cookie = `token=${encodeURIComponent(refreshedToken)}; path=/; max-age=3600; samesite=lax`;
    document.cookie = 'role=admin; path=/; max-age=3600; samesite=lax';
    return refreshedToken;
  }

  const cookieToken = getTokenFromCookie();

  if (cookieToken) {
    return cookieToken;
  }

  throw new Error('Admin session expired. Please log in again.');
};

const callUserAdminApi = async (
  method: 'POST' | 'PATCH' | 'DELETE',
  body: Record<string, unknown>
) => {
  const token = await getAdminToken();
  const response = await fetch('/api/admin/users', {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  let responseError = '';

  if (responseText) {
    try {
      const responseBody = JSON.parse(responseText) as { error?: string };
      responseError = responseBody.error || '';
    } catch {
      responseError = responseText;
    }
  }

  if (!response.ok) {
    throw new Error(responseError || `Request failed (${response.status}).`);
  }
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [form, setForm] = useState<UserFormState>(defaultFormState);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const snapshot = await getDocs(collection(db, 'user'));
      const loadedUsers = snapshot.docs
        .map((documentSnapshot) => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        }) as UserRecord)
        .sort((a, b) => {
          const aLabel = normalizeText(a.name || a.email || a.id).toLowerCase();
          const bLabel = normalizeText(b.name || b.email || b.id).toLowerCase();
          return aLabel.localeCompare(bLabel);
        });

      setUsers(loadedUsers);
    } catch (loadError) {
      console.error('Failed to load users', loadError);
      setError('Could not load users from Firestore. Check admin permissions and rules for the user collection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter((user) => {
      return [user.id, user.name, user.email, user.department]
        .map((value) => normalizeText(value).toLowerCase())
        .some((value) => value.includes(query));
    });
  }, [search, users]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(defaultFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserRecord) => {
    setEditingUser(user);
    setForm({
      uid: user.id,
      name: normalizeText(user.name),
      email: normalizeText(user.email),
      department: normalizeText(user.department),
      password: '',
      role: user.role === 'admin' ? 'admin' : 'employee',
      active: user.active !== false,
    });
    setIsModalOpen(true);
  };

  const closeModal = (force = false) => {
    if (saving && !force) {
      return;
    }

    setIsModalOpen(false);
    setEditingUser(null);
    setForm(defaultFormState);
  };

  const handleSaveUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        uid: form.uid.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        role: form.role,
        active: form.active,
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
      };

      if (editingUser) {
        await callUserAdminApi('PATCH', {
          ...payload,
          uid: editingUser.id,
        });
      } else {
        if (form.password.trim().length < 6) {
          throw new Error('Password must be at least 6 characters for new users.');
        }

        await callUserAdminApi('POST', payload);
      }

      await loadUsers();
      closeModal(true);
    } catch (saveError) {
      console.error('Failed to save user', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Could not save this user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: UserRecord) => {
    const confirmed = window.confirm(`Delete user "${normalizeText(user.name || user.email || user.id)}"?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(user.id);
    setError('');

    try {
      await callUserAdminApi('DELETE', { uid: user.id });
      await loadUsers();
    } catch (deleteError) {
      console.error('Failed to delete user', deleteError);
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete this user.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="mt-2 text-slate-600">Add, edit, and delete employee user records.</p>
        </div>
        <Button type="button" onClick={openCreateModal} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email, uid, or department..."
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
          <div className="px-6 py-8 text-sm text-slate-600">Loading users...</div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Department</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">UID</th>
                  <th scope="col" className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredUsers.map((user) => {
                  const label = normalizeText(user.name || user.email || user.id) || 'Unknown User';
                  const email = normalizeText(user.email) || '—';
                  const department = normalizeText(user.department) || '—';
                  const role = user.role === 'admin' ? 'admin' : 'employee';
                  const isActive = user.active !== false;

                  return (
                    <tr key={user.id}>
                      <td className="px-5 py-3 font-semibold text-slate-900">{label}</td>
                      <td className="px-5 py-3 text-slate-700">{email}</td>
                      <td className="px-5 py-3 text-slate-700">{department}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                          {role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="max-w-[14rem] truncate px-5 py-3 font-mono text-xs text-slate-500" title={user.id}>
                        {user.id}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            className="inline-flex items-center gap-1.5"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => void handleDeleteUser(user)}
                            disabled={deletingId === user.id}
                            className="inline-flex items-center gap-1.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingId === user.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-6 py-8 text-sm text-slate-600">
            <Users className="h-4 w-4" />
            No users found.
          </div>
        )}
      </Card>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <Card className="w-full max-w-xl border border-slate-200 bg-white p-0 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editingUser ? 'Edit User' : 'Add User'}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingUser ? 'Update auth profile, role, and account details.' : 'Create a Firebase Auth user and profile document.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close user modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(event) => void handleSaveUser(event)} className="space-y-4 px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">UID {editingUser ? '' : '(optional)'}</span>
                  <input
                    value={form.uid}
                    onChange={(event) => setForm((current) => ({ ...current, uid: event.target.value }))}
                    disabled={Boolean(editingUser)}
                    placeholder={editingUser ? editingUser.id : 'Auto-generated when empty'}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Name</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Employee name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="name@company.com"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Department</span>
                  <input
                    value={form.department}
                    onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
                    placeholder="HR, IT, Operations..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">Role</span>
                  <select
                    value={form.role}
                    onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Password {editingUser ? '(leave blank to keep current)' : ''}
                  </span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    placeholder={editingUser ? 'Optional password reset' : 'Minimum 6 characters'}
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
                Active account
              </label>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  {editingUser ? 'Save Changes' : 'Create User'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
