import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Sparkles, Check, Bell, Flame } from 'lucide-react';
import { requestNotificationPermission } from '../utils/notifications';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
}

const AVATARS = [
  { id: 'flame', label: 'Energía', emoji: '🔥' },
  { id: 'plant', label: 'Crecimiento', emoji: '🌱' },
  { id: 'zen', label: 'Calma', emoji: '🧘' },
  { id: 'runner', label: 'Vitalidad', emoji: '🏃' },
  { id: 'target', label: 'Enfoque', emoji: '🎯' },
  { id: 'book', label: 'Sabiduría', emoji: '📚' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('flame');
  const [reminderTime, setReminderTime] = useState('20:30');
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Por favor, introduce tu nombre');
      return;
    }

    if (enableNotifications) {
      await requestNotificationPermission();
    }

    const newProfile: UserProfile = {
      name: cleanName,
      avatarIcon: selectedAvatar,
      reminderTime: reminderTime,
      notificationsEnabled: enableNotifications,
      soundEnabled: true,
      dailyGoalPercent: 85,
      registeredAt: new Date().toISOString(),
    };

    onComplete(newProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Bienvenido a HabitPulse
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Crea tu perfil en 10 segundos para empezar tu check diario de hábitos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              ¿Cómo te llamas?
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej. Denis"
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-base"
              maxLength={32}
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
          </div>

          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Elige tu avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-2 border-emerald-500 scale-105 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-slate-400'
                    }`}
                    title={av.label}
                  >
                    {av.emoji}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recordatorio diario */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Notificaciones diarias
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Recordar tareas pendientes
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableNotifications}
                onChange={(e) => setEnableNotifications(e.target.checked)}
                className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-600 cursor-pointer"
              />
            </div>

            {enableNotifications && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/50">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Hora del recordatorio:
                </span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Comenzar ahora</span>
            <Check className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
