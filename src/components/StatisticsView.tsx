import React, { useMemo } from 'react';
import { Habit, HabitLog, StreakStats } from '../types';
import {
  formatDateKey,
  getWeekDays,
  parseDateKey,
} from '../utils/dates';
import { HabitIcon, COLOR_CLASSES } from './HabitIcon';
import { Flame, Trophy, CalendarCheck2, TrendingUp, Check, Award } from 'lucide-react';

interface StatisticsViewProps {
  habits: Habit[];
  logs: HabitLog;
  stats: StreakStats;
  onSelectDate?: (dateKey: string) => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  habits,
  logs,
  stats,
  onSelectDate,
}) => {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);

  // Weekly compliance data (current week: Monday to Sunday)
  const currentWeekDays = useMemo(() => getWeekDays(today), [today]);
  const weekPerformance = useMemo(() => {
    const daysShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return currentWeekDays.map((d, index) => {
      const key = formatDateKey(d);
      const dayLog = logs[key] || {};
      const completedCount = habits.filter((h) => dayLog[h.id]?.completed).length;
      const total = habits.length;
      const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
      return {
        date: d,
        key,
        dayName: daysShort[index],
        dayNumber: d.getDate(),
        completedCount,
        total,
        percent,
        isToday: key === todayKey,
        isFuture: d > today,
      };
    });
  }, [currentWeekDays, logs, habits, todayKey, today]);

  // Per-habit adherence over the last 30 days
  const habitBreakdown = useMemo(() => {
    const last30Days: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      last30Days.push(formatDateKey(d));
    }

    return habits
      .map((habit) => {
        let completedCount = 0;
        last30Days.forEach((dateKey) => {
          if (logs[dateKey]?.[habit.id]?.completed) {
            completedCount++;
          }
        });
        const adherencePct = Math.round((completedCount / 30) * 100);
        return {
          habit,
          completedCount,
          total: 30,
          adherencePct,
        };
      })
      .sort((a, b) => b.adherencePct - a.adherencePct);
  }, [habits, logs, today]);

  // 60-day consistency heatmap
  const heatmapDays = useMemo(() => {
    const days: { key: string; date: Date; percent: number }[] = [];
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = formatDateKey(d);
      const dayLog = logs[key] || {};
      const completed = habits.filter((h) => dayLog[h.id]?.completed).length;
      const pct = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
      days.push({ key, date: d, percent: pct });
    }
    return days;
  }, [habits, logs, today]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Racha actual */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Racha Actual
            </span>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {stats.currentStreak}{' '}
              <span className="text-xs font-sans font-medium text-slate-400">días</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Mejor racha */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Mejor Racha
            </span>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {stats.bestStreak}{' '}
              <span className="text-xs font-sans font-medium text-slate-400">días</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Días cumplidos */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Días Cumplidos
            </span>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {stats.totalCompletedDays}{' '}
              <span className="text-xs font-sans font-medium text-slate-400">totales</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Tasa semanal */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Cumplimiento 7d
            </span>
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {stats.completionRateWeek}%
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Compliance Chart */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cumplimiento de la Semana Actual
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Porcentaje diario de hábitos completados (Lunes a Domingo)
            </p>
          </div>
          <div className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
            Media semanal: {stats.completionRateWeek}%
          </div>
        </div>

        {/* Bar chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 items-end min-h-[180px]">
          {weekPerformance.map((item) => {
            const isCompletedAll = item.percent === 100;
            return (
              <div
                key={item.key}
                onClick={() => onSelectDate && onSelectDate(item.key)}
                className={`flex flex-col items-center group cursor-pointer ${
                  item.isFuture ? 'opacity-40 pointer-events-none' : ''
                }`}
              >
                {/* Value tooltip label */}
                <span className="text-[11px] font-mono tabular-nums font-semibold text-slate-500 dark:text-slate-400 mb-1.5 opacity-90 group-hover:text-emerald-500 transition-colors">
                  {item.percent}%
                </span>

                {/* Vertical Bar Container */}
                <div className="w-full max-w-[42px] h-32 bg-slate-100 dark:bg-slate-800 rounded-xl relative flex items-end overflow-hidden p-1">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      item.isToday
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                        : isCompletedAll
                        ? 'bg-emerald-500'
                        : item.percent > 0
                        ? 'bg-slate-400 dark:bg-slate-600 group-hover:bg-emerald-500/80'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.max(6, item.percent)}%` }}
                  />
                </div>

                {/* Day label */}
                <div className="mt-2 text-center">
                  <span
                    className={`block text-xs font-semibold uppercase tracking-tight ${
                      item.isToday
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.dayName}
                  </span>
                  <span className="block text-[11px] font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                    {item.dayNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Habit Performance Breakdown + Consistency Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Performance Breakdown (Last 30 days) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Rendimiento por Hábito (30 días)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Último mes</span>
          </div>

          <div className="space-y-3.5">
            {habitBreakdown.map(({ habit, adherencePct, completedCount, total }) => {
              const colorTheme = COLOR_CLASSES[habit.color] || COLOR_CLASSES.emerald;
              return (
                <div key={habit.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${colorTheme.bg}`}>
                        <HabitIcon name={habit.icon} color={habit.color} className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {habit.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>{completedCount}/{total}d</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {adherencePct}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        adherencePct >= 80
                          ? 'bg-emerald-500'
                          : adherencePct >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${adherencePct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 60-Day Consistency Heatmap */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Matriz de Consistencia (60 días)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Intensidad diaria de hábitos logrados
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <span>Menos</span>
              <div className="w-2.5 h-2.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" />
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Más</span>
            </div>
          </div>

          <div className="grid grid-cols-10 gap-1.5 pt-2">
            {heatmapDays.map((item) => {
              const { key, percent } = item;
              let bg = 'bg-slate-100 dark:bg-slate-800';
              if (percent === 100) bg = 'bg-emerald-500';
              else if (percent >= 70) bg = 'bg-emerald-500/70';
              else if (percent >= 40) bg = 'bg-emerald-500/40';
              else if (percent > 0) bg = 'bg-emerald-500/20';

              return (
                <div
                  key={key}
                  onClick={() => onSelectDate && onSelectDate(key)}
                  title={`${key}: ${percent}% completado`}
                  className={`aspect-square rounded-md ${bg} hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer`}
                />
              );
            })}
          </div>

          {/* Motivational milestone box */}
          <div className="pt-2">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-start gap-3">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300 block">
                  Consejo de constancia diaria
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  La clave de los hábitos saludables no es la perfección, sino nunca dejar pasar 2 días seguidos sin marcar tu check. ¡Tu racha actual de {stats.currentStreak} días lo demuestra!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
