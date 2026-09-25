import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useBuyerProfile, useUpdateBuyerProfile } from '../../hooks/useBuyer';
import { TAMIL_NADU_DISTRICTS, TAMIL_NADU_CROPS } from '../../config/constants';

export const BuyerProfilePage = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const { data: profileRes, isLoading, isError, refetch } = useBuyerProfile();
  const updateMutation = useUpdateBuyerProfile();

  const profile = profileRes?.data || {};

  const [buyerType, setBuyerType] = useState('individual');
  const [organizationName, setOrganizationName] = useState('');
  const [district, setDistrict] = useState('');
  const [interestedCrops, setInterestedCrops] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (profile) {
      setBuyerType(profile.buyerType || 'individual');
      setOrganizationName(profile.organizationName || '');
      setDistrict(profile.district || '');
      setInterestedCrops(profile.interestedCrops || []);
    }
  }, [profileRes]);

  const toggleCrop = (crop) => {
    setInterestedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError('');

    try {
      await updateMutation.mutateAsync({
        buyerType,
        organizationName: organizationName.trim(),
        district,
        interestedCrops,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(
        err.response?.data?.error?.message ||
          (isTa ? 'சுயவிவரத்தை சேமிப்பதில் பிழை ஏற்பட்டது.' : 'Failed to update profile.')
      );
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-stone-500 text-sm">{t('app.loading')}</div>;
  }

  if (isError) {
    return (
      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
        <span>{t('app.error')}</span>
        <button type="button" onClick={() => refetch()} className="font-bold underline">
          {t('app.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-agri-700" />
          <span>{isTa ? 'வாங்குபவர் சுயவிவரம்' : 'Buyer Profile'}</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          {isTa
            ? 'இயற்கை விவசாயிகளிடம் இருந்து நேரடியாக கொள்முதல் செய்வதற்கான உங்கள் வணிக விவரங்கள்'
            : 'Your business profile and procurement preferences for direct organic purchasing'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5">
        {/* Buyer Type */}
        <div>
          <label className="block text-xs font-bold text-stone-800 mb-2">
            {isTa ? 'வாங்குபவர் வகை*' : 'Buyer Category*'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'individual', ta: 'தனிநபர் / நுகர்வோர்', en: 'Individual' },
              { id: 'shop', ta: 'இயற்கை அங்காடி', en: 'Retail Shop' },
              { id: 'restaurant', ta: 'உணவகம் / விடுதி', en: 'Restaurant' },
              { id: 'organization', ta: 'நிறுவனம் / FPO', en: 'Organization' },
            ].map((bt) => (
              <button
                key={bt.id}
                type="button"
                onClick={() => setBuyerType(bt.id)}
                className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  buyerType === bt.id
                    ? 'border-agri-700 bg-agri-50 text-agri-950 shadow-xs ring-1 ring-agri-700'
                    : 'border-stone-200 bg-stone-50/50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {isTa ? bt.ta : bt.en}
              </button>
            ))}
          </div>
        </div>

        {/* Organization / Business Name */}
        <div>
          <label htmlFor="org-name" className="block text-xs font-bold text-stone-800 mb-1">
            {isTa ? 'வணிகப் பெயர் / கடை பெயர்' : 'Business / Organization Name'}
          </label>
          <input
            id="org-name"
            type="text"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder={isTa ? 'எ.கா: ஆரோக்யா இயற்கை அங்காடி' : 'E.g. Arokya Organic Store'}
            className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
          />
        </div>

        {/* District */}
        <div>
          <label htmlFor="buyer-district" className="block text-xs font-bold text-stone-800 mb-1">
            {isTa ? 'மாவட்டம்*' : 'District*'}
          </label>
          <select
            id="buyer-district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
            className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600 cursor-pointer"
          >
            <option value="">{isTa ? '-- மாவட்டத்தைத் தேர்ந்தெடுக்கவும் --' : '-- Select District --'}</option>
            {TAMIL_NADU_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Interested Crops */}
        <div>
          <label className="block text-xs font-bold text-stone-800 mb-1.5">
            {isTa ? 'விருப்பமான விளைபொருட்கள்' : 'Interested Crops & Categories'}
          </label>
          <p className="text-[11px] text-stone-500 mb-2">
            {isTa
              ? 'நீங்கள் கொள்முதல் செய்ய விரும்பும் பயிர்களைத் தேர்ந்தெடுக்கவும்.'
              : 'Select produce varieties you regularly procure.'}
          </p>

          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-stone-50 rounded-2xl border border-stone-200">
            {TAMIL_NADU_CROPS.map((c) => {
              const cropValue = c.en || c.id;
              const selected = interestedCrops.includes(cropValue);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCrop(cropValue)}
                  className={`px-2.5 py-1 text-xs rounded-xl border transition-all cursor-pointer ${
                    selected
                      ? 'bg-agri-700 border-agri-700 text-white font-bold'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100 font-medium'
                  }`}
                >
                  {isTa ? c.ta : c.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{isTa ? 'சுயவிவரம் வெற்றிகரமாக சேமிக்கப்பட்டது!' : 'Profile updated successfully!'}</span>
          </div>
        )}

        {saveError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer min-h-touch"
          >
            <Save className="w-4 h-4" />
            <span>{updateMutation.isPending ? t('app.saving') : t('app.save')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
