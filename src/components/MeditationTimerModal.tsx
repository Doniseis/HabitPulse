import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Check, Wind, Sparkles } from 'lucide-react';

interface MeditationTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const TOTAL_SECONDS = 300; // 5 minutes

export const MeditationTimerModal: React.FC<MeditationTimerModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [isActive, setIsActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhala' | 'Retén' | 'Exhala'>('Inhala');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, onComplete]);

  // Breathing cycle animation (4s inhale, 4s hold, 4s exhale)
  useEffect(() => {
    if (!isActive) return;
    const cycle = (TOTAL_SECONDS - secondsLeft) % 12;
    if (cycle < 4) {
      setBreathPhase('Inhala');
    } else if (cycle < 8) {
      setBreathPhase('Retén');
    } else {
      setBreathPhase('Exhala');
    }
  }, [secondsLeft, isActive]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100;

  const handleReset = () => {
    setIsActive(false);
    setSecondsLeft(TOTAL_SECONDS);
  };

  const handleFinishEarly = () => {
    setIsActive(false);
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-1">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Pausa Consciente</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          5 Minutos de Meditación
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px]">
          Desconecta del ruido, relaja los hombros y sigue la guía de respiración.
        </p>

        {/* Central Breathing Ring */}
        <div className="relative my-8 flex items-center justify-center">
          {/* Animated breath pulse aura */}
          <div
            className={`absolute w-44 h-44 rounded-full transition-all duration-1000 ${
              breathPhase === 'Inhala'
                ? 'scale-110 bg-violet-500/20'
                : breathPhase === 'Retén'
                ? 'scale-105 bg-violet-500/25'
                : 'scale-90 bg-violet-500/10'
            }`}
          />

          <svg className="w-48 h-48 -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="84"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="96"
              cy="96"
              r="84"
              className="stroke-violet-500 transition-all duration-300"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 84}
              strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center text */}
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
              <Wind className="w-3.5 h-3.5" />
              <span>{isActive ? breathPhase : 'Listo para empezar'}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full justify-center">
          <button
            onClick={handleReset}
            className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
            title="Reiniciar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className="flex-1 max-w-[150px] h-12 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-600/20 active:scale-95"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{secondsLeft === TOTAL_SECONDS ? 'Comenzar' : 'Reanudar'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleFinishEarly}
            className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 flex items-center justify-center transition-colors"
            title="Marcar como completado"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
