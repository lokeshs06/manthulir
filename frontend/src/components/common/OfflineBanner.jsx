import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="bg-amber-600 text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-center gap-2 shadow-sm sticky top-0 z-50 animate-pulse"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>{t('app.offlineNotice')}</span>
    </div>
  );
};
