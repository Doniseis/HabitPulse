import React from 'react';
import {
  BookOpen,
  Pill,
  Droplets,
  Apple,
  Dumbbell,
  Footprints,
  Sparkles,
  Heart,
  Flame,
  Sun,
  Moon,
  Coffee,
  Shield,
  Target,
  Smile,
  Activity,
  Bed,
  CheckCircle,
  LucideIcon,
} from 'lucide-react';
import { HabitColor } from '../types';

export const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Pill,
  Droplets,
  Apple,
  Dumbbell,
  Footprints,
  Sparkles,
  Heart,
  Flame,
  Sun,
  Moon,
  Coffee,
  Shield,
  Target,
  Smile,
  Activity,
  Bed,
  CheckCircle,
};

export const COLOR_CLASSES: Record<
  HabitColor,
  {
    bg: string;
    text: string;
    border: string;
    activeBg: string;
    badgeBg: string;
    gradient: string;
  }
> = {
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    activeBg: 'bg-emerald-500 text-white',
    badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    gradient: 'from-emerald-500 to-teal-600',
  },
  blue: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
    activeBg: 'bg-blue-500 text-white',
    badgeBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    gradient: 'from-blue-500 to-cyan-600',
  },
  indigo: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    activeBg: 'bg-indigo-500 text-white',
    badgeBg: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
    gradient: 'from-indigo-500 to-purple-600',
  },
  violet: {
    bg: 'bg-violet-500/10 dark:bg-violet-500/20',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500/30',
    activeBg: 'bg-violet-500 text-white',
    badgeBg: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
    gradient: 'from-violet-500 to-fuchsia-600',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    activeBg: 'bg-amber-500 text-white',
    badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    gradient: 'from-amber-500 to-orange-600',
  },
  rose: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    activeBg: 'bg-rose-500 text-white',
    badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    gradient: 'from-rose-500 to-red-600',
  },
  cyan: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/30',
    activeBg: 'bg-cyan-500 text-white',
    badgeBg: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
    gradient: 'from-cyan-500 to-blue-600',
  },
};

interface HabitIconProps {
  name: string;
  className?: string;
  color?: HabitColor;
}

export const HabitIcon: React.FC<HabitIconProps> = ({ name, className = 'w-5 h-5', color }) => {
  const IconComponent = ICON_MAP[name] || Activity;
  const colorClass = color ? COLOR_CLASSES[color]?.text : '';
  return <IconComponent className={`${className} ${colorClass}`} />;
};
