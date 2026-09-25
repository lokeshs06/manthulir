import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useFarmerProfile, useUpdateFarmerProfile } from '../../hooks/useFarmer';
import { TN_DISTRICTS, TN_DISTRICTS_TA, COMMON_CROPS } from '../../config/constants';
import { BadgeTile } from '../../components/common/BadgeTile';
import { getApiErrorMessage } from '../../lib/errorHandler';
import {
  User,
  MapPin,
  Trees,
  Wheat,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';

export const FarmerProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isTa = i18n.language === 'ta';

  const { data: profile, isLoading, isError, error, refetch } = useFarmerProfile();
  const updateMutation = useUpdateFarmerProfile();

  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [landSizeAcres, setLandSizeAcres] = useState('');
  const [cropTypes, setCropTypes] = useState([]);
  const [customCrop, setCustomCrop] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync profile data when loaded
  useEffect(() => {
    if (profile) {
      setDistrict(profile.district || '');
      setVillage(profile.village || '');
      setLandSizeAcres(profile.landSizeAcres !== undefined ? String(profile.landSizeAcres) : '');
      setCropTypes(profile.cropTypes || []);
    }
  }, [profile]);

  const toggleCrop = (cropId) => {
    if (cropTypes.includes(cropId)) {
      setCropTypes(cropTypes.filter((c) => c !== cropId));
    } else {
      setCropTypes([...cropTypes, cropId]);
    }
  };

  const addCustomCrop = (e) => {
    e.preventDefault();
    const trimmed = customCrop.trim().toLowerCase();
    if (trimmed && !cropTypes.includes(trimmed)) {
      setCropTypes([...cropTypes, trimmed]);
      setCustomCrop('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await updateMutation.mutateAsync({
        district: district || undefined,
        village: village.trim() || undefined,
        landSizeAcres: landSizeAcres ? Number(landSizeAcres) : undefined,
        cropTypes: cropTypes.length > 0 ? cropTypes : undefined,
      });
      setSuccessMessage(isTa ? 'சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!' : 'Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err));
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Profile Summary */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-agri-100 text-agri-800 flex items-center justify-center font-bold text-xl shrink-0">
            <User className="w-8 h-8 text-agri-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">{user?.name}</h1>
              <BadgeTile level={profile?.trustBadge || 'none'} size="sm" />
            </div>
            <p className="text-xs text-stone-500 font-medium flex items-center gap-2">
              <span>{user?.phone}</span>
              <span>•</span>
              <span className="capitalize">{t(`roles.${user?.role}`)}</span>
              {profile?.farmerCategory && (
                <>
                  <span>•</span>
                  <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700 font-bold uppercase text-[10px]">
                    {profile.farmerCategory}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {profile?.transitionStatus && (
          <div className="sm:text-right bg-stone-50 p-3 rounded-xl border border-stone-100">
            <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">
              {isTa ? 'மாற்ற நிலை' : 'Transition Status'}
            </span>
            <span className="font-bold text-sm text-agri-800 capitalize">
              {profile.transitionStatus}
            </span>
          </div>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5">
        <h2 className="text-base sm:text-lg font-bold text-stone-900 border-b border-stone-100 pb-3">
          {isTa ? 'விவசாயப் பண்ணை விவரங்கள்' : 'Farm & Cultivation Details'}
        </h2>

        {/* District & Village */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* District Picker */}
          <div>
            <label
              htmlFor="farmer-district"
              className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
            >
              {isTa ? 'மாவட்டம்' : 'District'} *
            </label>
            <div className="relative">
              <select
                id="farmer-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-sm font-medium border border-stone-300 rounded-xl px-3.5 py-3 bg-stone-50/50 focus:bg-white min-h-touch"
              >
                <option value="">{isTa ? 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்' : 'Select District'}</option>
                {TN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {isTa ? TN_DISTRICTS_TA[d] || d : d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Village */}
          <div>
            <label
              htmlFor="farmer-village"
              className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
            >
              {isTa ? 'கிராமம் / பகுதி' : 'Village / Locality'}
            </label>
            <input
              id="farmer-village"
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder={isTa ? 'எ.கா. திருப்பரங்குன்றம்' : 'e.g. Thiruparankundram'}
              className="w-full text-sm font-medium border border-stone-300 rounded-xl px-3.5 py-3 bg-stone-50/50 focus:bg-white min-h-touch"
            />
          </div>
        </div>

        {/* Land Size */}
        <div>
          <label
            htmlFor="farmer-land"
            className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5"
          >
            {isTa ? 'நில அளவு (ஏக்கர்)' : 'Total Land Size (Acres)'}
          </label>
          <div className="relative max-w-xs">
            <input
              id="farmer-land"
              type="number"
              step="0.1"
              min="0"
              value={landSizeAcres}
              onChange={(e) => setLandSizeAcres(e.target.value)}
              placeholder="e.g. 3.5"
              className="w-full text-sm font-medium border border-stone-300 rounded-xl px-3.5 py-3 bg-stone-50/50 focus:bg-white min-h-touch"
            />
            <span className="absolute right-3.5 top-3.5 text-xs text-stone-400 font-semibold pointer-events-none">
              Acres
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {isTa
              ? 'நில அளவைப் பொறுத்து சிறு/குறு விவசாயி வகை தானாகக் கணக்கிடப்படும்.'
              : 'Farmer category (marginal/small/medium) is auto-computed based on land size.'}
          </p>
        </div>

        {/* Crop Types (Pickers) */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
            {isTa ? 'சாகுபடி செய்யும் பயிர்கள்' : 'Cultivated Crops'}
          </label>

          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_CROPS.map((crop) => {
              const isSelected = cropTypes.includes(crop.id);
              return (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => toggleCrop(crop.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all min-h-touch ${
                    isSelected
                      ? 'bg-agri-700 text-white border-agri-800 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {isTa ? crop.ta : crop.en}
                </button>
              );
            })}
          </div>

          {/* Custom Crop Add */}
          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={customCrop}
              onChange={(e) => setCustomCrop(e.target.value)}
              placeholder={isTa ? 'மற்றொரு பயிர் சேர்க்க...' : 'Add other crop...'}
              className="text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50 focus:bg-white flex-1 min-h-touch"
            />
            <button
              type="button"
              onClick={addCustomCrop}
              className="px-3.5 py-2 rounded-xl bg-stone-800 text-white text-xs font-bold hover:bg-stone-900 min-h-touch"
            >
              {isTa ? 'சேர்' : 'Add'}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-stone-100">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm shadow-sm transition-all min-h-touch disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{updateMutation.isPending ? t('app.saving') : t('app.save')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
