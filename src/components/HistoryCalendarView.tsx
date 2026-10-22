import React, { useState } from 'react';
import { Habit, HabitLog } from '../types';
import { formatDateKey, formatFriendlyDate, parseDateKey, getTodayKey } from '../utils/dates';
import { HabitIcon, COLOR_CLASSES } from './HabitIcon';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Calendar, Sparkles } from 'lucide-react';

interface HistoryCalendarViewProps {
  habits: Habit[];
  logs: HabitLog;
  onToggleHabitForDate: (dateKey: string, habitId: string) => void;
  onGoToToday: () => void;
}

export const HistoryCalendarView: React.FC<HistoryCalendarViewProps> = ({
  habits,
  logs,
  onToggleHabitForDate,
  onGoToToday,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(() => getTodayKey());

  const todayKey = getTodayKey();

  // Navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Month grid calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Monday = 0, Sunday = 6
  let startOffset = firstDayOfMonth.getDay() - 1;
  if (startOffset === -1) startOffset = 6;

  const totalDays = lastDayOfMonth.getDate();
  const calendarCells: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push(new Date(year, month, d));
  }

  const monthTitle = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const formattedMonth = monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1);

  // Selected date status
  const selectedLog = logs[selectedDateKey] || {};
  const selectedDate = parseDateKey(selectedDateKey);
  const completedCount = habits.filter((h) => selectedLog[h.id]?.completed).length;
  const isSelectedToday = selectedDateKey === todayKey;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* Left: Month Calendar (7 cols on lg) */}
      <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Navigation bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {formattedMonth}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                setSelectedDateKey(todayKey);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 py-1">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar Matrix */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarCells.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const dateKey = formatDateKey(date);
            const isSelected = dateKey === selectedDateKey;
            const isToday = dateKey === todayKey;
            const dayLog = logs[dateKey] || {};
            const done = habits.filter((h) => dayLog[h.id]?.completed).length;
            const pct = habits.length > 0 ? done / habits.length : 0;
            const isAllDone = done === habits.length && habits.length > 0;

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDateKey(dateKey)}
                className={`relative aspect-square rounded-xl p-1 flex flex-col items-center justify-between transition-all ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 bg-emerald-500/10'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                } ${isToday ? 'border border-emerald-500/40' : 'border border-slate-100 dark:border-slate-800/40'}`}
              >
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    isToday
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : isSelected
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {date.getDate()}
                </span>

                {/* Micro completion indicator */}
                {done > 0 ? (
                  <div className="w-full flex items-center justify-center">
                    {isAllDone ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ) : (
                      <span
                        className="text-[9px] font-mono tabular-nums text-slate-400 dark:text-slate-500"
                      >
                        {done}/{habits.length}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-1.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Selected Day Inspector & Habit Check list (5 cols on lg) */}
      <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {isSelectedToday ? 'Día de Hoy' : 'Día Seleccionado'}
            </span>
            <span className="text-xs font-mono font-semibold tabular-nums text-slate-500">
              {completedCount} de {habits.length} completados
            </span>
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white capitalize mt-0.5">
            {formatFriendlyDate(selectedDate)}
          </h4>
        </div>

        {/* Habits Checklist for this date */}
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {habits.map((habit) => {
            const isCompleted = !!selectedLog[habit.id]?.completed;
            const habitVal = selectedLog[habit.id]?.value;
            const colorTheme = COLOR_CLASSES[habit.color] || COLOR_CLASSES.emerald;

            return (
              <div
                key={habit.id}
                onClick={() => onToggleHabitForDate(selectedDateKey, habit.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isCompleted
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isCompleted ? 'bg-slate-200 dark:bg-slate-800 text-slate-400' : colorTheme.bg
                    }`}
                  >
                    <HabitIcon name={habit.icon} color={habit.color} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span
                      className={`text-xs font-semibold truncate block ${
                        isCompleted
                          ? 'text-slate-500 line-through'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {habit.name}
                    </span>
                    {habit.type === 'numeric' && (
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                        {isCompleted && habitVal
                          ? `${habitVal} ${habit.unit || ''}`
                          : `Meta: ${habit.targetValue} ${habit.unit || ''}`}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-sm border border-slate-300 dark:border-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isSelectedToday && completedCount === habits.length && habits.length > 0 && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              ¡Día 100% completado con éxito! Tu racha sigue brillando hoy.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
