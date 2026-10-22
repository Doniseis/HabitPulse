import React, { useState } from 'react';
import { Habit, UserProfile } from '../types';
import { HabitIcon, COLOR_CLASSES } from './HabitIcon';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Bell,
  BellRing,
  Moon,
  Sun,
  Laptop,
  RotateCcw,
  Download,
  Upload,
  User,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  requestNotificationPermission,
  sendPushNotification,
  getNotificationPermission,
} from '../utils/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: Habit[];
  onAddHabit: () => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
  onResetHabits: () => void;
  profile: UserProfile | null;
  onUpdateProfile: (profile: UserProfile) => void;
  theme: 'light' | 'dark' | 'system';
  onChangeTheme: (theme: 'light' | 'dark' | 'system') => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AVATAR_OPTIONS = [
  { id: 'flame', label: 'Energía', emoji: '🔥' },
  { id: 'plant', label: 'Crecimiento', emoji: '🌱' },
  { id: 'zen', label: 'Calma', emoji: '🧘' },
  { id: 'runner', label: 'Vitalidad', emoji: '🏃' },
  { id: 'target', label: 'Enfoque', emoji: '🎯' },
  { id: 'book', label: 'Sabiduría', emoji: '📚' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  habits,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  onResetHabits,
  profile,
  onUpdateProfile,
  theme,
  onChangeTheme,
  onExportData,
  onImportData,
}) => {
  const [activeTab, setActiveTab] = useState<'habits' | 'notifications' | 'profile' | 'system'>('habits');
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [editingProfileName, setEditingProfileName] = useState(profile?.name || '');
  const [editingAvatar, setEditingAvatar] = useState(profile?.avatarIcon || 'flame');
  const [reminderTime, setReminderTime] = useState(profile?.reminderTime || '20:30');
  const [notifEnabled, setNotifEnabled] = useState(profile?.notificationsEnabled ?? true);
  const [soundEnabled, setSoundEnabled] = useState(profile?.soundEnabled ?? true);

  if (!isOpen) return null;

  const currentPermission = getNotificationPermission();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    onUpdateProfile({
      ...profile,
      name: editingProfileName.trim() || profile.name,
      avatarIcon: editingAvatar,
      reminderTime,
      notificationsEnabled: notifEnabled,
      soundEnabled,
    });
  };

  const handleTestNotification = async () => {
    let perm = getNotificationPermission();
    if (perm !== 'granted') {
      perm = await requestNotificationPermission();
    }
    if (perm === 'granted') {
      sendPushNotification('¡Notificación de prueba de HabitPulse!', {
        body: 'Las notificaciones diarias están configuradas correctamente para recordarte tus hábitos saludables.',
      });
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Configuración
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Administra tus hábitos, notificaciones y preferencias
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/60 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('habits')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'habits'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gestión de Hábitos ({habits.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Notificaciones Push
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Perfil de Usuario
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'system'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tema y Datos
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: GESTIÓN DE HÁBITOS */}
          {activeTab === 'habits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tus Hábitos Registrados
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Puedes añadir nuevos, modificar o eliminar según tu rutina
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onAddHabit}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuevo Hábito</span>
                </button>
              </div>

              {/* Habit List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {habits.map((habit) => {
                  const colorTheme = COLOR_CLASSES[habit.color] || COLOR_CLASSES.emerald;
                  return (
                    <div
                      key={habit.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorTheme.bg}`}
                        >
                          <HabitIcon name={habit.icon} color={habit.color} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {habit.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {habit.type === 'numeric'
                              ? `Meta: ${habit.targetValue} ${habit.unit || ''}`
                              : 'Check booleano simple'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onEditHabit(habit)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Editar hábito"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de que deseas eliminar "${habit.name}"?`)) {
                              onDeleteHabit(habit.id);
                            }
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Eliminar hábito"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Restore Defaults button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Restablecer a los 7 hábitos saludables predeterminados?')) {
                      onResetHabits();
                    }
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer hábitos por defecto</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICACIONES PUSH */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Recordatorio diario de hábitos pendientes
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Te avisa a la hora escogida si aún no has completado tu lista
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifEnabled}
                    onChange={(e) => {
                      setNotifEnabled(e.target.checked);
                      if (profile) {
                        onUpdateProfile({ ...profile, notificationsEnabled: e.target.checked });
                      }
                    }}
                    className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Hora del recordatorio programado
                  </span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => {
                      setReminderTime(e.target.value);
                      if (profile) {
                        onUpdateProfile({ ...profile, reminderTime: e.target.value });
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Estado de permisos del navegador:
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      currentPermission === 'granted'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {currentPermission === 'granted'
                      ? 'Concedido ✓'
                      : currentPermission === 'denied'
                      ? 'Bloqueado en el navegador'
                      : 'Pendiente de solicitud'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Enviar Notificación de Prueba</span>
                  </button>

                  {currentPermission !== 'granted' && (
                    <button
                      type="button"
                      onClick={async () => {
                        await requestNotificationPermission();
                      }}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                    >
                      Solicitar Permiso Push
                    </button>
                  )}
                </div>

                {testNotificationSent && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                    ✓ Notificación enviada. Revisa el centro de avisos de tu dispositivo.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PERFIL DE USUARIO */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editingProfileName}
                  onChange={(e) => setEditingProfileName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  maxLength={32}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Avatar personal
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setEditingAvatar(av.id)}
                      className={`h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                        editingAvatar === av.id
                          ? 'bg-emerald-500/20 border-2 border-emerald-500 scale-105 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  Guardar Perfil
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: TEMA Y DATOS */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              {/* Theme selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Tema visual
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => onChangeTheme('light')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                      theme === 'light'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Modo Claro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeTheme('dark')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                      theme === 'dark'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Modo Oscuro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeTheme('system')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                      theme === 'system'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Laptop className="w-4 h-4" />
                    <span>Automático</span>
                  </button>
                </div>
              </div>

              {/* Backup & Export */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Copia de Seguridad y Restauración
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Exporta tus datos en JSON para respaldar tus rachas o importarlos en otro dispositivo.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onExportData}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar Datos (JSON)</span>
                  </button>

                  <label className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importar Copia</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={onImportData}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
