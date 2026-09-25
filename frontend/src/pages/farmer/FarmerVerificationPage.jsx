import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useFarmerProfile } from '../../hooks/useFarmer';
import { useMyVerificationLogs } from '../../hooks/useVerification';
import { BadgeTile } from '../../components/common/BadgeTile';
import { LogCard } from '../../features/verification/LogCard';
import { CreateLogModal } from '../../features/verification/CreateLogModal';
import { CertificationUploadModal } from '../../features/verification/CertificationUploadModal';
import {
  ShieldCheck,
  PlusCircle,
  Award,
  Calendar,
  FileCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

export const FarmerVerificationPage = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const { profile } = useFarmerProfile();

  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  const { data: responseData, isLoading, isError, refetch } = useMyVerificationLogs({
    page,
    limit: 10,
  });

  const logs = responseData?.data || [];
  const pagination = responseData?.meta?.pagination || { total: 0, totalPages: 1 };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Trust & Badge Overview Header */}
      <div className="bg-gradient-to-r from-agri-900 to-agri-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-agri-300 uppercase tracking-wider block mb-1">
              {isTa ? 'நம்பகத்தன்மை மற்றும் சரிபார்ப்பு தடம்' : 'Trust & Verification Trail'}
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {isTa ? 'சரிபார்ப்பு பதிவுகள்' : 'Verification Logs'}
              </h1>
              <BadgeTile level={profile?.trustBadge || 'none'} size="md" />
            </div>
            <p className="text-xs sm:text-sm text-agri-100 mt-2 max-w-xl">
              {isTa
                ? 'உங்கள் களப்பணி செயல்பாடுகளை புகைப்பட ஆதாரங்களுடன் பதிவிட்டு, சக விவசாயிகளால் சரிபார்க்கப்பட்டு பேட்ஜ்களைப் பெறுங்கள்.'
                : 'Log natural bio-input applications with field photo evidence. Earn peer-verified Bronze, Silver, and Gold badges.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-agri-500 hover:bg-agri-400 text-stone-950 text-xs sm:text-sm font-bold shadow-sm transition-all min-h-touch"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isTa ? 'பதிவு சேர்க்க' : 'Add Field Log'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCertModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 transition-all min-h-touch backdrop-blur-xs"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>{isTa ? 'சான்றிதழ் பதிவேற்று' : 'Upload Certificate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Badge Progression Criteria Info Bar */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-xs sm:text-sm mb-3">
          <Info className="w-4 h-4 text-agri-700" />
          <span>{isTa ? 'பேட்ஜ் பெறுவதற்கான தகுதிகள்:' : 'Trust Badge Qualification Requirements:'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
            <span className="font-bold text-amber-950 block mb-0.5">🥉 {t('badges.bronze')}</span>
            <p className="text-amber-900/80">{t('badges.bronzeDesc')}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-950 block mb-0.5">🥈 {t('badges.silver')}</span>
            <p className="text-slate-800/80">{t('badges.silverDesc')}</p>
          </div>

          <div className="p-3 rounded-xl bg-yellow-50/60 border border-yellow-200">
            <span className="font-bold text-yellow-950 block mb-0.5">🥇 {t('badges.gold')}</span>
            <p className="text-yellow-900/80">{t('badges.goldDesc')}</p>
          </div>
        </div>
      </div>

      {/* Verification Logs Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">
            {isTa ? 'என் களப்பதிவு வரலாறு' : 'My Log History'} ({pagination.total || logs.length})
          </h2>
        </div>

        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-stone-200">
            <Loader2 className="w-8 h-8 text-agri-700 animate-spin mb-2" />
            <p className="text-xs text-stone-500">{t('app.loading')}</p>
          </div>
        )}

        {isError && (
          <div className="p-5 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-center">
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

        {!isLoading && !isError && logs.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 text-stone-500 space-y-3">
            <FileCheck className="w-12 h-12 text-stone-300 mx-auto" />
            <div className="max-w-sm mx-auto">
              <p className="font-bold text-stone-900 text-sm">
                {isTa ? 'இன்னும் சரிபார்ப்பு பதிவுகள் இல்லை' : 'No verification logs yet'}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {isTa
                  ? 'பஞ்சகவ்யா, ஜீவாமிர்தம் தெளித்த உங்கள் முதல் களப் பதிவை சேர்த்து பேட்ஜ் பெறுங்கள்.'
                  : 'Start by logging your first bio-input application to earn trust badges.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold shadow-xs min-h-touch"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isTa ? 'முதல் பதிவைச் சேர்க்கவும்' : 'Add First Log Entry'}</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && logs.length > 0 && (
          <div className="space-y-3">
            {logs.map((log) => (
              <LogCard
                key={log._id}
                log={log}
                isOwnLog={true}
                viewerSharesCluster={false}
              />
            ))}

            {/* Pagination Controls */}
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
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateLogModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => refetch()}
        />
      )}

      {showCertModal && (
        <CertificationUploadModal
          currentStatus={profile?.certification?.reviewStatus || 'none'}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
};
