import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Award, CheckCircle, XCircle, FileText, ExternalLink, Calendar, User, X } from 'lucide-react';
import { usePendingCertifications, useReviewCertification } from '../../hooks/useAdmin';

export const AdminCertificationsSection = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const { data, isLoading, isError, refetch } = usePendingCertifications();
  const reviewMutation = useReviewCertification();

  const pendingList = data?.data || [];

  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [decision, setDecision] = useState('approved'); // 'approved' | 'rejected'
  const [reviewNote, setReviewNote] = useState('');
  const [actionError, setActionError] = useState('');

  const handleReview = async (e) => {
    e.preventDefault();
    setActionError('');

    try {
      await reviewMutation.mutateAsync({
        farmerId: selectedFarmer._id,
        status: decision,
        reviewNote: reviewNote.trim(),
      });
      setSelectedFarmer(null);
      setReviewNote('');
    } catch (err) {
      setActionError(
        err.response?.data?.error?.message ||
          (isTa ? 'மதிப்பாய்வை முடிப்பதில் பிழை ஏற்பட்டது.' : 'Failed to submit review decision.')
      );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span>{isTa ? 'சான்றிதழ் மறுஆய்வு வரிசை' : 'Pending Certifications Review'}</span>
          </h2>
          <p className="text-xs text-stone-500">
            {isTa
              ? 'NPOP / PGS-இந்தியா ஆவணங்களைச் சமர்ப்பித்த விவசாயிகளின் பதிவேடுகளை மதிப்பாய்வு செய்தல்'
              : 'Official organic certification audits submitted for verification and badge upgrade'}
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
          {pendingList.length} {isTa ? 'நிலுவையில்' : 'Pending'}
        </span>
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
      ) : pendingList.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">
            {isTa ? 'நிலுவையில் உள்ள சான்றிதழ்கள் எதுவும் இல்லை' : 'No pending certificates'}
          </h3>
          <p className="text-xs text-stone-500">
            {isTa
              ? 'அனைத்து சான்றிதழ் விண்ணப்பங்களும் தணிக்கை செய்யப்பட்டுவிட்டன.'
              : 'All certification submissions have been reviewed.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingList.map((farmer) => {
            const cert = farmer.certification || {};
            const docUrl = cert.documentUrl || cert.url;

            return (
              <div
                key={farmer._id}
                className="bg-white rounded-3xl border border-amber-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                      <Award className="w-3 h-3 text-amber-700" />
                      <span>{cert.agency || (isTa ? 'இயற்கை சான்றிதழ்' : 'Organic Certificate')}</span>
                    </span>
                    <h4 className="text-base font-bold text-stone-900">{farmer.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span>{farmer.district}</span>
                      <span>•</span>
                      <span>
                        {isTa ? 'மாற்ற மாதம்' : 'Month'}: {farmer.transitionMonth || 0}
                      </span>
                      <span>•</span>
                      <span>
                        {isTa ? 'பதிவுகள்' : 'Logs'}: {farmer.logCount || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFarmer(farmer);
                        setDecision('approved');
                        setReviewNote('');
                      }}
                      className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs cursor-pointer min-h-touch"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isTa ? 'அங்கீகரி' : 'Approve'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFarmer(farmer);
                        setDecision('rejected');
                        setReviewNote('');
                      }}
                      className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 cursor-pointer min-h-touch"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{isTa ? 'மறுக்க' : 'Reject'}</span>
                    </button>
                  </div>
                </div>

                {/* Certificate Meta Details */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-stone-600">
                    <div>
                      <span className="text-[11px] text-stone-400 block">{isTa ? 'சான்றிதழ் எண்' : 'Cert No'}</span>
                      <span className="font-bold text-stone-800">{cert.certificateNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 block">{isTa ? 'காலாவதி தேதி' : 'Expiry Date'}</span>
                      <span className="font-bold text-stone-800">
                        {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 block">{isTa ? 'ஆவணம்' : 'Document'}</span>
                      {docUrl ? (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-agri-700 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isTa ? 'ஆவணத்தைப் பார்' : 'View Document'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="italic text-stone-400">Not provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Dialog Modal */}
      {selectedFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                {decision === 'approved' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-700" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>
                  {decision === 'approved'
                    ? isTa ? 'சான்றிதழ் அனுமதித்தல்' : 'Approve Organic Certification'
                    : isTa ? 'சான்றிதழ் நிராகரிப்பு' : 'Reject Certification'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedFarmer(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReview} className="space-y-4 text-xs">
              <p className="text-stone-600 leading-relaxed">
                {decision === 'approved'
                  ? isTa
                    ? `${selectedFarmer.name} அவர்களின் சான்றிதழை அனுமதிப்பது, அவர்களின் நிலையை 'அங்கீகரிக்கப்பட்ட இயற்கை (Certified)' என மேம்படுத்தும்.`
                    : `Approving will upgrade ${selectedFarmer.name}'s transition status to 'Certified Organic'.`
                  : isTa
                    ? `நிராகரிப்பதற்கான காரணத்தை விவசாயிக்குத் தெரிவிக்க குறிப்பு எழுதவும்.`
                    : `Please specify the reason for rejection so the farmer can re-upload proper documentation.`}
              </p>

              <div>
                <label htmlFor="cert-review-note" className="block font-bold text-stone-800 mb-1">
                  {isTa ? 'தணிக்கைக் குறிப்பு / கருத்து' : 'Review Note'}
                </label>
                <textarea
                  id="cert-review-note"
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={
                    decision === 'approved'
                      ? isTa
                        ? 'எ.கா: NPOP சான்றிதழ் எண் தேசிய தரவுத்தளத்துடன் சரிபார்க்கப்பட்டது.'
                        : 'E.g., NPOP certificate successfully verified against APEDA registry.'
                      : isTa
                        ? 'எ.கா: ஆவணத்தின் நகல் தெளிவாக இல்லை. மீண்டும் பதிவேற்றவும்.'
                        : 'E.g., Scanned copy is blurred; please re-upload a clear copy.'
                  }
                  className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                />
              </div>

              {actionError && <p className="text-red-600">{actionError}</p>}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedFarmer(null)}
                  className="px-3.5 py-1.5 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  {t('app.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className={`px-4 py-2 font-bold text-white rounded-xl shadow-xs ${
                    decision === 'approved'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {reviewMutation.isPending
                    ? t('app.saving')
                    : decision === 'approved'
                    ? isTa ? 'உறுதிசெய்து அனுமதி' : 'Confirm Approval'
                    : isTa ? 'நிராகரிக்க' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
