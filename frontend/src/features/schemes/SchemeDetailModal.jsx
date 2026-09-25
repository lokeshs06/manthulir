import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import {
  useSaveScheme,
  useUnsaveScheme,
  useApplyScheme,
  useUpdateSchemeStatus,
} from '../../hooks/useFarmer';
import { UnverifiedNotice } from '../../components/common/UnverifiedNotice';
import {
  X,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  FileCheck,
  Building,
  Check,
  AlertCircle,
} from 'lucide-react';

export const SchemeDetailModal = ({ scheme, isSaved, isApplied, applicationStatus, onClose }) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const isTa = i18n.language === 'ta';

  const isFarmer = isAuthenticated && user?.role === 'farmer';

  const saveMutation = useSaveScheme();
  const unsaveMutation = useUnsaveScheme();
  const applyMutation = useApplyScheme();
  const statusMutation = useUpdateSchemeStatus();

  if (!scheme) return null;

  const title = (isTa && scheme.nameTa) ? scheme.nameTa : scheme.name;
  const description = (isTa && scheme.descriptionTa) ? scheme.descriptionTa : scheme.description;

  const handleToggleSave = () => {
    if (isSaved) {
      unsaveMutation.mutate(scheme._id);
    } else {
      saveMutation.mutate(scheme._id);
    }
  };

  const handleApply = () => {
    applyMutation.mutate(scheme._id);
  };

  const handleStatusChange = (newStatus) => {
    statusMutation.mutate({ schemeId: scheme._id, status: newStatus });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 bg-stone-50 flex items-start justify-between gap-4 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  scheme.level === 'state'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {scheme.level === 'state'
                  ? isTa
                    ? 'மாநில அரசுத் திட்டம்'
                    : 'State Govt Scheme'
                  : isTa
                  ? 'மத்திய அரசுத் திட்டம்'
                  : 'Central Govt Scheme'}
              </span>
              {scheme.department && (
                <span className="text-xs text-stone-500 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  <span>{scheme.department}</span>
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
              {title}
            </h2>
            {isTa && scheme.nameTa && scheme.name && (
              <p className="text-xs text-stone-500 mt-0.5 font-medium">{scheme.name}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors shrink-0 min-h-touch min-w-touch flex items-center justify-center"
            aria-label={t('app.close')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Verification Notice */}
          <UnverifiedNotice verified={scheme.verified} lastVerifiedAt={scheme.lastVerifiedAt} />

          {/* Description */}
          {description && (
            <div>
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                {isTa ? 'திட்ட விளக்கம்' : 'Scheme Description'}
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                {description}
              </p>
            </div>
          )}

          {/* Benefits Breakdown */}
          {scheme.benefits && scheme.benefits.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                {isTa ? 'வழங்கப்படும் நன்மைகள் & மானியங்கள்' : 'Benefits & Subsidies'}
              </h3>
              <div className="space-y-2">
                {scheme.benefits.map((b, idx) => {
                  const bDesc = (isTa && b.descriptionTa) ? b.descriptionTa : b.description;
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-agri-200 bg-agri-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-agri-800 bg-agri-100 px-2 py-0.5 rounded mr-2">
                          {b.type}
                        </span>
                        <span className="text-xs font-medium text-stone-800">{bDesc}</span>
                      </div>
                      {b.amount && (
                        <div className="text-right sm:shrink-0">
                          <span className="text-xs font-bold text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-stone-200 inline-block">
                            {b.amount} {b.unit ? `(${b.unit})` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Eligibility Criteria */}
          {scheme.eligibility && (
            <div>
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                {isTa ? 'தகுதி வரம்புகள்' : 'Eligibility Criteria'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <span className="text-stone-500">{isTa ? 'மாவட்டங்கள்:' : 'Districts:'}</span>{' '}
                  <span className="font-semibold text-stone-800">
                    {scheme.eligibility.districts?.length
                      ? scheme.eligibility.districts.join(', ')
                      : isTa
                      ? 'அனைத்து மாவட்டங்களும்'
                      : 'All Districts'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">{isTa ? 'நில அளவு:' : 'Land Size:'}</span>{' '}
                  <span className="font-semibold text-stone-800">
                    {scheme.eligibility.minLandAcres || 0} -{' '}
                    {scheme.eligibility.maxLandAcres ? `${scheme.eligibility.maxLandAcres} acres` : 'எல்லை இல்லை'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">{isTa ? 'பயிர்கள்:' : 'Crops:'}</span>{' '}
                  <span className="font-semibold text-stone-800">
                    {scheme.eligibility.cropTypes?.length
                      ? scheme.eligibility.cropTypes.join(', ')
                      : isTa
                      ? 'அனைத்து பயிர்களும்'
                      : 'All Crops'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">{isTa ? 'குழு தேவை:' : 'Cluster Required:'}</span>{' '}
                  <span className="font-semibold text-stone-800">
                    {scheme.eligibility.requiresCluster
                      ? isTa
                        ? `ஆம் (குறைந்தது ${scheme.eligibility.minClusterMembers} விவசாயிகள்)`
                        : `Yes (min ${scheme.eligibility.minClusterMembers} farmers)`
                      : isTa
                      ? 'இல்லை (தனிநபர்)'
                      : 'No (Individual)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Documents Required */}
          {scheme.documentsRequired && scheme.documentsRequired.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                {isTa ? 'தேவைப்படும் ஆவணங்கள்' : 'Documents Required'}
              </h3>
              <ul className="space-y-1.5 text-xs text-stone-700">
                {scheme.documentsRequired.map((doc, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-agri-600 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Application Steps */}
          {scheme.applicationSteps && scheme.applicationSteps.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                {isTa ? 'விண்ணப்பிக்கும் வழிமுறைகள்' : 'How to Apply'}
              </h3>
              <ol className="space-y-2 text-xs text-stone-700">
                {scheme.applicationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                    <span className="w-5 h-5 rounded-full bg-agri-700 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Official Links */}
          <div className="flex flex-wrap gap-2 pt-2">
            {scheme.applicationLink && (
              <a
                href={scheme.applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-semibold shadow-xs min-h-touch"
              >
                <span>{isTa ? 'அதிகாரப்பூர்வ விண்ணப்ப தளம்' : 'Official Application Portal'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {scheme.sourceUrl && (
              <a
                href={scheme.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-200 min-h-touch"
              >
                <span>{isTa ? 'அரசாணை / ஆதாரம்' : 'Source Document'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Modal Footer Actions (Farmer specific) */}
        {isFarmer && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSave}
                disabled={saveMutation.isPending || unsaveMutation.isPending}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors min-h-touch ${
                  isSaved
                    ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-700" /> : <Bookmark className="w-4 h-4" />}
                <span>
                  {isSaved
                    ? isTa
                      ? 'சேமிக்கப்பட்டது'
                      : 'Saved'
                    : isTa
                    ? 'பிற்காலத்திற்கு சேமி'
                    : 'Save for later'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {isApplied ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>
                      {isTa ? 'விண்ணப்பிக்கப்பட்டது' : 'Applied'}: {applicationStatus || 'applied'}
                    </span>
                  </span>
                  <select
                    value={applicationStatus || 'applied'}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-xs border border-stone-300 rounded-xl px-2 py-1.5 bg-white font-medium text-stone-700"
                    title="Update Status"
                  >
                    <option value="applied">{isTa ? 'விண்ணப்பிக்கப்பட்டது' : 'Applied'}</option>
                    <option value="approved">{isTa ? 'அங்கீகரிக்கப்பட்டது' : 'Approved'}</option>
                    <option value="rejected">{isTa ? 'நிராகரிக்கப்பட்டது' : 'Rejected'}</option>
                  </select>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applyMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 transition-colors shadow-xs min-h-touch"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>
                    {applyMutation.isPending
                      ? t('app.saving')
                      : isTa
                      ? 'விண்ணப்பித்ததாகப் பதிவு செய்'
                      : 'Mark as Applied'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
