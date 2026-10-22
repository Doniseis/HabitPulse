import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Habit, HabitLog, UserProfile, StreakStats } from './types';
import {
  loadHabits,
  saveHabits,
  loadLogs,
  saveLogs,
  loadProfile,
  saveProfile,
  loadTheme,
  saveTheme,
  exportAppData,
  importAppData,
  DEFAULT_HABITS,
} from './utils/storage';
import {
  formatDateKey,
  getTodayKey,
  calculateStreaks,
} from './utils/dates';
import {
  playCheckSound,
  playUncheckSound,
  playAllCompletedCelebration,
} from './utils/audio';
import {
  sendPushNotification,
  requestNotificationPermission,
  checkAndSendDailyReminder,
  getNotificationPermission,
} from './utils/notifications';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DailyTracker } from './components/DailyTracker';
import { StatisticsView } from './components/StatisticsView';
import { HistoryCalendarView } from './components/HistoryCalendarView';
import { SettingsModal } from './components/SettingsModal';
import { HabitFormModal } from './components/HabitFormModal';
import { MeditationTimerModal } from './components/MeditationTimerModal';
import { OnboardingModal } from './components/OnboardingModal';
import confetti from 'canvas-confetti';

export default function App() {
  // Core application state
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [logs, setLogs] = useState<HabitLog>(() => loadLogs());
  const [profile, setProfile] = useState<UserProfile | null>(() => loadProfile());
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => loadTheme());
  const [currentTab, setCurrentTab] = useState<'tracker' | 'stats' | 'history' | 'settings'>('tracker');
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const [isMeditationOpen, setIsMeditationOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Computed isDark state
  const isDarkMode = useMemo(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, [theme]);

  // Sync theme with DOM (documentElement and body)
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const apply = (dark: boolean) => {
      if (dark) {
        root.classList.add('dark');
        body.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    const currentDark =
      theme === 'dark' || (theme === 'system' && mediaQuery.matches);
    apply(currentDark);
    saveTheme(theme);

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        apply(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Persist habits, logs, profile on changes
  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    if (profile) {
      saveProfile(profile);
    }
  }, [profile]);

  // Daily push notification interval checker
  useEffect(() => {
    if (!profile || !profile.notificationsEnabled) return;

    const checkReminder = () => {
      const now = new Date();
      const currentHoursMinutes = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      // Check if current minute matches profile reminderTime
      if (currentHoursMinutes === profile.reminderTime) {
        const lastSentKey = `habitpulse_last_reminded_${formatDateKey(now)}`;
        if (!sessionStorage.getItem(lastSentKey)) {
          sessionStorage.setItem(lastSentKey, 'true');
          checkAndSendDailyReminder(profile, habits, logs);
        }
      }
    };

    const interval = setInterval(checkReminder, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [profile, habits, logs]);

  // Streaks calculation
  const stats: StreakStats = useMemo(() => {
    return calculateStreaks(habits, logs, profile?.dailyGoalPercent || 70);
  }, [habits, logs, profile]);

  // Pending habits for today
  const todayKey = getTodayKey();
  const pendingCountToday = useMemo(() => {
    const todayLogs = logs[todayKey] || {};
    return habits.filter((h) => !todayLogs[h.id]?.completed).length;
  }, [habits, logs, todayKey]);

  // Show temporary toast feedback
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  // Toggle habit completion for a specific date
  const handleToggleHabitForDate = useCallback(
    (dateKey: string, habitId: string) => {
      const dateLogs = logs[dateKey] || {};
      const currentEntry = dateLogs[habitId];
      const willBeCompleted = !currentEntry?.completed;

      const targetHabit = habits.find((h) => h.id === habitId);
      const isNumeric = targetHabit?.type === 'numeric';
      const defaultValue = isNumeric ? (targetHabit.targetValue || 1) : undefined;

      const updatedDateLogs = {
        ...dateLogs,
        [habitId]: {
          completed: willBeCompleted,
          value: willBeCompleted
            ? (currentEntry?.value && currentEntry.value > 0 ? currentEntry.value : defaultValue)
            : 0,
          completedAt: willBeCompleted ? new Date().toISOString() : undefined,
        },
      };

      const updatedLogs = {
        ...logs,
        [dateKey]: updatedDateLogs,
      };

      setLogs(updatedLogs);

      // Sound feedback
      if (profile?.soundEnabled !== false) {
        if (willBeCompleted) {
          playCheckSound();
        } else {
          playUncheckSound();
        }
      }

      // Check if all habits for this day are now completed
      const totalActiveHabits = habits.length;
      const completedCount = habits.filter((h) => updatedDateLogs[h.id]?.completed).length;

      if (willBeCompleted && completedCount === totalActiveHabits && totalActiveHabits > 0) {
        if (profile?.soundEnabled !== false) {
          playAllCompletedCelebration();
        }
        // Confetti burst
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'],
        });
        showToast('🎉 ¡Felicidades! Has completado todos tus hábitos del día.');
      }
    },
    [logs, habits, profile, showToast]
  );

  // Toggle habit for currently selected date
  const handleToggleHabit = useCallback(
    (habitId: string) => {
      const dateKey = formatDateKey(selectedDate);
      handleToggleHabitForDate(dateKey, habitId);
    },
    [selectedDate, handleToggleHabitForDate]
  );

  // Update numeric value for habit
  const handleUpdateHabitValue = useCallback(
    (habitId: string, val: number) => {
      const dateKey = formatDateKey(selectedDate);
      const dateLogs = logs[dateKey] || {};
      const targetHabit = habits.find((h) => h.id === habitId);
      const target = targetHabit?.targetValue || 1;
      const isCompleted = val >= target;

      const updatedDateLogs = {
        ...dateLogs,
        [habitId]: {
          completed: isCompleted,
          value: val,
          completedAt: isCompleted ? new Date().toISOString() : undefined,
        },
      };

      setLogs({
        ...logs,
        [dateKey]: updatedDateLogs,
      });

      if (profile?.soundEnabled !== false) {
        if (isCompleted && !dateLogs[habitId]?.completed) {
          playCheckSound();
        }
      }
    },
    [selectedDate, logs, habits, profile]
  );

  // Complete meditation habit
  const handleCompleteMeditation = useCallback(() => {
    handleToggleHabitForDate(formatDateKey(selectedDate), 'h-meditacion');
    showToast('🧘 5 minutos de meditación completados. ¡Mente despejada!');
  }, [selectedDate, handleToggleHabitForDate, showToast]);

  // Add / Edit habit save
  const handleSaveHabit = useCallback(
    (habitData: Omit<Habit, 'id' | 'createdAt' | 'order'> & { id?: string }) => {
      if (habitData.id) {
        // Edit existing
        setHabits((prev) =>
          prev.map((h) => (h.id === habitData.id ? { ...h, ...habitData } : h))
        );
        showToast(`Hábito "${habitData.name}" actualizado.`);
      } else {
        // Create new
        const newHabit: Habit = {
          ...habitData,
          id: `h-custom-${Date.now()}`,
          order: habits.length + 1,
          createdAt: new Date().toISOString(),
        };
        setHabits((prev) => [...prev, newHabit]);
        showToast(`Nuevo hábito "${habitData.name}" añadido.`);
      }
      setHabitToEdit(null);
    },
    [habits.length, showToast]
  );

  // Delete habit
  const handleDeleteHabit = useCallback(
    (habitId: string) => {
      const habitName = habits.find((h) => h.id === habitId)?.name || 'Hábito';
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      showToast(`Hábito "${habitName}" eliminado.`);
    },
    [habits, showToast]
  );

  // Reset to default habits
  const handleResetHabits = useCallback(() => {
    setHabits(DEFAULT_HABITS);
    saveHabits(DEFAULT_HABITS);
    showToast('Hábitos restablecidos a los 7 hábitos saludables predeterminados.');
  }, [showToast]);

  // Export / Import data
  const handleExportData = () => {
    const jsonStr = exportAppData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitpulse_backup_${getTodayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de datos descargada correctamente.');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAppData(content);
      if (success) {
        setHabits(loadHabits());
        setLogs(loadLogs());
        setProfile(loadProfile());
        showToast('Datos restaurados con éxito.');
      } else {
        alert('Error al leer el archivo de copia.');
      }
    };
    reader.readAsText(file);
  };

  // Immediate push notification test
  const handleTestNotification = async () => {
    let perm = getNotificationPermission();
    if (perm !== 'granted') {
      perm = await requestNotificationPermission();
    }
    if (perm === 'granted') {
      const sent = sendPushNotification(`¡Aviso HabitPulse para ${profile?.name || 'ti'}!`, {
        body: `Te quedan ${pendingCountToday} hábitos saludables pendientes hoy. ¡A por ello!`,
      });
      if (sent) {
        showToast('🔔 Notificación push enviada a tu dispositivo.');
      }
    } else {
      showToast('⚠️ Activa los permisos de notificaciones en tu navegador.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Bar Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        profile={profile}
        theme={theme}
        isDark={isDarkMode}
        onToggleTheme={() => {
          const next = isDarkMode ? 'light' : 'dark';
          setTheme(next);
        }}
        soundEnabled={profile?.soundEnabled ?? true}
        onToggleSound={() => {
          if (profile) {
            setProfile({ ...profile, soundEnabled: !profile.soundEnabled });
          }
        }}
        streak={stats.currentStreak}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {currentTab === 'tracker' && (
          <DailyTracker
            habits={habits}
            logs={logs}
            profile={profile}
            stats={stats}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onToggleHabit={handleToggleHabit}
            onUpdateValue={handleUpdateHabitValue}
            onOpenMeditation={() => setIsMeditationOpen(true)}
            onOpenAddHabit={() => {
              setHabitToEdit(null);
              setIsHabitFormOpen(true);
            }}
            onTestNotification={handleTestNotification}
          />
        )}

        {currentTab === 'stats' && (
          <StatisticsView
            habits={habits}
            logs={logs}
            stats={stats}
            onSelectDate={(dateKey) => {
              const [y, m, d] = dateKey.split('-').map(Number);
              setSelectedDate(new Date(y, m - 1, d));
              setCurrentTab('tracker');
            }}
          />
        )}

        {currentTab === 'history' && (
          <HistoryCalendarView
            habits={habits}
            logs={logs}
            onToggleHabitForDate={handleToggleHabitForDate}
            onGoToToday={() => {
              setSelectedDate(new Date());
              setCurrentTab('tracker');
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Thumb Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        pendingCount={pendingCountToday}
      />

      {/* Onboarding Modal for First Time Users */}
      <OnboardingModal
        isOpen={!profile}
        onComplete={(newProfile) => {
          setProfile(newProfile);
          showToast(`¡Bienvenido ${newProfile.name}! Tu registro está listo.`);
        }}
      />

      {/* Settings Modal (Habit list management, notifications, profile, theme) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        habits={habits}
        onAddHabit={() => {
          setHabitToEdit(null);
          setIsHabitFormOpen(true);
        }}
        onEditHabit={(habit) => {
          setHabitToEdit(habit);
          setIsHabitFormOpen(true);
        }}
        onDeleteHabit={handleDeleteHabit}
        onResetHabits={handleResetHabits}
        profile={profile}
        onUpdateProfile={(updated) => {
          setProfile(updated);
          showToast('Perfil y ajustes actualizados.');
        }}
        theme={theme}
        onChangeTheme={setTheme}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Habit Create / Edit Modal */}
      <HabitFormModal
        isOpen={isHabitFormOpen}
        habitToEdit={habitToEdit}
        onClose={() => {
          setIsHabitFormOpen(false);
          setHabitToEdit(null);
        }}
        onSave={handleSaveHabit}
      />

      {/* 5-minute Guided Meditation Modal */}
      <MeditationTimerModal
        isOpen={isMeditationOpen}
        onClose={() => setIsMeditationOpen(false)}
        onComplete={handleCompleteMeditation}
      />

      {/* Toast Feedback Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-xl border border-slate-700/40 dark:border-slate-200/40 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
