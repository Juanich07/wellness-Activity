'use client';

import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="card p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Wellness App</h1>
        <p className="text-slate-600 mt-2">Employee Health & Wellness Platform</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </div>
      </div>

      <div className="space-y-3">
        <button className="btn-primary w-full">
          Sign In
        </button>

        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center rounded-lg border-2 border-teal-600 px-4 py-2.5 text-sm font-semibold text-teal-600 transition-colors hover:bg-teal-50"
        >
          Preview Dashboard →
        </Link>
      </div>
    </div>
  );
}
