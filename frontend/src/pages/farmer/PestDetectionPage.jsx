import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bug,
  Camera,
  History,
  Sparkles,
  Quote,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { PestPhotoUploader } from '../../features/pest/PestPhotoUploader';
import { PestResultCard } from '../../features/pest/PestResultCard';
import { PestHistoryList } from '../../features/pest/PestHistoryList';

export const PestDetectionPage = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'history'
  const [currentScanResult, setCurrentScanResult] = useState(null);

  const handleScanComplete = (resultData) => {
    setCurrentScanResult(resultData);
    setActiveTab('scan');
  };

  const handleResetScan = () => {
    setCurrentScanResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-agri-900 via-agri-800 to-agri-950 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-700/60 border border-agri-600/60 text-xs font-semibold text-agri-200 backdrop-blur-xs">
            <Bug className="w-3.5 h-3.5 text-agri-300" />
            <span>{t('pests.scanTitle')}</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            {isTa ? 'இயற்கை பூச்சி & நோய் பாதுகாப்பு' : 'Natural Pest & Disease Defense'}
          </h1>

          <p className="text-xs sm:text-sm text-agri-100/90 leading-relaxed">
            {t('pests.scanSubtitle')}
          </p>
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-agri-600/20 blur-2xl pointer-events-none" />
      </div>

      {/* Nammalvar Wisdom Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 shadow-2xs">
        <Quote className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm italic text-amber-950 leading-relaxed">
          {t('pests.quote')}
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex rounded-2xl p-1 bg-stone-200/80 max-w-sm">
        <button
          type="button"
          onClick={() => {
            setActiveTab('scan');
          }}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'scan'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{t('pests.tabNewScan')}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('history');
          }}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{t('pests.tabHistory')}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'scan' ? (
        currentScanResult ? (
          <PestResultCard
            scanData={currentScanResult}
            onResetScan={handleResetScan}
            onRetry={handleResetScan}
          />
        ) : (
          <PestPhotoUploader
            onScanComplete={handleScanComplete}
            onScanError={(err) => {
              // If service is unavailable (503), construct a service-unavailable scan data to show result card
              if (err?.response?.status === 503 || err?.code === 'ML_SERVICE_UNAVAILABLE') {
                setCurrentScanResult({
                  detection: {
                    resultType: 'service-unavailable',
                    predictions: [],
                  },
                  message: err?.response?.data?.error?.message,
                });
              }
            }}
          />
        )
      ) : (
        <PestHistoryList
          onStartNewScan={() => {
            setCurrentScanResult(null);
            setActiveTab('scan');
          }}
        />
      )}
    </div>
  );
};
