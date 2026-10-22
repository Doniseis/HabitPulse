import React from 'react';
import { Habit, HabitColor } from '../types';
import { HabitIcon, COLOR_CLASSES } from './HabitIcon';
import { Check, Plus, Minus, Sparkles } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  currentValue?: number;
  onToggle: (habitId: string) => void;
  onUpdateValue?: (habitId: string, newValue: number) => void;
  onOpenMeditation?: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  completed,
  currentValue = 0,
  onToggle,
  onUpdateValue,
  onOpenMeditation,
}) => {
  const colorTheme = COLOR_CLASSES[habit.color] || COLOR_CLASSES.emerald;
  const isNumeric = habit.type === 'numeric' && habit.targetValue;
  const target = habit.targetValue || 1;
  const progressRatio = isNumeric ? Math.min(1, Math.max(0, currentValue / target)) : completed ? 1 : 0;
  const progressPercent = Math.round(progressRatio * 100);

  const getStepAmount = () => {
    if (habit.unit === 'pasos') return 1000;
    if (habit.unit === 'ml') return 250;
    if (habit.unit === 'min') return 5;
    return 1;
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateValue) return;
    const step = getStepAmount();
    const nextVal = (currentValue || 0) + step;
    onUpdateValue(habit.id, nextVal);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateValue) return;
    const step = getStepAmount();
    const nextVal = Math.max(0, (currentValue || 0) - step);
    onUpdateValue(habit.id, nextVal);
  };

  return (
    <div
      onClick={() => onToggle(habit.id)}
      className={`relative group rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer select-none ${
        completed
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 opacity-95'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        {/* Left: Icon & Details */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              completed ? 'bg-slate-200/60 dark:bg-slate-800 text-slate-500' : colorTheme.bg
            }`}
          >
            <HabitIcon
              name={habit.icon}
              className="w-5 h-5"
              color={completed ? undefined : habit.color}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={`text-base font-semibold truncate transition-colors ${
                  completed
                    ? 'text-slate-500 dark:text-slate-400 line-through'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {habit.name}
              </h3>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              {habit.description}
            </p>

            {/* Zero-Pill unboxed metadata */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {isNumeric ? (
                <>
                  <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {currentValue.toLocaleString()} / {target.toLocaleString()} {habit.unit}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{progressPercent}%</span>
                </>
              ) : (
                <span>Check diario habitual</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Checkbox / Action Hitbox >= 44x44px */}
        <div className="flex items-center gap-2 shrink-0">
          {habit.id === 'h-meditacion' && !completed && onOpenMeditation && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMeditation();
              }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guiar 5m</span>
            </button>
          )}

          <button
            type="button"
            aria-label={completed ? `Desmarcar ${habit.name}` : `Completar ${habit.name}`}
            className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all ${
              completed
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Check
              className={`w-5 h-5 transition-transform duration-200 ${
                completed ? 'scale-110 stroke-[2.5]' : 'scale-90 opacity-40'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Numeric Habit Progress & Stepper controls */}
      {isNumeric && (
        <div
          className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress track */}
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                completed ? 'bg-emerald-500' : 'bg-emerald-600 dark:bg-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stepper buttons (min 44px hitboxes) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={currentValue <= 0}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title={`Restar ${getStepAmount()} ${habit.unit}`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleIncrement}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
              title={`Sumar ${getStepAmount()} ${habit.unit}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
