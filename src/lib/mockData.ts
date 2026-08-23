// Mock data for development and testing

export const mockActivities = [
  {
    activityId: '1',
    title: 'Morning Stretching Routine',
    category: 'Stretching' as const,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    durationMinutes: 10,
    description: 'Gentle full-body stretching to start your day',
    difficulty: 'Easy',
    caloriesBurned: 30,
    icon: 'Yoga',
    createdAt: new Date(),
  },
  {
    activityId: '2',
    title: 'Indoor Walking',
    category: 'Walking' as const,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    durationMinutes: 30,
    description: 'Low-impact indoor walking exercise',
    difficulty: 'Easy',
    caloriesBurned: 120,
    icon: 'Footprints',
    createdAt: new Date(),
  },
  {
    activityId: '3',
    title: 'Aerobic Dance Session',
    category: 'Aerobic' as const,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    durationMinutes: 20,
    description: 'Fun and energetic dance-based cardio',
    difficulty: 'Medium',
    caloriesBurned: 200,
    icon: 'Music',
    createdAt: new Date(),
  },
  {
    activityId: '4',
    title: 'Strength Training Basics',
    category: 'Strengthening' as const,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    durationMinutes: 25,
    description: 'Bodyweight exercises for muscle building',
    difficulty: 'Medium',
    caloriesBurned: 180,
    icon: 'Zap',
    createdAt: new Date(),
  },
  {
    activityId: '5',
    title: 'Desk Exercise Breaks',
    category: 'Desk exercises' as const,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    durationMinutes: 5,
    description: 'Quick exercises you can do at your desk',
    difficulty: 'Easy',
    caloriesBurned: 15,
    icon: 'Monitor',
    createdAt: new Date(),
  },
];

export const wellnessTips = [
  {
    id: '1',
    title: 'Stay Hydrated',
    content: 'Drink at least 8 glasses of water daily to maintain energy and focus.',
    category: 'Hydration',
    icon: 'Droplet',
  },
  {
    id: '2',
    title: 'Take Regular Breaks',
    content: 'Step away from your desk every hour to stretch and rest your eyes.',
    category: 'Wellness',
    icon: 'Coffee',
  },
  {
    id: '3',
    title: 'Get Better Sleep',
    content: 'Aim for 7-9 hours of quality sleep each night for optimal health.',
    category: 'Sleep',
    icon: 'Moon',
  },
  {
    id: '4',
    title: 'Move More',
    content: 'Aim for at least 30 minutes of moderate activity most days of the week.',
    category: 'Exercise',
    icon: 'ActivitySquare',
  },
  {
    id: '5',
    title: 'Mind Your Posture',
    content: 'Keep your back straight and shoulders relaxed to prevent pain and fatigue.',
    category: 'Ergonomics',
    icon: 'Spine',
  },
];

export const dashboardStats = {
  totalActivities: 24,
  breaksCompletedToday: 3,
  participationRate: 73.5,
  currentStreak: 21,
  longestStreak: 45,
};

export const dailySchedule = [
  {
    id: '1',
    title: 'Morning Stretching',
    time: '10:00 AM',
    activity: 'Morning Stretching',
    duration: 10,
    type: 'Stretching',
    icon: 'Yoga',
  },
  {
    id: '2',
    title: 'Lunch Walk',
    time: '12:30 PM',
    activity: 'Lunch Walk',
    duration: 30,
    type: 'Walking',
    icon: 'Footprints',
  },
  {
    id: '3',
    title: 'Desk Exercises',
    time: '3:00 PM',
    activity: 'Desk Exercises',
    duration: 5,
    type: 'Desk exercises',
    icon: 'Monitor',
  },
  {
    id: '4',
    title: 'Evening Aerobic Class',
    time: '5:00 PM',
    activity: 'Evening Aerobic Class',
    duration: 20,
    type: 'Aerobic',
    icon: 'Music',
  },
];

export const adminStats = {
  totalEmployees: 245,
  participationRate: 73.5,
  activeStreaks: 89,
  breaksCompletedToday: 156,
  completedBreaksToday: 156,  // Alias for compatibility
  averageSessionsPerWeek: 4.2,
  averageSessions: 4.2,  // Alias for compatibility
  mostPopularActivity: 'Walking',
  engagementScore: 8.2,
};

// Aliases for import compatibility
export const mockDashboardStats = adminStats;
export const mockDailySchedule = dailySchedule;
export const mockUserProgress = {
  currentStreak: 21,
  longestStreak: 45,
  totalActivities: 24,
  breaksCompletedToday: 3,
  totalBreaksCompleted: 24,  // Alias
  participationRate: 73.5,  // Alias
  lastActivityDate: new Date(),
};

export const mockActivityFeed = [
  {
    id: '1',
    userName: 'Sarah Johnson',
    activity: 'Completed Morning Stretching',
    time: '2 minutes ago',
    avatar: 'User',
    avatarColor: 'bg-pink-100 text-pink-600',
  },
  {
    id: '2',
    userName: 'Michael Chen',
    activity: 'Started Indoor Walking',
    time: '5 minutes ago',
    avatar: 'User',
    avatarColor: 'bg-blue-100 text-blue-600',
  },
  {
    id: '3',
    userName: 'Emma Davis',
    activity: 'Completed Aerobic Dance Session',
    time: '10 minutes ago',
    avatar: 'User',
    avatarColor: 'bg-purple-100 text-purple-600',
  },
  {
    id: '4',
    userName: 'James Wilson',
    activity: 'Completed Strength Training',
    time: '15 minutes ago',
    avatar: 'User',
    avatarColor: 'bg-green-100 text-green-600',
  },
];

export const participationTrendData = [
  { day: 'Mon', participation: 65 },
  { day: 'Tue', participation: 70 },
  { day: 'Wed', participation: 68 },
  { day: 'Thu', participation: 75 },
  { day: 'Fri', participation: 80 },
  { day: 'Sat', participation: 55 },
  { day: 'Sun', participation: 50 },
];

export const activityDistributionData = [
  { name: 'Stretching', value: 25 },
  { name: 'Walking', value: 35 },
  { name: 'Aerobic', value: 20 },
  { name: 'Strengthening', value: 15 },
  { name: 'Desk exercises', value: 5 },
];

export const recentActivityFeed = [
  {
    id: '1',
    userName: 'Sarah Johnson',
    activity: 'Completed Morning Stretching',
    time: '2 minutes ago',
    avatar: 'User',
    avatarColor: 'bg-pink-100 text-pink-600',
  },
  {
    id: '2',
    userName: 'Michael Chen',
    activity: 'Started Indoor Walking',
    time: '5 minutes ago',
    avatar: 'User',
    avatarColor: 'bg-blue-100 text-blue-600',
  },
  {
    id: '3',
    userName: 'Emma Davis',
    activity: 'Completed Aerobic Dance Session',
    time: '10 minutes ago',
    avatar: 'User',
    avatarColor: 'bg-purple-100 text-purple-600',
  },
  {
    id: '4',
    userName: 'James Wilson',
    activity: 'Completed Strength Training',
    time: '15 minutes ago',
    avatar: 'User',
    avatarColor: 'bg-green-100 text-green-600',
  },
];
