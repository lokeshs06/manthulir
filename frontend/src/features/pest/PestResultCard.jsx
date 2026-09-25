import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  PhoneCall,
  Sparkles,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Building2,
  Send,
} from 'lucide-react';
import { PestRemedyCard } from './PestRemedyCard';
import { useSubmitPestFeedback } from '../../hooks/usePest';
import { getApiErrorMessage } from '../../lib/errorHandler';

export const PestResultCard = ({
  scanData,
  onResetScan,
  onRetry,
}) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const detection = scanData?.detection || scanData;
  const remedies = scanData?.remedies || (detection?.remedyIds || []);
  const resultType = detection?.resultType || 'confident';

  const submitFeedbackMutation = useSubmitPestFeedback();

  const [feedbackType, setFeedbackType] = useState(detection?.farmerFeedback || null);
  const [feedbackNote, setFeedbackNote] = useState(detection?.feedbackNote || '');
  const [isSubmitted, setIsSubmitted] = useState(Boolean(detection?.farmerFeedback));
  const [feedbackError, setFeedbackError] = useState(null);

  const handleFeedbackSubmit = async (selectedType) => {
    if (!detection?._id) return;
    setFeedbackType(selectedType);
    setFeedbackError(null);

    try {
      await submitFeedbackMutation.mutateAsync({
        id: detection._id,
        feedbackData: {
          farmerFeedback: selectedType,
          feedbackNote: feedbackNote.trim() || undefined,
        },
      });
      setIsSubmitted(true);
    } catch (err) {
      setFeedbackError(getApiErrorMessage(err));
    }
  };

  const confidencePct = detection?.topConfidence
    ? Math.round(detection.topConfidence * 100)
    : null;

  return (
    <div className="space-y-6">
      {/* Top Banner based on resultType */}
      {resultType === 'confident' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 mb-1">
                  🎯 {t('pests.resultConfident')}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-emerald-950">
                  {remedies[0]?.pestName || detection?.topLabel}
                </h2>
                {confidencePct !== null && (
                  <p className="text-xs text-emerald-800/90 mt-0.5">
                    {t('pests.confidence')}: <span className="font-bold">{confidencePct}%</span>
                  </p>
                )}
              </div>
            </div>

            {onResetScan && (
              <button
                type="button"
                onClick={onResetScan}
                className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isTa ? 'புதிய படம் எடுக்க' : 'Scan Another'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {resultType === 'uncertain' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 mb-1">
                  ⚠️ {t('pests.resultUncertain')}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-amber-950">
                  {isTa ? 'உறுதியான முடிவு கண்டறியப்படவில்லை' : 'Diagnosis Inconclusive'}
                </h2>
                <p className="text-xs text-amber-900/80 mt-0.5">
                  {isTa
                    ? 'AI மாதிரியால் துல்லியமாக உறுதிப்படுத்த முடியவில்லை. சாத்தியமான பொருத்தங்கள் கீழே காட்டப்பட்டுள்ளன.'
                    : 'The model confidence was below threshold. Potential candidate matches are listed below.'}
                </p>
              </div>
            </div>

            {onResetScan && (
              <button
                type="button"
                onClick={onResetScan}
                className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isTa ? 'மறுபடம் எடுக்க' : 'Retake Photo'}</span>
              </button>
            )}
          </div>

          {/* KVK / Extension Officer Contact Box */}
          <div className="p-4 rounded-xl bg-white/90 border border-amber-300 space-y-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs sm:text-sm">
              <Building2 className="w-4 h-4 text-amber-700" />
              <span>{t('pests.kvkAdviceTitle')}</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {scanData?.message ||
                (isTa
                  ? 'உறுதியான கண்டறிதலுக்கு, உங்கள் அருகிலுள்ள கிருஷி விஞ்ஞான் கேந்திரா (KVK) அல்லது வேளாண் விரிவாக்க அதிகாரியை தொடர்பு கொள்ளவும்.'
                  : 'For a confident diagnosis, please contact your nearest Krishi Vigyan Kendra (KVK) or agriculture extension officer.')}
            </p>
          </div>

          {/* Candidate Predictions List */}
          {detection?.predictions && detection.predictions.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-stone-900 mb-2">
                {t('pests.possibleCandidates')}:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {detection.predictions.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-stone-200 text-xs flex items-center justify-between"
                  >
                    <span className="font-semibold text-stone-800">
                      {p.label?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      {Math.round((p.confidence || 0) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {resultType === 'service-unavailable' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-xs space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 mx-auto flex items-center justify-center">
            <WifiOff className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-red-950 mb-1">
              {t('pests.resultUnavailable')}
            </h3>
            <p className="text-xs sm:text-sm text-red-800 max-w-lg mx-auto leading-relaxed">
              {isTa
                ? 'பூச்சி கண்டறிதல் சேவை தற்காலிகமாக செயல்படவில்லை. உங்கள் பயிர் மாதிரியை அருகிலுள்ள கிருஷி விஞ்ஞான் கேந்திரா (KVK) அல்லது வேளாண் விரிவாக்க அலுவலரிடம் காண்பிக்கவும்.'
                : 'Pest detection ML service is temporarily unavailable. Please contact your nearest Krishi Vigyan Kendra (KVK) or extension officer.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('pests.retryScan')}</span>
              </button>
            )}
            {onResetScan && (
              <button
                type="button"
                onClick={onResetScan}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 text-xs sm:text-sm font-semibold border border-stone-300 transition-colors cursor-pointer"
              >
                <span>{t('app.back')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Uploaded Crop Photo Preview */}
      {detection?.imageUrl && (
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <h4 className="text-xs font-bold text-stone-700 mb-2">
            {isTa ? 'பகுப்பாய்வு செய்யப்பட்ட படம்:' : 'Analyzed Crop Photo:'}
          </h4>
          <div className="max-w-md max-h-60 rounded-xl overflow-hidden bg-stone-100">
            <img
              src={detection.imageUrl}
              alt="Diagnosed crop"
              className="w-full h-full max-h-60 object-contain"
            />
          </div>
        </div>
      )}

      {/* Organic Remedies Display */}
      {remedies && remedies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-agri-700" />
            <span>{t('pests.treatments')}</span>
          </h3>

          <div className="space-y-5">
            {remedies.map((rem, rIdx) => (
              <PestRemedyCard key={rem._id || rIdx} remedy={rem} />
            ))}
          </div>
        </div>
      )}

      {/* Farmer Feedback Section */}
      {detection?._id && resultType !== 'service-unavailable' && (
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-agri-700" />
              <span>{t('pests.feedbackQuestion')}</span>
            </h4>
            {isSubmitted && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                ✓ {isTa ? 'கருத்து பதிவு செய்யப்பட்டது' : 'Feedback Recorded'}
              </span>
            )}
          </div>

          {!isSubmitted ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleFeedbackSubmit('correct')}
                  disabled={submitFeedbackMutation.isPending}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    feedbackType === 'correct'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white hover:bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{t('pests.feedbackCorrect')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFeedbackSubmit('incorrect')}
                  disabled={submitFeedbackMutation.isPending}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    feedbackType === 'incorrect'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white hover:bg-red-50 text-red-900 border-red-200'
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{t('pests.feedbackIncorrect')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFeedbackSubmit('unsure')}
                  disabled={submitFeedbackMutation.isPending}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    feedbackType === 'unsure'
                      ? 'bg-stone-700 text-white border-stone-700'
                      : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{t('pests.feedbackUnsure')}</span>
                </button>
              </div>

              {/* Optional note input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder={t('pests.feedbackNotePlaceholder')}
                  className="w-full text-xs border border-stone-300 rounded-xl px-3 py-2 bg-white"
                />
              </div>

              {feedbackError && (
                <p className="text-xs text-red-600 font-medium">
                  {feedbackError}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-stone-600 italic">
              {t('pests.feedbackSuccess')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
