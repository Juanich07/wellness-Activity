import {
  Activity,
  WellnessTip,
  DashboardStats,
  Challenge,
  UserProgress,
} from './types';

export const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Morning Stretch Routine',
    description: 'A gentle 5-minute stretching routine to start your day',
    category: 'stretching',
    duration: 5,
    difficulty: 'easy',
    youtubeVideoId: 'dQw4w9WgXcQ',
    instructions: [
      'Reach your arms overhead and lean to each side',
      'Touch your toes gently',
      'Rotate your shoulders slowly',
    ],
    caloriesBurned: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Walk and Breathe',
    description: 'A brisk 10-minute walking activity',
    category: 'walking',
    duration: 10,
    difficulty: 'moderate',
    youtubeVideoId: 'dQw4w9WgXcQ',
    caloriesBurned: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Desk Yoga Flow',
    description: 'Yoga poses you can do at your desk',
    category: 'desk-exercises',
    duration: 8,
    difficulty: 'easy',
    youtubeVideoId: 'dQw4w9WgXcQ',
    caloriesBurned: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Cardio Burst',
    description: 'High-energy cardio exercise session',
    category: 'aerobic',
    duration: 15,
    difficulty: 'hard',
    youtubeVideoId: 'dQw4w9WgXcQ',
    caloriesBurned: 150,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Strength Training Basics',
    description: 'Beginner-friendly strength training exercises',
    category: 'strengthening',
    duration: 12,
    difficulty: 'moderate',
    youtubeVideoId: 'dQw4w9WgXcQ',
    caloriesBurned: 120,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const wellnessTips: WellnessTip[] = [
  {
    id: '1',
    title: 'Stay Hydrated',
    content: 'Drink at least 8 glasses of water per day to maintain optimal health and energy levels.',
    category: 'hydration',
    icon: '💧',
  },
  {
    id: '2',
    title: 'Perfect Your Posture',
    content:
      'Keep your shoulders back and your spine straight. Good posture reduces strain and improves confidence.',
    category: 'posture',
    icon: '🧍',
  },
  {
    id: '3',
    title: 'Take Mindful Breaks',
    content: 'Every hour, step away from your desk and take 5 minutes to breathe and refocus.',
    category: 'mindfulness',
    icon: '🧘',
  },
  {
    id: '4',
    title: 'Move Every 30 Minutes',
    content: 'Sitting for too long increases health risks. Stand, stretch, or walk for a few minutes every 30 minutes.',
    category: 'movement',
    icon: '🚶',
  },
  {
    id: '5',
    title: 'Eat Balanced Meals',
    content: 'Include fruits, vegetables, proteins, and whole grains in your diet for sustained energy.',
    category: 'nutrition',
    icon: '🥗',
  },
];

export const mockDashboardStats: DashboardStats = {
  totalEmployees: 245,
  participationRate: 73.5,
  activeStreaks: 89,
  completedBreaksToday: 156,
  averageSessions: 3.2,
};

export const mockUserProgress: UserProgress = {
  userId: 'user-123',
  totalActivities: 47,
  totalBreaksCompleted: 23,
  currentStreak: 21,
  longestStreak: 32,
  lastActivityDate: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
  participationRate: 85,
  favoriteActivities: ['1', '3', '5'],
  updatedAt: new Date(),
};

export const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: '30-Day Streak',
    description: 'Complete at least one activity every day for 30 days',
    icon: '🔥',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    target: 30,
    type: 'streak',
    reward: '500 points',
  },
  {
    id: '2',
    title: 'Activity Master',
    description: 'Complete 20 different activities',
    icon: '⭐',
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    target: 20,
    type: 'activities',
    reward: 'Premium Badge',
  },
  {
    id: '3',
    title: 'Team Participation',
    description: 'Encourage 5 colleagues to join the wellness program',
    icon: '👥',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    target: 5,
    type: 'participation',
    reward: '300 points',
  },
];

// Mock schedule for the day
export const mockDailySchedule = [
  {
    id: '1',
    title: 'Morning Stretch',
    time: '09:00 AM',
    type: 'stretching',
    duration: 5,
  },
  {
    id: '2',
    title: 'Team Wellness Break',
    time: '12:00 PM',
    type: 'break',
    duration: 15,
  },
  {
    id: '3',
    title: 'Afternoon Walk',
    time: '03:00 PM',
    type: 'walking',
    duration: 10,
  },
  {
    id: '4',
    title: 'Evening Yoga',
    time: '05:30 PM',
    type: 'stretching',
    duration: 12,
  },
];

// Mock recent activity feed
export const mockActivityFeed = [
  {
    id: '1',
    userName: 'Sarah Johnson',
    activity: 'Morning Stretch Routine',
    time: '2 hours ago',
    icon: '🧘',
  },
  {
    id: '2',
    userName: 'Mike Chen',
    activity: 'Walk and Breathe',
    time: '1 hour ago',
    icon: '🚶',
  },
  {
    id: '3',
    userName: 'Emma Davis',
    activity: 'Strength Training Basics',
    time: '30 minutes ago',
    icon: '💪',
  },
  {
    id: '4',
    userName: 'John Smith',
    activity: 'Desk Yoga Flow',
    time: '15 minutes ago',
    icon: '🧘',
  },
  {
    id: '5',
    userName: 'Lisa Wong',
    activity: 'Cardio Burst',
    time: 'Just now',
    icon: '🏃',
  },
];
