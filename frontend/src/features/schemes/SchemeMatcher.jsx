import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useMatchedSchemes } from '../../hooks/useSchemes';
import { SchemeCard } from './SchemeCard';
import { TN_DISTRICTS, TN_DISTRICTS_TA, COMMON_CROPS } from '../../config/constants';
import { CheckCircle, AlertCircle, Sparkles, Filter, Loader2, ArrowRight } from 'lucide-react';

export const SchemeMatcher = ({ onSelectScheme }) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, profile } = useAuth();
  const isTa = i18n.language === 'ta';

  const [activeTab, setActiveTab] = useState('eligible'); // 'eligible' | 'nearMatches'

  // Anonymous / Override Filters
  const [district, setDistrict] = useState(profile?.district || '');
  const [landSizeAcres, setLandSizeAcres] = useState(profile?.landSizeAcres || '');
  const [crop, setCrop] = useState(profile?.cropTypes?.[0] || '');

  const queryParams = {};
  if (district) queryParams.district = district;
  if (landSizeAcres) queryParams.landSizeAcres = Number(landSizeAcres);
  if (crop) queryParams.crop = crop;

  const { data, isLoading, isError, refetch } = useMatchedSchemes(queryParams);

  const eligibleSchemes = data?.eligible || [];
  const nearMatches = data?.nearMatches || [];

  return (
    <div className="space-y-6">
      {/* Anonymous Filter Bar / Override */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3 text-stone-900 font-bold text-sm">
          <Filter className="w-4 h-4 text-agri-700" />
          <span>
            {isAuthenticated
              ? isTa
                ? 'உங்கள் சுயவிவர அடிப்படையிலான திட்டம் பொருத்துதல்'
                : 'Personalized Eligibility Matcher'
              : isTa
              ? 'சுயவிவர விவரங்களை உள்ளிட்டு தகுதி பாருங்கள்'
              : 'Enter parameters to check scheme eligibility'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* District Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              {isTa ? 'மாவட்டம்' : 'District'}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full text-xs font-medium border border-stone-300 rounded-xl px-3 py-2.5 bg-stone-50/50 focus:bg-white min-h-touch"
            >
              <option value="">{isTa ? 'அனைத்து மாவட்டங்களும்' : 'All Districts'}</option>
              {TN_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {isTa ? TN_DISTRICTS_TA[d] || d : d}
                </option>
              ))}
            </select>
          </div>

          {/* Land Size */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              {isTa ? 'நில அளவு (ஏக்கர்)' : 'Land Size (Acres)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={landSizeAcres}
              onChange={(e) => setLandSizeAcres(e.target.value)}
              placeholder={isTa ? 'எ.கா. 3.0' : 'e.g. 3.0'}
              className="w-full text-xs font-medium border border-stone-300 rounded-xl px-3 py-2.5 bg-stone-50/50 focus:bg-white min-h-touch"
            />
          </div>

          {/* Crop Focus */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              {isTa ? 'பயிர்' : 'Primary Crop'}
            </label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full text-xs font-medium border border-stone-300 rounded-xl px-3 py-2.5 bg-stone-50/50 focus:bg-white min-h-touch"
            >
              <option value="">{isTa ? 'அனைத்து பயிர்களும்' : 'All Crops'}</option>
              {COMMON_CROPS.map((c) => (
                <option key={c.id} value={c.id}>
                  {isTa ? c.ta : c.en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('eligible')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all min-h-touch ${
            activeTab === 'eligible'
              ? 'bg-agri-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isTa ? 'முழு தகுதியுள்ள திட்டங்கள்' : 'Fully Eligible'}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-white/20 text-current">
            {eligibleSchemes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('nearMatches')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all min-h-touch ${
            activeTab === 'nearMatches'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <AlertCircle className="w-4 h-4 text-white" />
          <span>{isTa ? 'அருகிலுள்ள பொருத்தங்கள்' : 'Near Matches'}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-white/20 text-current">
            {nearMatches.length}
          </span>
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-agri-700 animate-spin mb-2" />
          <p className="text-xs text-stone-500">{t('app.loading')}</p>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-center">
          <p className="text-sm font-medium">{t('app.error')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 text-xs font-bold text-red-800 underline"
          >
            {t('app.retry')}
          </button>
        </div>
      )}

      {/* Eligible Schemes Tab */}
      {!isLoading && !isError && activeTab === 'eligible' && (
        <div>
          {eligibleSchemes.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500">
              <p className="text-sm font-medium">
                {isTa
                  ? 'இந்த அளவுருக்களுக்கு பொருந்தும் திட்டங்கள் எதுவும் கிடைக்கவில்லை.'
                  : 'No fully eligible schemes found for current parameters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligibleSchemes.map((item) => (
                <SchemeCard
                  key={item.scheme._id}
                  scheme={item.scheme}
                  matchedReasons={item.matchedReasons}
                  onSelect={onSelectScheme}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Near Matches Tab */}
      {!isLoading && !isError && activeTab === 'nearMatches' && (
        <div>
          {nearMatches.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500">
              <p className="text-sm font-medium">
                {isTa ? 'அருகிலுள்ள பொருத்தங்கள் எதுவும் இல்லை.' : 'No near-match schemes found.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearMatches.map((item) => (
                <SchemeCard
                  key={item.scheme._id}
                  scheme={item.scheme}
                  unmetCriteria={item.unmetCriteria}
                  onSelect={onSelectScheme}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
