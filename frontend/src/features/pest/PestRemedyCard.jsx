import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react';

export const PestRemedyCard = ({ remedy, showSymptoms = true }) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  if (!remedy) return null;

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
            🚨 {isTa ? 'தீவிரம்: அதிகம்' : 'High Severity'}
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            ⚠️ {isTa ? 'தீவிரம்: நடுத்தரம்' : 'Medium Severity'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            🌱 {isTa ? 'தீவிரம்: குறைவு' : 'Low Severity'}
          </span>
        );
    }
  };

  const getProblemTypeLabel = (type) => {
    switch (type) {
      case 'insect':
        return isTa ? 'பூச்சி தாக்குதல்' : 'Insect Pest';
      case 'disease':
        return isTa ? 'பயிர் நோய்' : 'Plant Disease';
      case 'deficiency':
        return isTa ? 'சத்து குறைபாடு' : 'Nutrient Deficiency';
      default:
        return type;
    }
  };

  const treatments = remedy.organicTreatments || [];
  const preventive = remedy.preventiveMeasures || [];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700">
              {getProblemTypeLabel(remedy.problemType)}
            </span>
            {getSeverityBadge(remedy.severity)}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-stone-900">
            {remedy.pestName}
          </h3>
          {remedy.scientificName && (
            <p className="text-xs italic text-stone-500 font-serif">
              {remedy.scientificName}
            </p>
          )}
        </div>

        {/* Unverified Expert Notice */}
        {!remedy.reviewedByExpert && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{t('pests.unverifiedRemedyNotice')}</span>
          </div>
        )}
      </div>

      {/* Symptoms */}
      {showSymptoms && remedy.symptoms && (
        <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60">
          <h4 className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>{t('pests.symptoms')}</span>
          </h4>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            {remedy.symptoms}
          </p>
        </div>
      )}

      {/* Non-chemical Organic Treatments */}
      <div>
        <h4 className="text-sm font-bold text-agri-950 mb-3 flex items-center gap-2">
          <Leaf className="w-4 h-4 text-agri-700" />
          <span>{t('pests.treatments')}</span>
          <span className="text-[11px] font-normal text-agri-700 bg-agri-100 px-2 py-0.5 rounded-full">
            {isTa ? '100% இயற்கை முறைகள் மட்டும்' : '100% Non-chemical Organic only'}
          </span>
        </h4>

        {treatments.length === 0 ? (
          <p className="text-xs text-stone-500 italic">
            {isTa ? 'நிவாரண முறைகள் எதுவும் பதிவு செய்யப்படவில்லை.' : 'No treatments listed yet.'}
          </p>
        ) : (
          <div className="space-y-4">
            {treatments.map((treatment, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-agri-200 bg-agri-50/40 space-y-3"
              >
                {/* Treatment Method Title */}
                <div className="flex items-center gap-2 font-bold text-stone-900 text-xs sm:text-sm">
                  <span className="w-5 h-5 rounded-full bg-agri-600 text-white flex items-center justify-center text-[11px]">
                    {idx + 1}
                  </span>
                  <span>{treatment.method}</span>
                </div>

                {/* Ingredients needed */}
                {treatment.ingredients && treatment.ingredients.length > 0 && (
                  <div className="text-xs">
                    <span className="font-semibold text-stone-700 block mb-1">
                      {t('pests.ingredients')}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {treatment.ingredients.map((ing, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 text-[11px]"
                        >
                          <CheckCircle2 className="w-3 h-3 text-agri-600" />
                          <span>{ing}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step-by-step preparation */}
                {treatment.preparationSteps && treatment.preparationSteps.length > 0 && (
                  <div className="text-xs space-y-1.5 pt-1">
                    <span className="font-semibold text-stone-800 block">
                      {t('pests.treatmentSteps')}:
                    </span>
                    <ol className="space-y-1.5 pl-1">
                      {treatment.preparationSteps.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2 text-stone-700 leading-relaxed">
                          <ChevronRight className="w-3.5 h-3.5 text-agri-700 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Frequency & Precautions */}
                {(treatment.applicationFrequency || treatment.precautions) && (
                  <div className="pt-2 border-t border-agri-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {treatment.applicationFrequency && (
                      <div className="flex items-start gap-1.5 text-stone-600">
                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>{t('pests.frequency')}:</strong> {treatment.applicationFrequency}
                        </span>
                      </div>
                    )}
                    {treatment.precautions && (
                      <div className="flex items-start gap-1.5 text-stone-600">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>{t('pests.precautions')}:</strong> {treatment.precautions}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preventive Measures */}
      {preventive.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-bold text-stone-900 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-agri-700" />
            <span>{t('pests.preventive')}</span>
          </h4>
          <ul className="space-y-1 text-xs text-stone-600">
            {preventive.map((measure, mIdx) => (
              <li key={mIdx} className="flex items-start gap-2">
                <span className="text-agri-600 font-bold">•</span>
                <span>{measure}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
