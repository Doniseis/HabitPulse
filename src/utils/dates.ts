import { Habit, HabitLog, StreakStats } from '../types';

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function formatFriendlyDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  };
  const formatted = date.toLocaleDateString('es-ES', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatShortDay(date: Date): { dayName: string; dayNum: number; isToday: boolean } {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = getTodayKey();
  const isToday = formatDateKey(date) === today;
  return {
    dayName: days[date.getDay()],
    dayNum: date.getDate(),
    isToday,
  };
}

export function getSurroundingDays(centerDate: Date, rangeBefore = 4, rangeAfter = 2): Date[] {
  const result: Date[] = [];
  for (let i = -rangeBefore; i <= rangeAfter; i++) {
    const d = new Date(centerDate);
    d.setDate(centerDate.getDate() + i);
    result.push(d);
  }
  return result;
}

export function getWeekDays(referenceDate: Date): Date[] {
  const date = new Date(referenceDate);
  // Get Monday of current week
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(date);
    d.setDate(date.getDate() + i);
    week.push(d);
  }
  return week;
}

export function calculateStreaks(habits: Habit[], logs: HabitLog, thresholdPercent = 70): StreakStats {
  if (habits.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalCompletedDays: 0,
      totalCheckIns: 0,
      completionRateWeek: 0,
      completionRateMonth: 0,
    };
  }

  const today = new Date();
  const activeHabitIds = new Set(habits.map((h) => h.id));
  const totalHabits = activeHabitIds.size;

  // Total check-ins
  let totalCheckIns = 0;
  let totalCompletedDays = 0;

  // Collect completion status per date
  const dateStatusMap = new Map<string, number>();

  Object.entries(logs).forEach(([dateKey, habitEntries]) => {
    let completedCount = 0;
    Object.entries(habitEntries).forEach(([habitId, entry]) => {
      if (activeHabitIds.has(habitId) && entry.completed) {
        completedCount++;
        totalCheckIns++;
      }
    });

    const percentage = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;
    dateStatusMap.set(dateKey, percentage);
    if (percentage >= thresholdPercent) {
      totalCompletedDays++;
    }
  });

  // Calculate current streak
  let currentStreak = 0;
  const cursor = new Date(today);
  const todayKey = formatDateKey(cursor);
  const todayPct = dateStatusMap.get(todayKey) ?? 0;

  // If today isn't completed yet, check if yesterday was completed
  if (todayPct >= thresholdPercent) {
    currentStreak = 1;
    cursor.setDate(cursor.getDate() - 1);
  } else {
    // If today is still underway, don't break streak if yesterday was completed
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = formatDateKey(cursor);
    const pct = dateStatusMap.get(key) ?? 0;
    if (pct >= thresholdPercent) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate best streak across all recorded history (scanning backwards 180 days)
  let bestStreak = currentStreak;
  let runningStreak = 0;
  const historyCursor = new Date(today);
  historyCursor.setDate(historyCursor.getDate() - 120);

  while (historyCursor <= today) {
    const key = formatDateKey(historyCursor);
    const pct = dateStatusMap.get(key) ?? 0;
    if (pct >= thresholdPercent) {
      runningStreak++;
      if (runningStreak > bestStreak) {
        bestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
    historyCursor.setDate(historyCursor.getDate() + 1);
  }

  // Week completion rate (last 7 days)
  let weekSum = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);
    weekSum += dateStatusMap.get(key) ?? 0;
  }
  const completionRateWeek = Math.round(weekSum / 7);

  // Month completion rate (last 30 days)
  let monthSum = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);
    monthSum += dateStatusMap.get(key) ?? 0;
  }
  const completionRateMonth = Math.round(monthSum / 30);

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    totalCompletedDays,
    totalCheckIns,
    completionRateWeek,
    completionRateMonth,
  };
}
