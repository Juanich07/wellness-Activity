'use client';

import { useState, useMemo } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { mockActivities } from '@/lib/mockData';
import type { ActivityCategory } from '@/lib/types';

/**
 * Activities Page
 * Displays activity categories and allows filtering with Lucide icons
 * Each activity shows duration, difficulty, and calories burned
 */
export default function ActivitiesPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    ActivityCategory | 'all'
  >('all');

  // Filter activities by category
  const filteredActivities = useMemo(() => {
    if (selectedCategory === 'all') return mockActivities;
    return mockActivities.filter((a) => a.category === selectedCategory);
  }, [selectedCategory]);

  // Category definitions with colors
  const categories = [
    { id: 'Stretching', label: 'Stretching', color: 'purple' as const, icon: 'Yoga' },
    { id: 'Walking', label: 'Walking', color: 'blue' as const, icon: 'Footprints' },
    { id: 'Aerobic', label: 'Aerobic', color: 'red' as const, icon: 'Music' },
    { id: 'Strengthening', label: 'Strengthening', color: 'green' as const, icon: 'Zap' },
    {
      id: 'Desk exercises',
      label: 'Desk Exercises',
      color: 'orange' as const,
      icon: 'Monitor',
    },
  ];

  const colorMap = {
    purple: 'bg-purple-50 border-purple-200',
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
  };

  const difficultyColor: Record<string, string> = {
    Easy: 'text-emerald-600 bg-emerald-50',
    Medium: 'text-amber-600 bg-amber-50',
    Hard: 'text-red-600 bg-red-50',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Wellness Activities</h1>
        <p className="mt-2 text-slate-600">
          Choose an activity to get started with your wellness journey
        </p>
      </div>

      {/* Category Filter */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Filter by Category
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-4 py-2 font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Activities
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as ActivityCategory)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon 
                name={cat.icon} 
                className={`h-4 w-4 ${selectedCategory === cat.id ? 'text-white' : 'text-slate-600'}`}
                size={16}
              />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredActivities.map((activity) => {
          const category = categories.find((c) => c.id === activity.category);
          const colorClass = colorMap[category?.color as keyof typeof colorMap];

          return (
            <Card
              key={activity.activityId}
              className={`flex flex-col border ${colorClass} transition-transform hover:shadow-md hover:ring-2 hover:ring-teal-400`}
            >
              {/* Activity Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">
                    {activity.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {activity.description}
                  </p>
                </div>
                <div className="ml-2 text-slate-600">
                  <Icon name={category?.icon || 'Activity'} size={32} className="h-8 w-8" />
                </div>
              </div>

              {/* Activity Details */}
              <div className="mb-4 grid grid-cols-3 gap-2 border-t border-current border-opacity-20 pt-4 text-xs">
                <div>
                  <p className="font-medium text-slate-600">Duration</p>
                  <p className="font-bold text-slate-900">
                    {activity.durationMinutes}min
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-600">Difficulty</p>
                  <p
                    className={`rounded-full px-2 py-1 text-center font-bold ${
                      difficultyColor[activity.difficulty] || 'text-slate-600 bg-slate-50'
                    }`}
                  >
                    {activity.difficulty}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-600">Calories</p>
                  <p className="font-bold text-slate-900">
                    {activity.caloriesBurned}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                size="sm"
                className="mt-auto w-full"
                onClick={() => {
                  // Navigate to activity detail page
                  window.location.href = `/activities/${activity.activityId}`;
                }}
              >
                View Activity
              </Button>
            </Card>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="rounded-lg bg-slate-50 p-8 text-center">
          <p className="text-slate-600">
            No activities found in this category. Try selecting a different
            filter.
          </p>
        </div>
      )}
    </div>
  );
}
