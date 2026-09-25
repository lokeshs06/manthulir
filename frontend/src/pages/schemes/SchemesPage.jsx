import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSchemes } from '../../hooks/useSchemes';
import { SchemeCard } from '../../features/schemes/SchemeCard';
import { SchemeMatcher } from '../../features/schemes/SchemeMatcher';
import { SchemeDetailModal } from '../../features/schemes/SchemeDetailModal';
import { TN_DISTRICTS, TN_DISTRICTS_TA, COMMON_CROPS } from '../../config/constants';
import {
  FileText,
  Sparkles,
  Search,
  Filter,
  Loader2,
  Building,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const SchemesPage = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'matcher'

  // Filter states for browsing
  const [level, setLevel] = useState('');
  const [district, setDistrict] = useState('');
  const [crop, setCrop] = useState('');
  const [page, setPage] = useState(1);

  const [selectedScheme, setSelectedScheme] = useState(null);

  const filterParams = {
    page,
    limit: 12,
  };
  if (level) filterParams.level = level;
  if (district) filterParams.district = district;
  if (crop) filterParams.crop = crop;

  const { data: responseData, isLoading, isError, refetch } = useSchemes(filterParams);

  const schemes = responseData?.data || [];
  const pagination = responseData?.meta?.pagination || { total: 0, totalPages: 1 };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-agri-900 to-agri-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-agri-200 text-xs font-semibold mb-2 backdrop-blur-xs">
            <FileText className="w-3.5 h-3.5 text-agri-300" />
            <span>{isTa ? 'அரசு மானியங்கள் & திட்டங்கள்' : 'Government Schemes & Subsidies'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isTa ? 'இயற்கை வேளாண்மை திட்டங்கள்' : 'Organic Agriculture Schemes'}
          </h1>
          <p className="text-xs sm:text-sm text-agri-100 mt-1">
            {isTa
              ? 'மத்திய மற்றும் தமிழ்நாடு அரசு வழங்கும் மானியங்கள், உள்ளீட்டு உதவிகள் மற்றும் பயிற்சித் திட்டங்கள்.'
              : 'Browse and apply for central and state government schemes supporting natural & organic farming.'}
          </p>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('browse')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all min-h-touch ${
            activeTab === 'browse'
              ? 'bg-agri-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isTa ? 'திட்டங்களை உலாவுக' : 'Browse All Schemes'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matcher')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all min-h-touch ${
            activeTab === 'matcher'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>{isTa ? 'சுயவிவர திட்டம் பொருத்துதல்' : 'Smart Eligibility Matcher'}</span>
        </button>
      </div>

      {/* Browse Schemes Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Level Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {isTa ? 'திட்ட நிலை' : 'Government Level'}
                </label>
                <select
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-medium border border-stone-300 rounded-xl px-3 py-2.5 bg-stone-50 focus:bg-white min-h-touch"
                >
                  <option value="">{isTa ? 'அனைத்து நிலைகளும்' : 'All Levels'}</option>
                  <option value="state">{isTa ? 'மாநில அரசு (Tamil Nadu)' : 'State Government'}</option>
                  <option value="central">{isTa ? 'மத்திய அரசு (Central)' : 'Central Government'}</option>
                </select>
              </div>

              {/* District Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {isTa ? 'மாவட்டம்' : 'District'}
                </label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-medium border border-stone-300 rounded-xl px-3 py-2.5 bg-stone-50 focus:bg-white min-h-touch"
                >
                  <option value="">{isTa ? 'அனைத்து மாவட்டங்களும்' : 'All Districts'}</option>
                  {TN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {isTa ? TN_DISTRICTS_TA[d] || d : d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Crop Filter */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  {isTa ? 'பயிர்' : 'Crop'}
                </label>
                <select
                  value={crop}
                  onChange={(e) => {
                    setCrop(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-medium border border-stone-300 rounded-xl px-3 py-2.5 bg-stone-50 focus:bg-white min-h-touch"
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

          {/* Scheme Cards Grid */}
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-agri-700 animate-spin mb-3" />
              <p className="text-xs text-stone-500">{t('app.loading')}</p>
            </div>
          )}

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

          {!isLoading && !isError && schemes.length === 0 && (
            <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 text-stone-500">
              <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-medium">
                {isTa ? 'தேர்ந்தெடுத்த வடிகட்டிகளுக்கு திட்டங்கள் எதுவும் இல்லை.' : 'No schemes match your filter.'}
              </p>
            </div>
          )}

          {!isLoading && !isError && schemes.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schemes.map((scheme) => (
                  <SchemeCard
                    key={scheme._id}
                    scheme={scheme}
                    onSelect={(s) => setSelectedScheme(s)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold text-stone-700 disabled:opacity-40 min-h-touch"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t('app.back')}</span>
                  </button>

                  <span className="text-xs font-semibold text-stone-600">
                    {isTa ? `பக்கம் ${page} / ${pagination.totalPages}` : `Page ${page} of ${pagination.totalPages}`}
                  </span>

                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold text-stone-700 disabled:opacity-40 min-h-touch"
                  >
                    <span>{t('app.next')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Scheme Matcher Tab */}
      {activeTab === 'matcher' && (
        <SchemeMatcher onSelectScheme={(s) => setSelectedScheme(s)} />
      )}

      {/* Detail Modal */}
      {selectedScheme && (
        <SchemeDetailModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </div>
  );
};
