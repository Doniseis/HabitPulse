import React from 'react';
import { CheckSquare, BarChart2, Calendar, Settings as SettingsIcon } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'tracker' | 'stats' | 'history' | 'settings';
  onSelectTab: (tab: 'tracker' | 'stats' | 'history' | 'settings') => void;
  pendingCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, pendingCount }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
        {/* Tab 1: Diario */}
        <button
          onClick={() => onSelectTab('tracker')}
          className="relative min-h-[44px] flex flex-col items-center justify-center transition-colors"
        >
          <div className="relative">
            <CheckSquare
              className={`w-5 h-5 transition-transform ${
                currentTab === 'tracker'
                  ? 'text-emerald-500 scale-110'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            {pendingCount > 0 && currentTab !== 'tracker' && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </div>
          <span
            className={`text-[10px] font-semibold tracking-tight mt-1 ${
              currentTab === 'tracker'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Diario
          </span>
        </button>

        {/* Tab 2: Estadísticas */}
        <button
          onClick={() => onSelectTab('stats')}
          className="min-h-[44px] flex flex-col items-center justify-center transition-colors"
        >
          <BarChart2
            className={`w-5 h-5 transition-transform ${
              currentTab === 'stats'
                ? 'text-emerald-500 scale-110'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <span
            className={`text-[10px] font-semibold tracking-tight mt-1 ${
              currentTab === 'stats'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Métricas
          </span>
        </button>

        {/* Tab 3: Historial */}
        <button
          onClick={() => onSelectTab('history')}
          className="min-h-[44px] flex flex-col items-center justify-center transition-colors"
        >
          <Calendar
            className={`w-5 h-5 transition-transform ${
              currentTab === 'history'
                ? 'text-emerald-500 scale-110'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <span
            className={`text-[10px] font-semibold tracking-tight mt-1 ${
              currentTab === 'history'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Historial
          </span>
        </button>

        {/* Tab 4: Configuración */}
        <button
          onClick={() => onSelectTab('settings')}
          className="min-h-[44px] flex flex-col items-center justify-center transition-colors"
        >
          <SettingsIcon
            className={`w-5 h-5 transition-transform ${
              currentTab === 'settings'
                ? 'text-emerald-500 scale-110'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <span
            className={`text-[10px] font-semibold tracking-tight mt-1 ${
              currentTab === 'settings'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Ajustes
          </span>
        </button>
      </div>
    </nav>
  );
};
