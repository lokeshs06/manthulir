import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle, Clock, AlertTriangle, PlusCircle, ExternalLink, X, ShieldAlert } from 'lucide-react';
import { useUnverifiedSchemes, useVerifyScheme } from '../../hooks/useAdmin';
import { adminApi } from '../../api/admin.api';

export const AdminSchemesSection = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const { data, isLoading, isError, refetch } = useUnverifiedSchemes();
  const verifyMutation = useVerifyScheme();

  const unverifiedSchemes = data?.data || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [nameTa, setNameTa] = useState('');
  const [department, setDepartment] = useState('Tamil Nadu Department of Agriculture');
  const [level, setLevel] = useState('state');
  const [description, setDescription] = useState('');
  const [descriptionTa, setDescriptionTa] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async (schemeId) => {
    try {
      await verifyMutation.mutateAsync(schemeId);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Verification failed');
    }
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    setActionError('');
    setIsSubmitting(true);

    try {
      await adminApi.createScheme({
        name: name.trim(),
        nameTa: nameTa.trim() || undefined,
        department: department.trim(),
        level,
        description: description.trim(),
        descriptionTa: descriptionTa.trim() || undefined,
        officialUrl: officialUrl.trim() || undefined,
        benefits: [],
        eligibility: {},
      });
      setShowAddModal(false);
      setName('');
      setNameTa('');
      setDescription('');
      setDescriptionTa('');
      setOfficialUrl('');
      refetch();
    } catch (err) {
      setActionError(
        err.response?.data?.error?.message ||
          (isTa ? 'திட்டத்தை சேர்ப்பதில் பிழை ஏற்பட்டது.' : 'Failed to create scheme.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <span>{isTa ? 'அரசுத் திட்டங்கள் தணிக்கை & மேலாண்மை' : 'Schemes Verification & Management'}</span>
          </h2>
          <p className="text-xs text-stone-500">
            {isTa
              ? '12 மாதங்களுக்கு மேலாக சரிபார்க்கப்படாத அல்லது புதிய அரசு திட்டங்கள்'
              : 'Schemes unverified or not audited against official gazettes in >12 months'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs cursor-pointer min-h-touch self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isTa ? 'புதிய திட்டம் சேர்' : 'Add New Scheme'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-stone-500 text-sm">{t('app.loading')}</div>
      ) : isError ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{t('app.error')}</span>
          <button type="button" onClick={() => refetch()} className="font-bold underline">
            {t('app.retry')}
          </button>
        </div>
      ) : unverifiedSchemes.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">
            {isTa ? 'அனைத்து திட்டங்களும் சரிபார்க்கப்பட்டுள்ளன' : 'All schemes verified'}
          </h3>
          <p className="text-xs text-stone-500">
            {isTa
              ? 'அனைத்து அரசுத் திட்டங்களும் கடந்த 12 மாதங்களுக்குள் அரசு அறிவிப்புகளுடன் ஒப்பிடப்பட்டுள்ளன.'
              : 'Every central and state scheme is up to date with official departmental guidelines.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {isTa
                ? `${unverifiedSchemes.length} திட்டங்கள் சமீபத்திய அரசு அறிவிப்புகளுடன் சரிபார்க்கப்பட வேண்டும்.`
                : `${unverifiedSchemes.length} schemes require official verification to maintain platform trust.`}
            </span>
          </div>

          {unverifiedSchemes.map((scheme) => {
            const displayName = isTa ? scheme.nameTa || scheme.name : scheme.name;
            const lastVerified = scheme.lastVerifiedAt
              ? new Date(scheme.lastVerifiedAt).toLocaleDateString()
              : isTa ? 'சரிபார்க்கப்படவில்லை' : 'Never verified';

            return (
              <div
                key={scheme._id}
                className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-agri-800 bg-agri-100 px-2 py-0.5 rounded-full">
                        {scheme.level}
                      </span>
                      <span className="text-xs text-stone-500">{scheme.department}</span>
                    </div>
                    <h4 className="text-base font-bold text-stone-900">{displayName}</h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerify(scheme._id)}
                    disabled={verifyMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs cursor-pointer min-h-touch"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isTa ? 'இன்று சரிபார்க்கப்பட்டது என குறி' : 'Mark Verified Today'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {isTa ? 'கடைசி சரிபார்ப்பு' : 'Last Verified'}:{' '}
                      <strong className="text-stone-700">{lastVerified}</strong>
                    </span>
                  </span>

                  {scheme.officialUrl && (
                    <a
                      href={scheme.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-agri-700 hover:underline flex items-center gap-1"
                    >
                      <span>{isTa ? 'அரசு தளம்' : 'Official Portal'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Scheme Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-agri-700" />
                <span>{isTa ? 'புதிய அரசுத் திட்டம் சேர்த்தல்' : 'Add Government Scheme'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScheme} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  {isTa ? 'திட்டத்தின் பெயர் (English)*' : 'Scheme Name (English)*'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="E.g. Tamil Nadu Organic Farming Support Scheme"
                  className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  {isTa ? 'திட்டத்தின் பெயர் (தமிழ்)' : 'Scheme Name (Tamil)'}
                </label>
                <input
                  type="text"
                  value={nameTa}
                  onChange={(e) => setNameTa(e.target.value)}
                  placeholder="எ.கா. தமிழ்நாடு இயற்கை வேளாண் கொள்கை ஆதரவுத் திட்டம்"
                  className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    {isTa ? 'அரசு நிலை*' : 'Level*'}
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600 cursor-pointer"
                  >
                    <option value="state">{isTa ? 'மாநில அரசு (State)' : 'State'}</option>
                    <option value="central">{isTa ? 'மத்திய அரசு (Central)' : 'Central'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    {isTa ? 'அரசு இணைய முகவரி' : 'Official Portal URL'}
                  </label>
                  <input
                    type="url"
                    value={officialUrl}
                    onChange={(e) => setOfficialUrl(e.target.value)}
                    placeholder="https://tnhorticulture.tn.gov.in"
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  {isTa ? 'விளக்கம் (English)*' : 'Description (English)*'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Summary of benefits and scope"
                  className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  {isTa ? 'விளக்கம் (தமிழ்)' : 'Description (Tamil)'}
                </label>
                <textarea
                  rows={2}
                  value={descriptionTa}
                  onChange={(e) => setDescriptionTa(e.target.value)}
                  placeholder="திட்டத்தின் நன்மைகள் மற்றும் விவரங்கள்"
                  className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                />
              </div>

              {actionError && <p className="text-red-600">{actionError}</p>}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  {t('app.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 font-bold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs"
                >
                  {isSubmitting ? t('app.saving') : t('app.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
