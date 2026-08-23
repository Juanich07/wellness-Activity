// User and Authentication Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'employee' | 'admin';
  department?: string;
  joinDate: Date;
  photoURL?: string;
}

// Activity Types
export type ActivityCategory = 'stretching' | 'walking' | 'aerobic' | 'strengthening' | 'desk-exercises';

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  duration: number; // in minutes
  difficulty: 'easy' | 'moderate' | 'hard';
  youtubeVideoId: string;
  instructions?: string[];
  caloriesBurned?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  userId: string;
  activityId: string;
  completedAt: Date;
  durationCompleted: number; // in minutes
  timestamp: Date;
}

// Break Session Types
export interface BreakSession {
  id: string;
  userId: string;
  activityId: string;
  startTime: Date;
  endTime?: Date;
  status: 'in-progress' | 'completed' | 'abandoned';
  phases: BreakPhase[];
}

export interface BreakPhase {
  id: string;
  name: 'warm-up' | 'video' | 'cool-down' | 'message';
  duration: number; // in minutes
  completed: boolean;
  completedAt?: Date;
}

// Challenge Types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  startDate: Date;
  endDate: Date;
  target: number; // number of activities or streaks
  type: 'activities' | 'streak' | 'participation';
  reward?: string;
}

// User Progress Types
export interface UserProgress {
  userId: string;
  totalActivities: number;
  totalBreaksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  participationRate: number; // percentage
  favoriteActivities: string[]; // activity IDs
  updatedAt: Date;
}

// Feedback Types
export interface Feedback {
  id: string;
  userId: string;
  type: 'suggestion' | 'bug' | 'compliment';
  message: string;
  rating?: number; // 1-5
  createdAt: Date;
  response?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalEmployees: number;
  participationRate: number; // percentage
  activeStreaks: number;
  completedBreaksToday: number;
  averageSessions: number; // per employee per week
}

// Wellness Tip
export interface WellnessTip {
  id: string;
  title: string;
  content: string;
  category: 'posture' | 'hydration' | 'mindfulness' | 'movement' | 'nutrition';
  icon: string;
}

// Component Props Types
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}
