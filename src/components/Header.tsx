import React from 'react';
import { UserProfile } from '../types';
import { Moon, Sun, Volume2, VolumeX, CheckSquare, BarChart2, Calendar, Settings as SettingsIcon } from 'lucide-react';

interface HeaderProps {
  currentTab: 'tracker' | 'stats' | 'history' | 'settings';
  onSelectTab: (tab: 'tracker' | 'stats' | 'history' | 'settings') => void;
  profile: UserProfile | null;
  theme: 'light' | 'dark' | 'system';
  isDark: boolean;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  streak: number;
}

const AVATAR_EMOJIS: Record<string, string> = {
  flame: '🔥',
  plant: '🌱',
  zen: '🧘',
  runner: '🏃',
  target: '🎯',
  book: '📚',
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  profile,
  theme,
  isDark,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  streak,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('tracker')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-base tracking-tighter">HP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                HabitPulse
              </span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap hidden sm:inline">
                Check de Hábitos Diarios
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('tracker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentTab === 'tracker'
                ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Check Diario</span>
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentTab === 'stats'
                ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Estadísticas</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentTab === 'history'
                ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Historial</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              currentTab === 'settings'
                ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Ajustes</span>
          </button>
        </nav>

        {/* Zone 3: Quick Action & Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Streak indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold tabular-nums"
            title={`Racha actual de ${streak} días`}
          >
            <span>🔥</span>
            <span>{streak}d</span>
          </div>

          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={soundEnabled ? 'Sonidos activados' : 'Sonidos silenciados'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Theme switch */}
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* User Profile trigger */}
          {profile && (
            <button
              onClick={() => onSelectTab('settings')}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 transition-colors text-left"
              title={`Perfil de ${profile.name}`}
            >
              <span className="text-base leading-none">
                {AVATAR_EMOJIS[profile.avatarIcon] || '👤'}
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[80px] sm:max-w-[110px] truncate">
                {profile.name}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
