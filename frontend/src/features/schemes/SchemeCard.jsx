import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSaveScheme, useUnsaveScheme, useApplyScheme } from '../../hooks/useFarmer';
import { UnverifiedNotice } from '../../components/common/UnverifiedNotice';
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  Building,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const SchemeCard = ({
  scheme,
  isSaved = false,
  isApplied = false,
  applicationStatus,
  onSelect,
  matchedReasons = [],
  unmetCriteria = [],
}) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const isTa = i18n.language === 'ta';
  const isFarmer = isAuthenticated && user?.role === 'farmer';

  const saveMutation = useSaveScheme();
  const unsaveMutation = useUnsaveScheme();
  const applyMutation = useApplyScheme();

  const title = (isTa && scheme.nameTa) ? scheme.nameTa : scheme.name;
  const description = (isTa && scheme.descriptionTa) ? scheme.descriptionTa : scheme.description;

  const handleSaveToggle = (e) => {
    e.stopPropagation();
    if (isSaved) {
      unsaveMutation.mutate(scheme._id);
    } else {
      saveMutation.mutate(scheme._id);
    }
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
    applyMutation.mutate(scheme._id);
  };

  return (
    <div
      onClick={() => onSelect && onSelect(scheme)}
      className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md hover:border-agri-400 transition-all flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Level badge and Save button */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                scheme.level === 'state'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {scheme.level === 'state'
                ? isTa
                  ? 'மாநிலத் திட்டம்'
                  : 'State'
                : isTa
                ? 'மத்தியத் திட்டம்'
                : 'Central'}
            </span>
            {scheme.department && (
              <span className="text-[11px] text-stone-500 truncate max-w-[180px]">
                {scheme.department}
              </span>
            )}
          </div>

          {isFarmer && (
            <button
              type="button"
              onClick={handleSaveToggle}
              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title={isSaved ? 'Saved' : 'Save'}
              aria-label="Save Scheme"
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-amber-600 fill-amber-100" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-stone-900 group-hover:text-agri-800 transition-colors line-clamp-2 leading-snug">
          {title}
        </h3>

        {/* Unverified Warning if false */}
        {!scheme.verified && (
          <div className="mt-2.5">
            <UnverifiedNotice verified={false} lastVerifiedAt={scheme.lastVerifiedAt} />
          </div>
        )}

        {/* Matched Reasons or Unmet Criteria badges if present */}
        {matchedReasons.length > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-agri-50 border border-agri-200">
            <span className="text-[11px] font-bold text-agri-900 flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-agri-700" />
              <span>{isTa ? 'பொருத்தமான காரணங்கள்:' : 'Why you qualify:'}</span>
            </span>
            <ul className="text-[11px] text-agri-800 space-y-0.5">
              {matchedReasons.slice(0, 2).map((r, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="text-agri-600 font-bold">✓</span>
                  <span>{r}</span>
                </li>
              ))}
              {matchedReasons.length > 2 && (
                <li className="text-[10px] text-agri-600 font-medium">
                  +{matchedReasons.length - 2} {isTa ? 'மேலும் காரணங்கள்' : 'more reasons'}
                </li>
              )}
            </ul>
          </div>
        )}

        {unmetCriteria.length > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-900 mb-1 block">
              {isTa ? 'பூர்த்தி செய்ய வேண்டியவை:' : 'Missing criteria:'}
            </span>
            <ul className="text-[11px] text-amber-800 space-y-0.5">
              {unmetCriteria.slice(0, 2).map((c, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="text-amber-600 font-bold">!</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Brief description */}
        {description && (
          <p className="text-xs text-stone-600 line-clamp-2 mt-2.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isApplied && (
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTa ? 'விண்ணப்பிக்கப்பட்டது' : 'Applied'}</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelect && onSelect(scheme)}
          className="inline-flex items-center gap-1 text-xs font-bold text-agri-700 group-hover:text-agri-900 group-hover:translate-x-0.5 transition-all ml-auto min-h-touch"
        >
          <span>{isTa ? 'விவரங்கள்' : 'View Details'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
