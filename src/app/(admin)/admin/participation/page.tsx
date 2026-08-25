'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { AlertCircle, Search, User, X } from 'lucide-react';
import Card from '@/components/common/Card';
import { db } from '@/lib/firebase';

type EmployeeRecord = {
  id: string;
  [key: string]: unknown;
};

const formatValue = (value: unknown) => {
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (value === undefined || value === null || value === '') {
    return '—';
  }

  return String(value);
};

export default function ParticipationPage() {
  const [users, setUsers] = useState<EmployeeRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<EmployeeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'user'));
        const loadedUsers = snapshot.docs.map((documentSnapshot) => ({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        })) as EmployeeRecord[];

        setUsers(loadedUsers);
        setSelectedUser((current) => current ?? loadedUsers[0] ?? null);
      } catch (loadError) {
        console.error('Failed to load employee users', loadError);
        setError('Firestore read access is blocked. To show live employees here, allow reads for the user collection or add a server-side admin data source.');
      } finally {
        setLoading(false);
      }
    };

    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter((user) => {
      return Object.values(user).some((value) => formatValue(value).toLowerCase().includes(query));
    });
  }, [search, users]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Employee Participation</h1>
        <p className="mt-2 text-slate-600">Click an employee to view their account-based wellness data.</p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search employees by email, uid, or data field..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {error ? (
        <Card className="border border-amber-200 bg-amber-50 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Live Firestore data could not be loaded</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.85fr]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {loading ? (
            <Card>
              <p className="text-sm text-slate-600">Loading employee records...</p>
            </Card>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <button key={user.id} type="button" onClick={() => setSelectedUser(user)} className="text-left">
                <Card className={`h-full border transition-colors ${selectedUser?.id === user.id ? 'border-teal-500 bg-teal-50/70' : 'border-slate-200 bg-white hover:border-teal-300'}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-bold text-slate-900">{formatValue(user.name || user.email || user.id)}</h2>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.active === false ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                          {user.active === false ? 'Inactive' : 'Active'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">UID: {user.id}</p>
                      <p className="mt-2 text-sm text-slate-500">Tap to view account data.</p>
                    </div>
                  </div>
                </Card>
              </button>
            ))
          ) : (
            <Card>
              <p className="text-sm text-slate-600">No employees found.</p>
            </Card>
          )}
        </div>

        <Card className="border border-slate-200 bg-white">
          {selectedUser ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-600">Employee Profile</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{formatValue(selectedUser.name || selectedUser.email || selectedUser.id)}</h2>
                  <p className="mt-1 text-sm text-slate-500">Based on the selected account record.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close employee details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <div className="max-h-[28rem] overflow-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="sticky top-0 bg-slate-100/95 backdrop-blur">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Field
                        </th>
                        <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {Object.entries(selectedUser).map(([key, value]) => (
                        <tr key={key} className="align-top">
                          <td className="w-40 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {key}
                          </td>
                          <td className="px-4 py-3 break-words text-sm text-slate-900">
                            {formatValue(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-600">Select an employee to inspect their account details.</div>
          )}
        </Card>
      </div>
    </div>
  );
}
