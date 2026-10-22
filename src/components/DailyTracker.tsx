import React, { useState, useMemo } from 'react';
import { Habit, HabitLog, UserProfile, StreakStats } from '../types';
import { HabitCard } from './HabitCard';
import {
  formatDateKey,
  formatFriendlyDate,
  getSurroundingDays,
  getTodayKey,
} from '../utils/dates';
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Bell,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyTrackerProps {
  habits: Habit[];
  logs: HabitLog;
  profile: UserProfile | null;
  stats: StreakStats;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onToggleHabit: (habitId: string) => void;
  onUpdateValue: (habitId: string, val: number) => void;
  onOpenMeditation: () => void;
  onOpenAddHabit: () => void;
  onTestNotification: () => void;
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({
  habits,
  logs,
  profile,
  stats,
  selectedDate,
  onSelectDate,
  onToggleHabit,
  onUpdateValue,
  onOpenMeditation,
  onOpenAddHabit,
  onTestNotification,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const selectedDateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);
  const todayKey = useMemo(() => getTodayKey(), []);
  const isToday = selectedDateKey === todayKey;

  // Horizontal scroller days (past 4 days, today, next 2 days)
  const scrollerDays = useMemo(() => {
    return getSurroundingDays(new Date(), 4, 2);
  }, []);

  // Today's completion stats
  const currentDayLog = logs[selectedDateKey] || {};
  const completedHabits = useMemo(() => {
    return habits.filter((h) => currentDayLog[h.id]?.completed);
  }, [habits, currentDayLog]);

  const pendingHabits = useMemo(() => {
    return habits.filter((h) => !currentDayLog[h.id]?.completed);
  }, [habits, currentDayLog]);

  const totalCount = habits.length;
  const completedCount = completedHabits.length;
  const pendingCount = pendingHabits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  // Filtered habits list
  const displayedHabits = useMemo(() => {
    if (filter === 'pending') return pendingHabits;
    if (filter === 'completed') return completedHabits;
    return habits;
  }, [filter, habits, pendingHabits, completedHabits]);

  // Navigate day by day
  const handlePrevDay = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() - 1);
    onSelectDate(next);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + 1);
    onSelectDate(next);
  };

  const handleJumpToToday = () => {
    onSelectDate(new Date());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Header Strip */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Check Diario de Salud y Bienestar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
              {profile ? `¡Hola, ${profile.name}!` : '¡Hola!'}
            </h1>
            <p className="text-sm text-slate-300">
              {isAllCompleted
                ? '¡Extraordinario! Has cumplido todos tus hábitos diarios de hoy.'
                : pendingCount === 1
                ? '¡Casi lo tienes! Solo te queda 1 hábito para completar tu meta del día.'
                : `Tienes ${pendingCount} de ${totalCount} hábitos pendientes para hoy. ¡Mantén tu ritmo!`}
            </p>
          </div>

          {/* Radial progress ring and streak */}
          <div className="flex items-center gap-5 shrink-0">
            {/* Circular Progress Ring */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-slate-700/60"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-emerald-400 transition-all duration-500"
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-base font-extrabold font-mono tabular-nums leading-none">
                  {progressPercent}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
                  {completedCount}/{totalCount}
                </span>
              </div>
            </div>

            {/* Streak indicator badge */}
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/70 p-3 rounded-2xl flex flex-col items-center min-w-[90px]">
              <div className="flex items-center gap-1 text-amber-400">
                <Flame className="w-5 h-5 fill-current" />
                <span className="text-xl font-extrabold font-mono tabular-nums">
                  {stats.currentStreak}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-300 mt-0.5">
                Racha actual
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Carousel & Navigation Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Date Selector Header */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Día anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextDay}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Día siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              {isToday ? 'Hoy' : 'Día seleccionado'}
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white capitalize">
              {formatFriendlyDate(selectedDate)}
            </span>
          </div>

          {!isToday && (
            <button
              onClick={handleJumpToToday}
              className="ml-auto sm:ml-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
            >
              Ir a Hoy
            </button>
          )}
        </div>

        {/* Horizontal Mini Date Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {scrollerDays.map((d) => {
            const key = formatDateKey(d);
            const isSel = key === selectedDateKey;
            const isTod = key === todayKey;
            const daysShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const dayName = daysShort[d.getDay()];

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectDate(d)}
                className={`min-w-[44px] py-1.5 px-2 rounded-xl flex flex-col items-center transition-all ${
                  isSel
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase">{dayName}</span>
                <span className="text-sm font-bold font-mono tabular-nums">{d.getDate()}</span>
                {isTod && (
                  <span
                    className={`w-1 h-1 rounded-full mt-0.5 ${
                      isSel ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-emerald-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reminder notification nudge banner if pending tasks and notifications configured */}
      {isToday && pendingCount > 0 && profile?.notificationsEnabled && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                Recordatorio automático programado a las {profile.reminderTime}
              </p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400">
                Tienes {pendingCount} hábitos pendientes hoy. Recibirás un aviso push para no perder tu racha.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onTestNotification}
            className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            Probar aviso push ahora
          </button>
        </div>
      )}

      {/* Habit Filters & Quick Add */}
      <div className="flex items-center justify-between gap-3">
        {/* Interactive segmented controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Completados ({completedCount})
          </button>
        </div>

        {/* Quick add habit button */}
        <button
          type="button"
          onClick={onOpenAddHabit}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir hábito</span>
        </button>
      </div>

      {/* Habit Cards Grid / List */}
      {displayedHabits.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            {filter === 'pending' ? '¡Todos los hábitos completados!' : 'No hay hábitos en esta categoría'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {filter === 'pending'
              ? 'Has terminado todos tus checks de hoy con éxito.'
              : 'Puedes cambiar el filtro o añadir un nuevo hábito.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {displayedHabits.map((habit) => {
            const entry = currentDayLog[habit.id];
            const isCompleted = !!entry?.completed;
            const currentVal = entry?.value ?? 0;

            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={isCompleted}
                currentValue={currentVal}
                onToggle={onToggleHabit}
                onUpdateValue={onUpdateValue}
                onOpenMeditation={onOpenMeditation}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
