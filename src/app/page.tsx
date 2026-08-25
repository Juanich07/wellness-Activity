import Link from 'next/link';

export default function RootPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-teal-100/60 backdrop-blur">
          <div className="space-y-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">
              Employee Wellness App
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Sign in to test your wellness account
            </h1>
            <p className="text-base leading-7 text-slate-600">
              Use the Firebase email and password user you created to access the app and verify login flow.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-teal-600 px-6 py-3 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50"
            >
              Preview Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
