import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTimeline, useStartTransition, useFarmerProfile } from '../../hooks/useFarmer';
import { MilestoneCard } from '../../features/timeline/MilestoneCard';
import { SchemeDetailModal } from '../../features/schemes/SchemeDetailModal';
import { getApiErrorMessage } from '../../lib/errorHandler';
import {
  Calendar,
  Sprout,
  Play,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const FarmerTimelinePage = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const { data: profile } = useFarmerProfile();
  const { data: milestones, isLoading, isError, error, refetch } = useTimeline();
  const startMutation = useStartTransition();

  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedSchemeData, setSelectedSchemeData] = useState(null);

  const handleStartTransition = async (e) => {
    e.preventDefault();
    try {
      await startMutation.mutateAsync(startDate);
      setShowStartModal(false);
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-agri-700 animate-spin mb-3" />
        <p className="text-sm font-medium text-stone-600">{t('app.loading')}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-red-800">{getApiErrorMessage(error)}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
        >
          {t('app.retry')}
        </button>
      </div>
    );
  }

  const hasStarted = milestones && milestones.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-agri-800 to-agri-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-agri-200 text-xs font-semibold mb-2 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isTa ? 'இயற்கை வேளாண்மை 3 ஆண்டு திட்டம்' : '3-Year Natural Farming Journey'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isTa ? 'இயற்கை மாற்ற காலவரிசை' : 'Transition Timeline'}
            </h1>
            <p className="text-xs sm:text-sm text-agri-100 mt-1 max-w-xl">
              {isTa
                ? 'மாதம் 0 முதல் 36 வரையிலான மைல்கற்கள், வழிகாட்டல்கள் மற்றும் திட்ட மானியங்கள்.'
                : 'Step-by-step milestones (months 0, 6, 12, 24, 36) tailored to soil recovery and bio-inputs.'}
            </p>
          </div>

          {!hasStarted && (
            <button
              type="button"
              onClick={() => setShowStartModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm shadow-md transition-all self-start sm:self-center min-h-touch"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isTa ? 'மாற்றத்தைத் தொடங்கு' : 'Start Transition'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Start Transition Prompt if not started */}
      {!hasStarted && (
        <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Sprout className="w-8 h-8 text-amber-700" />
          </div>
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-bold text-stone-900">
              {isTa ? 'உங்கள் இயற்கை விவசாயப் பயணத்தைத் தொடங்குங்கள்' : 'Begin Your Transition Journey'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              {isTa
                ? 'உங்கள் மாற்றத் தொடக்க தேதியைப் பதிவு செய்து 5 மைல்கற்களை உருவாக்கி, அரசு மானியங்களைப் பெறுங்கள்.'
                : 'Generate your 5 milestone checkpoints (months 0/6/12/24/36) linked with government subsidy schemes.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowStartModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-sm transition-all min-h-touch"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isTa ? 'தற்போது தொடங்குங்கள்' : 'Start My Timeline'}</span>
          </button>
        </div>
      )}

      {/* Timeline Stepper View */}
      {hasStarted && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs">
          <div className="space-y-2">
            {milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.monthMark}
                milestone={milestone}
                onSelectScheme={(scheme, isSaved, isApplied, applicationStatus) => {
                  setSelectedSchemeData({ scheme, isSaved, isApplied, applicationStatus });
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Start Transition Dialog Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-stone-900">
                  {isTa ? 'மாற்றத் தொடக்க தேதி' : 'Transition Start Date'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {isTa
                ? 'இரசாயன உரங்களை நிறுத்தி இயற்கை விவசாயத்தைத் தொடங்கிய தேதியை உள்ளிடவும்.'
                : 'Select the date you ceased chemical inputs and began natural farming practices.'}
            </p>

            <form onSubmit={handleStartTransition} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {isTa ? 'தொடக்க தேதி' : 'Start Date'}
                </label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full text-sm font-medium border border-stone-300 rounded-xl px-3.5 py-3 bg-stone-50 focus:bg-white min-h-touch"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 min-h-touch"
                >
                  {t('app.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={startMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold shadow-sm transition-all min-h-touch disabled:opacity-60"
                >
                  {startMutation.isPending
                    ? t('app.saving')
                    : isTa
                    ? 'உறுதி செய்'
                    : 'Confirm & Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scheme Detail Modal */}
      {selectedSchemeData && (
        <SchemeDetailModal
          scheme={selectedSchemeData.scheme}
          isSaved={selectedSchemeData.isSaved}
          isApplied={selectedSchemeData.isApplied}
          applicationStatus={selectedSchemeData.applicationStatus}
          onClose={() => setSelectedSchemeData(null)}
        />
      )}
    </div>
  );
};
