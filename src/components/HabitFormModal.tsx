import React, { useState, useEffect } from 'react';
import { Habit, HabitColor, HabitType } from '../types';
import { X, Check } from 'lucide-react';
import { ICON_MAP, COLOR_CLASSES, HabitIcon } from './HabitIcon';

interface HabitFormModalProps {
  isOpen: boolean;
  habitToEdit?: Habit | null;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'order'> & { id?: string }) => void;
}

const AVAILABLE_ICONS = Object.keys(ICON_MAP);
const AVAILABLE_COLORS: HabitColor[] = [
  'emerald',
  'blue',
  'indigo',
  'violet',
  'amber',
  'rose',
  'cyan',
];

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  habitToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('CheckCircle');
  const [color, setColor] = useState<HabitColor>('emerald');
  const [type, setType] = useState<HabitType>('boolean');
  const [targetValue, setTargetValue] = useState<number>(1);
  const [unit, setUnit] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setIcon(habitToEdit.icon);
      setColor(habitToEdit.color);
      setType(habitToEdit.type);
      setTargetValue(habitToEdit.targetValue || 1);
      setUnit(habitToEdit.unit || '');
    } else {
      setName('');
      setDescription('');
      setIcon('CheckCircle');
      setColor('emerald');
      setType('boolean');
      setTargetValue(1);
      setUnit('');
    }
    setError('');
  }, [habitToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Por favor, indica un nombre para el hábito');
      return;
    }

    onSave({
      id: habitToEdit?.id,
      name: cleanName,
      description: description.trim(),
      icon,
      color,
      type,
      targetValue: type === 'numeric' ? Number(targetValue) || 1 : undefined,
      unit: type === 'numeric' ? unit.trim() || 'veces' : undefined,
      isDefault: habitToEdit ? habitToEdit.isDefault : false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {habitToEdit ? 'Editar Hábito' : 'Añadir Nuevo Hábito'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personaliza el nombre, métrica, icono y color
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Nombre del hábito *
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej. Estiramientos matutinos, Leer 20 páginas..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
              maxLength={40}
            />
            {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Descripción o motivación
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Para mejorar mi postura y relajarme"
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
              maxLength={80}
            />
          </div>

          {/* Tipo de hábito */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Tipo de seguimiento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('boolean')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  type === 'boolean'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Check Simple (Sí / No)
              </button>
              <button
                type="button"
                onClick={() => setType('numeric')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  type === 'numeric'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Cantidad Numérica
              </button>
            </div>
          </div>

          {/* Si es numérico */}
          {type === 'numeric' && (
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Meta objetivo
                </label>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 font-mono text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Unidad
                </label>
                <input
                  type="text"
                  placeholder="min, pasos, ml, vasos..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  maxLength={12}
                />
              </div>
            </div>
          )}

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Icono representativo
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700 rounded-xl">
              {AVAILABLE_ICONS.map((icName) => {
                const isSelected = icon === icName;
                return (
                  <button
                    key={icName}
                    type="button"
                    onClick={() => setIcon(icName)}
                    className={`h-10 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <HabitIcon name={icName} className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Color temático
            </label>
            <div className="flex items-center gap-2">
              {AVAILABLE_COLORS.map((col) => {
                const isSelected = color === col;
                const themeDef = COLOR_CLASSES[col];
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                      isSelected ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : 'opacity-80 hover:opacity-100'
                    } ${themeDef.activeBg}`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {habitToEdit ? 'Guardar Cambios' : 'Crear Hábito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
