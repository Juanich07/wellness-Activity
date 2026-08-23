export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <p className="text-xl text-slate-600 mt-4">Page not found</p>
        <a href="/dashboard" className="btn-primary inline-block mt-8">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
