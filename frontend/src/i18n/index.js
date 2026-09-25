import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ta from './loc/ta.json';
import en from './loc/en.json';

const resources = {
  ta: { translation: ta },
  en: { translation: en }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ta',
    lng: localStorage.getItem('manthulir_lang') || 'ta', // Tamil-first default!
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'manthulir_lang',
      caches: ['localStorage']
    }
  });

// Keep html lang attribute in sync
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language || 'ta';
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
    try {
      localStorage.setItem('manthulir_lang', lng);
    } catch {
      // ignore
    }
  });
}

export default i18n;
