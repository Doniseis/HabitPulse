import { Habit, HabitLog, UserProfile } from '../types';
import { getTodayKey } from './dates';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

export function sendPushNotification(title: string, options?: NotificationOptions): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      body: options?.body || '¡Recuerda completar tus hábitos del día!',
      ...options,
    });
    return true;
  } catch (err) {
    console.warn('Could not send native notification:', err);
    return false;
  }
}

export function checkAndSendDailyReminder(
  profile: UserProfile,
  habits: Habit[],
  logs: HabitLog
): { sent: boolean; pendingCount: number; pendingHabits: string[] } {
  const todayKey = getTodayKey();
  const todayLogs = logs[todayKey] || {};

  const pending = habits.filter((h) => !todayLogs[h.id]?.completed);
  const pendingCount = pending.length;
  const pendingNames = pending.map((h) => h.name);

  if (pendingCount === 0) {
    return { sent: false, pendingCount: 0, pendingHabits: [] };
  }

  if (profile.notificationsEnabled && Notification.permission === 'granted') {
    const habitNamesStr = pendingNames.slice(0, 3).join(', ') + (pendingNames.length > 3 ? '...' : '');
    const sent = sendPushNotification(`¡Recordatorio de Hábitos para ${profile.name || 'hoy'}!`, {
      body: `Te faltan ${pendingCount} hábitos por completar: ${habitNamesStr}. ¡Mantén viva tu racha!`,
      tag: 'daily-reminder',
    });
    return { sent, pendingCount, pendingHabits: pendingNames };
  }

  return { sent: false, pendingCount, pendingHabits: pendingNames };
}
