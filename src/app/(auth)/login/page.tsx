'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
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
      const [{ signInWithEmailAndPassword, signOut }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('@/lib/firebase'),
      ]);

      if (auth.currentUser) {
        await signOut(auth);
      }

      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const token = await credentials.user.getIdToken();
      const cookieValue = `token=${token}; path=/; max-age=3600; samesite=lax`;

      document.cookie = cookieValue;
      document.cookie = 'role=employee; path=/; max-age=3600; samesite=lax';
      router.replace('/dashboard');
    } catch (signInError) {
      const firebaseError = signInError as { code?: string; message?: string };
      const message = firebaseError.code
        ? `${firebaseError.code}: ${firebaseError.message ?? 'Sign-in failed.'}`
        : 'Invalid email or password. Please try again.';

      setError(message);
      console.error('Sign-in error:', signInError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Wellness App</h1>
        <p className="text-slate-600 mt-2">Employee Health & Wellness Platform</p>
      </div>

      <form className="space-y-4" onSubmit={handleSignIn}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
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
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center rounded-lg border-2 border-teal-600 px-4 py-2.5 text-sm font-semibold text-teal-600 transition-colors hover:bg-teal-50"
          >
            Preview Dashboard →
          </Link>

          <Link
            href="/admin/login"
            className="flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Admin Login →
          </Link>
        </div>
      </form>
    </div>
  );
}
