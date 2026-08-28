'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const [{ createUserWithEmailAndPassword }, { auth, db }, { doc, setDoc, serverTimestamp }] = await Promise.all([
        import('firebase/auth'),
        import('@/lib/firebase'),
        import('firebase/firestore'),
      ]);

      const credentials = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, 'user', credentials.user.uid), {
        name: name.trim(),
        email: email.trim(),
        department: '',
        role: 'employee',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const token = await credentials.user.getIdToken();
      document.cookie = `token=${token}; path=/; max-age=3600; samesite=lax`;
      document.cookie = 'role=employee; path=/; max-age=3600; samesite=lax';
      router.replace('/dashboard');
    } catch (signupError) {
      const firebaseError = signupError as { code?: string; message?: string };
      setError(firebaseError.code
        ? `${firebaseError.code}: ${firebaseError.message ?? 'Sign-up failed.'}`
        : signupError instanceof Error ? signupError.message : 'Unable to create your account.');
      console.error('Sign-up error:', signupError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-2 text-slate-600">Join the employee wellness platform.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSignup}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input type="text" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input type="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input type="password" placeholder="********" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
          <input type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} required className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
        </div>

        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
        <Link href="/login" className="block w-full text-center text-sm font-semibold text-teal-700 hover:text-teal-900">
          Already have an account? Sign in
        </Link>
      </form>
    </div>
  );
}