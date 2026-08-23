'use client';

import React from 'react';

interface ProgressRingProps {
  percentage: number;
  label: string;
  subLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'teal' | 'emerald' | 'blue' | 'purple';
}

/**
 * ProgressRing Component
 * Displays a circular progress indicator with label and sub-label
 * Used for streak tracking, participation rates, and progress visualization
 */
export default function ProgressRing({
  percentage,
  label,
  subLabel,
  size = 'md',
  color = 'teal',
}: ProgressRingProps) {
  // Determine size dimensions
  const sizeMap = {
    sm: { radius: 40, circumference: 251.2 },
    md: { radius: 60, circumference: 376.8 },
    lg: { radius: 80, circumference: 502.4 },
  };

  const dimensions = sizeMap[size];
  const strokeDashoffset =
    dimensions.circumference - (percentage / 100) * dimensions.circumference;

  // Color classes
  const colorMap = {
    teal: 'text-teal-600',
    emerald: 'text-emerald-500',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
  };

  const strokeColorMap = {
    teal: 'stroke-teal-600',
    emerald: 'stroke-emerald-500',
    blue: 'stroke-blue-600',
    purple: 'stroke-purple-600',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimensions.radius * 2}
          height={dimensions.radius * 2}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx={dimensions.radius}
            cy={dimensions.radius}
            r={dimensions.radius - 8}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-200"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions.radius}
            cy={dimensions.radius}
            r={dimensions.radius - 8}
            fill="none"
            className={strokeColorMap[color]}
            strokeWidth="4"
            strokeDasharray={dimensions.circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.35s',
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute flex flex-col items-center justify-center gap-1">
          <span className={`text-2xl font-bold ${colorMap[color]}`}>
            {percentage}%
          </span>
          <span className="text-xs font-medium text-slate-600">{label}</span>
        </div>
      </div>

      {subLabel && (
        <p className="text-center text-sm text-slate-600">{subLabel}</p>
      )}
    </div>
  );
}
