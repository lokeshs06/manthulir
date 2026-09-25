import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Award, Clock, AlertCircle } from 'lucide-react';

export const BadgeTile = ({
  level,
  badge,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const { t } = useTranslation();
  const currentLevel = level || badge || 'none';

  const configs = {
    gold: {
      label: t('badges.gold'),
      icon: '🥇',
      bg: 'bg-yellow-50 text-yellow-900 border-yellow-300',
      iconBg: 'bg-yellow-500 text-white',
    },
    silver: {
      label: t('badges.silver'),
      icon: '🥈',
      bg: 'bg-slate-100 text-slate-900 border-slate-300',
      iconBg: 'bg-slate-500 text-white',
    },
    bronze: {
      label: t('badges.bronze'),
      icon: '🥉',
      bg: 'bg-amber-50 text-amber-900 border-amber-300',
      iconBg: 'bg-amber-600 text-white',
    },
    certified: {
      label: t('badges.certified'),
      icon: '🌿',
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      iconBg: 'bg-emerald-600 text-white',
    },
    in_progress: {
      label: t('badges.in_progress'),
      icon: '🌱',
      bg: 'bg-green-50 text-green-900 border-green-200',
      iconBg: 'bg-green-500 text-white',
    },
    none: {
      label: t('badges.none'),
      icon: '⏳',
      bg: 'bg-stone-100 text-stone-700 border-stone-200',
      iconBg: 'bg-stone-400 text-white',
    },
  };

  const key = currentLevel?.toLowerCase().replace('-', '_') || 'none';
  const config = configs[key] || configs.none;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-sm md:text-base px-3 py-1.5 gap-2 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border shadow-2xs select-none ${config.bg} ${sizeClasses[size]} ${className}`}
      title={config.label}
    >
      <span className="text-base leading-none" aria-hidden="true">
        {config.icon}
      </span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
