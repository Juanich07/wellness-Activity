'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const [{ getIdTokenResult, signInWithEmailAndPassword, signOut }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('@/lib/firebase'),
      ]);

      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await getIdTokenResult(credentials.user, true);
      const token = await credentials.user.getIdToken();
      const adminDocRef = doc(db, 'admin', credentials.user.uid);
      let adminRecord: { active?: boolean } | null = null;

      try {
        const adminDocSnapshot = await getDoc(adminDocRef);
        adminRecord = adminDocSnapshot.exists() ? (adminDocSnapshot.data() as { active?: boolean }) : null;
      } catch (readError) {
        console.warn('Admin record lookup failed, falling back to UID/custom-claim check.', readError);
      }

      const isAdmin =
        tokenResult.claims.role === 'admin' ||
        adminRecord?.active === true;

      if (!isAdmin) {
        await signOut(auth);
        setError('This account is not allowed to access the admin area.');
        return;
      }

      document.cookie = `token=${token}; path=/; max-age=3600; samesite=lax`;
      document.cookie = 'role=admin; path=/; max-age=3600; samesite=lax';
      router.replace('/admin/dashboard');
    } catch (signInError) {
      const firebaseError = signInError as { code?: string; message?: string };
      const message = firebaseError.code
        ? `${firebaseError.code}: ${firebaseError.message ?? 'Sign-in failed.'}`
        : 'Invalid email or password. Please try again.';

      setError(message);
      console.error('Admin sign-in error:', signInError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card space-y-6 p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">Admin Login</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Admin Panel</h1>
        <p className="mt-2 text-slate-600">Access employee participation, reports, and wellness management tools.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSignIn}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            placeholder="admin@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="space-y-3">
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Admin Sign In'}
          </button>

          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-lg border-2 border-teal-600 px-4 py-2.5 text-sm font-semibold text-teal-600 transition-colors hover:bg-teal-50"
          >
            Employee Login →
          </Link>
        </div>
      </form>
    </div>
  );
}