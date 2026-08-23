// User types
export interface User {
  uid: string;
  email: string;
  role: 'employee' | 'admin';
  streak: number;
  totalBreaksCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

// Activity types
export interface Activity {
  activityId: string;
  title: string;
  category: 'wellness' | 'education' | 'challenge' | 'break';
  videoUrl?: string;
  durationMinutes: number;
  description?: string;
  createdAt: Date;
}

// Activity Log types
export interface ActivityLog {
  logId: string;
  userId: string;
  timestamp: Date;
  durationMinutes: number;
  type: string;
  completed: boolean;
  activityId?: string;
  notes?: string;
}

// Feedback types
export interface Feedback {
  feedbackId: string;
  userId: string;
  message: string;
  date: Date;
  rating?: number;
  category?: string;
}

// Check-in types
export interface CheckIn {
  checkInId: string;
  userId: string;
  timestamp: Date;
  wellnessScore: number; // 1-10
  mood: string;
  notes?: string;
}

// Challenge types
export interface Challenge {
  challengeId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  objective: string;
  reward?: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Button component props
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

// Card component props
export interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

// User progress tracking
export interface UserProgress {
  currentStreak: number;
  longestStreak: number;
  totalActivities: number;
  breaksCompletedToday: number;
  lastActivityDate: Date;
}

// Activity category type
export type ActivityCategory = 'Stretching' | 'Walking' | 'Aerobic' | 'Strengthening' | 'Desk exercises';

// Wellness tip type
export interface WellnessTip {
  id: string;
  title: string;
  content: string;
  category: string;
  icon?: string;  // Lucide icon name (e.g., 'Droplet', 'Moon', 'ActivitySquare')
}
