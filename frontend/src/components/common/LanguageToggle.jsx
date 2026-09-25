import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export const LanguageToggle = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language === 'en' ? 'en' : 'ta';

  const toggleLang = () => {
    const nextLang = currentLang === 'ta' ? 'en' : 'ta';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      type="button"
      onClick={toggleLang}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-colors min-h-touch ${
        currentLang === 'ta'
          ? 'bg-agri-100 text-agri-900 border-agri-300 hover:bg-agri-200'
          : 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200'
      } ${className}`}
      title={currentLang === 'ta' ? 'Switch to English' : 'தமிழுக்கு மாறவும்'}
      aria-label="Toggle language"
    >
      <Languages className="w-4 h-4 text-agri-700" />
      <span>{currentLang === 'ta' ? 'தமிழ்' : 'English'}</span>
    </button>
  );
};
