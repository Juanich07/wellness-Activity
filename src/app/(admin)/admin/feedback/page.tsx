'use client';

import Card from '@/components/common/Card';

export default function AdminFeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Feedback Summary</h1>
        <p className="mt-2 text-slate-600">Review employee feedback and suggestions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-slate-600">Positive Notes</p>
          <p className="mt-2 text-3xl font-bold text-emerald-500">18</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-600">Suggestions</p>
          <p className="mt-2 text-3xl font-bold text-teal-600">7</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-600">Needs Review</p>
          <p className="mt-2 text-3xl font-bold text-amber-500">2</p>
        </Card>
      </div>
    </div>
  );
}
