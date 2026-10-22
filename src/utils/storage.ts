import { Habit, HabitLog, UserProfile } from '../types';
import { formatDateKey } from './dates';

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'h-lectura',
    name: 'Lectura 15min',
    description: '15 minutos de lectura enriquecedora o aprendizaje',
    icon: 'BookOpen',
    color: 'indigo',
    type: 'numeric',
    targetValue: 15,
    unit: 'min',
    isDefault: true,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h-suplementos',
    name: 'Suplementación',
    description: 'Vitaminas, minerales o suplementos prescritos',
    icon: 'Pill',
    color: 'amber',
    type: 'boolean',
    isDefault: true,
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h-agua',
    name: 'Agua',
    description: 'Hidratación óptima (mínimo 2 litros al día)',
    icon: 'Droplets',
    color: 'blue',
    type: 'numeric',
    targetValue: 2000,
    unit: 'ml',
    isDefault: true,
    order: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h-fruta',
    name: 'Pieza de fruta',
    description: 'Al menos 1 o 2 porciones de fruta fresca',
    icon: 'Apple',
    color: 'rose',
    type: 'numeric',
    targetValue: 2,
    unit: 'piezas',
    isDefault: true,
    order: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h-ejercicio',
    name: 'Ejercicio físico',
    description: 'Entrenamiento de fuerza, cardio o movilidad',
    icon: 'Dumbbell',
    color: 'emerald',
    type: 'numeric',
    targetValue: 30,
    unit: 'min',
    isDefault: true,
    order: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h-pasos',
    name: '10.000 pasos diarios',
    description: 'Caminar y mantenerse activo a lo largo de la jornada',
    icon: 'Footprints',
    color: 'cyan',
    type: 'numeric',
    targetValue: 10000,
    unit: 'pasos',
    isDefault: true,
    order: 6,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'h-meditacion',
    name: '5 minutos de meditación',
    description: 'Pausa consciente, respiración o calma mental',
    icon: 'Sparkles',
    color: 'violet',
    type: 'numeric',
    targetValue: 5,
    unit: 'min',
    isDefault: true,
    order: 7,
    createdAt: new Date().toISOString(),
  },
];

const STORAGE_KEYS = {
  HABITS: 'habitpulse_habits_v1',
  LOGS: 'habitpulse_logs_v1',
  PROFILE: 'habitpulse_profile_v1',
  THEME: 'habitpulse_theme_v1',
};

// Seed realistic initial logs for the past 14 days so new user sees populated charts and streak
function generateInitialLogs(): HabitLog {
  const initialLogs: HabitLog = {};
  const today = new Date();

  // Populate last 14 days with high adherence so user has an inspiring initial streak
  for (let i = 14; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = formatDateKey(d);

    initialLogs[dateKey] = {
      'h-lectura': { completed: true, value: 15 },
      'h-suplementos': { completed: true },
      'h-agua': { completed: true, value: 2000 },
      'h-fruta': { completed: true, value: 2 },
      'h-ejercicio': { completed: i % 4 !== 0, value: i % 4 !== 0 ? 35 : 0 },
      'h-pasos': { completed: i % 5 !== 0, value: i % 5 !== 0 ? 10450 : 7200 },
      'h-meditacion': { completed: true, value: 5 },
    };
  }

  // Today partial completion so user can check off right away
  const todayKey = formatDateKey(today);
  initialLogs[todayKey] = {
    'h-agua': { completed: true, value: 1000 },
    'h-suplementos': { completed: true },
  };

  return initialLogs;
}

export function loadHabits(): Habit[] {
  if (typeof window === 'undefined') return DEFAULT_HABITS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      saveHabits(DEFAULT_HABITS);
      return DEFAULT_HABITS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HABITS;
  } catch {
    return DEFAULT_HABITS;
  }
}

export function saveHabits(habits: Habit[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
}

export function loadLogs(): HabitLog {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      const seeded = generateInitialLogs();
      saveLogs(seeded);
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveLogs(logs: HabitLog): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
}

export function loadProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function loadTheme(): 'light' | 'dark' | 'system' {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(STORAGE_KEYS.THEME);
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'dark'; // default to stylish dark mode
}

export function saveTheme(theme: 'light' | 'dark' | 'system'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

export function exportAppData(): string {
  const habits = loadHabits();
  const logs = loadLogs();
  const profile = loadProfile();
  return JSON.stringify({ habits, logs, profile, exportedAt: new Date().toISOString() }, null, 2);
}

export function importAppData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.habits && Array.isArray(data.habits)) saveHabits(data.habits);
    if (data.logs) saveLogs(data.logs);
    if (data.profile) saveProfile(data.profile);
    return true;
  } catch {
    return false;
  }
}
