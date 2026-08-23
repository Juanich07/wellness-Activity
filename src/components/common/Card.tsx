'use client';

import { CardProps } from '@/lib/types';

/**
 * Reusable Card Component
 * Provides consistent card styling across the application
 */
export default function Card({
  title,
  children,
  className = '',
}: CardProps) {
  return (
    <div
      className={`rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 ${className}`}
    >
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-slate-900">{title}</h3>
      )}
      {children}
    </div>
  );
}
