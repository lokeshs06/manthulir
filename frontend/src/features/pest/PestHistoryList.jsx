import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  ChevronRight,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { useMyDetections } from '../../hooks/usePest';
import { PestResultCard } from './PestResultCard';

export const PestHistoryList = ({ onStartNewScan }) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const [page, setPage] = useState(1);
  const [selectedDetection, setSelectedDetection] = useState(null);

  const { data, isLoading, isError, refetch } = useMyDetections({ page, limit: 10 });

  const detections = data?.data || [];
  const pagination = data?.meta?.pagination;

  if (selectedDetection) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedDetection(null)}
          className="inline-flex items-center gap-1 text-xs font-bold text-agri-700 hover:text-agri-800 p-1 cursor-pointer"
        >
          ← {isTa ? 'வரலாற்றுப் பட்டியலுக்குத் திரும்பு' : 'Back to Scan History'}
        </button>
        <PestResultCard
          scanData={selectedDetection}
          onResetScan={() => setSelectedDetection(null)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-stone-200">
        <Loader2 className="w-8 h-8 text-agri-700 animate-spin mb-2" />
        <p className="text-xs text-stone-500">{t('app.loading')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
        <p className="text-xs sm:text-sm text-red-700">
          {isTa ? 'முந்தைய தகவல்களை ஏற்றுவதில் பிழை ஏற்பட்டது.' : 'Failed to load past detections.'}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-red-800 cursor-pointer"
        >
          {t('app.retry')}
        </button>
      </div>
    );
  }

  if (detections.length === 0) {
    return (
      <div className="py-16 px-4 bg-white rounded-2xl border border-stone-200 text-center space-y-4 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-base font-bold text-stone-900 mb-1">
            {isTa ? 'முந்தைய கண்டறிதல்கள் எதுவும் இல்லை' : 'No Past Detections'}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed mb-4">
            {t('pests.noDetections')}
          </p>
          {onStartNewScan && (
            <button
              type="button"
              onClick={onStartNewScan}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('pests.tabNewScan')}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const getResultBadge = (type) => {
    switch (type) {
      case 'confident':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{t('pests.resultConfident')}</span>
          </span>
        );
      case 'uncertain':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>{t('pests.resultUncertain')}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
            <WifiOff className="w-3 h-3 text-red-600" />
            <span>{t('pests.resultUnavailable')}</span>
          </span>
        );
    }
  };

  const getFeedbackIcon = (feedback) => {
    switch (feedback) {
      case 'correct':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
            <ThumbsUp className="w-3 h-3" />
            <span>{t('pests.feedbackCorrect')}</span>
          </span>
        );
      case 'incorrect':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600">
            <ThumbsDown className="w-3 h-3" />
            <span>{t('pests.feedbackIncorrect')}</span>
          </span>
        );
      case 'unsure':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500">
            <HelpCircle className="w-3 h-3" />
            <span>{t('pests.feedbackUnsure')}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {detections.map((item) => {
          const dateStr = new Date(item.createdAt).toLocaleDateString(
            isTa ? 'ta-IN' : 'en-US',
            { year: 'numeric', month: 'short', day: 'numeric' }
          );

          return (
            <div
              key={item._id}
              onClick={() => setSelectedDetection(item)}
              className="bg-white rounded-2xl border border-stone-200 hover:border-agri-400 p-4 transition-all shadow-xs flex items-center gap-3 sm:gap-4 cursor-pointer group"
            >
              {/* Photo Thumbnail */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt="Scan thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <Sparkles className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* Diagnosis Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {getResultBadge(item.resultType)}
                  <span className="text-[11px] text-stone-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{dateStr}</span>
                  </span>
                </div>

                <h4 className="font-bold text-stone-900 text-sm truncate">
                  {item.topLabel
                    ? item.topLabel.replace(/_/g, ' ')
                    : (isTa ? 'கண்டறிதல் முயற்சி' : 'Diagnosis Attempt')}
                </h4>

                <div className="flex items-center gap-3 mt-1 text-xs">
                  {item.topConfidence && (
                    <span className="text-stone-600 text-[11px]">
                      {t('pests.confidence')}:{' '}
                      <strong>{Math.round(item.topConfidence * 100)}%</strong>
                    </span>
                  )}
                  {getFeedbackIcon(item.farmerFeedback)}
                </div>
              </div>

              {/* Arrow action */}
              <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-agri-600 transition-colors shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
          >
            ← {t('app.back')}
          </button>
          <span className="text-xs text-stone-600">
            {page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-40 cursor-pointer"
          >
            {t('app.next')} →
          </button>
        </div>
      )}
    </div>
  );
};
