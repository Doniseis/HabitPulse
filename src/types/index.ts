export type HabitType = 'boolean' | 'numeric';

export type HabitColor = 'emerald' | 'blue' | 'indigo' | 'violet' | 'amber' | 'rose' | 'cyan';

export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon key
  color: HabitColor;
  type: HabitType;
  targetValue?: number; // e.g. 10000 steps, 2000 ml water, 15 min
  unit?: string; // 'pasos', 'ml', 'min', 'piezas'
  isDefault?: boolean;
  order: number;
  createdAt: string;
}

export interface HabitLog {
  [dateStr: string]: {
    [habitId: string]: {
      completed: boolean;
      value?: number;
      completedAt?: string;
    };
  };
}

export interface UserProfile {
  name: string;
  avatarIcon: string;
  reminderTime: string; // "20:00"
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  dailyGoalPercent: number; // e.g. 100 or 80
  registeredAt: string;
}

export interface DayProgress {
  date: string;
  totalHabits: number;
  completedHabits: number;
  percentage: number;
}

export interface StreakStats {
  currentStreak: number;
  bestStreak: number;
  totalCompletedDays: number;
  totalCheckIns: number;
  completionRateWeek: number;
  completionRateMonth: number;
}
