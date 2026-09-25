import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { usePeerVerifyLog, useFlagLog } from '../../hooks/useVerification';
import { VERIFICATION_ENTRY_TYPES, PEER_VERIFICATION_MAX_LOG_AGE_DAYS } from '../../config/constants';
import { getApiErrorMessage } from '../../lib/errorHandler';
import {
  ShieldCheck,
  Flag,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  MessageSquare,
  X,
} from 'lucide-react';

export const LogCard = ({ log, viewerSharesCluster = false, isOwnLog = false }) => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const isTa = i18n.language === 'ta';

  const peerVerifyMutation = usePeerVerifyLog();
  const flagMutation = useFlagLog();

  const [lightboxImg, setLightboxImg] = useState(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyComment, setVerifyComment] = useState('');
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  // Calculate log age
  const logDate = new Date(log.capturedAt || log.createdAt);
  const ageDays = (Date.now() - logDate.getTime()) / (1000 * 60 * 60 * 24);
  const isEligibleForPeerVerify =
    viewerSharesCluster &&
    !isOwnLog &&
    ageDays <= PEER_VERIFICATION_MAX_LOG_AGE_DAYS &&
    !log.isFlagged;

  const entryTypeObj = VERIFICATION_ENTRY_TYPES.find((e) => e.id === log.entryType);
  const entryTypeLabel = entryTypeObj ? (isTa ? entryTypeObj.ta : entryTypeObj.en) : log.entryType;

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await peerVerifyMutation.mutateAsync({ logId: log._id, comment: verifyComment });
      setShowVerifyDialog(false);
      setVerifyComment('');
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  const handleFlag = async (e) => {
    e.preventDefault();
    if (!flagReason.trim()) return;
    try {
      await flagMutation.mutateAsync({ logId: log._id, flagReason: flagReason.trim() });
      setShowFlagDialog(false);
      setFlagReason('');
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all bg-white shadow-xs ${
        log.isFlagged ? 'border-red-300 bg-red-50/20' : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      {/* Flagged Alert Banner */}
      {log.isFlagged && (
        <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>
            {isTa
              ? 'இந்த பதிவு சந்தேகத்திற்குரியதாக கொடியிடப்பட்டு நிர்வாக மறுஆய்வில் உள்ளது.'
              : 'This log has been flagged for admin review.'}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-lg bg-agri-100 text-agri-900 mb-1">
            {entryTypeLabel}
          </span>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{logDate.toLocaleDateString()}</span>
            </span>
            {log.location?.coordinates && (
              <span className="flex items-center gap-1 text-agri-700">
                <MapPin className="w-3.5 h-3.5" />
                <span>GPS Verified</span>
              </span>
            )}
          </div>
        </div>

        {/* Peer verification count pill */}
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              log.peerVerifications?.length > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-stone-50 text-stone-600 border-stone-200'
            }`}
          >
            <ShieldCheck
              className={`w-3.5 h-3.5 ${
                log.peerVerifications?.length > 0 ? 'text-emerald-600' : 'text-stone-400'
              }`}
            />
            <span>
              {log.peerVerifications?.length || 0}{' '}
              {isTa ? 'சக சரிபார்ப்புகள்' : 'Peer Verifications'}
            </span>
          </span>
        </div>
      </div>

      {/* Description */}
      {log.description && (
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-3 whitespace-pre-line">
          {log.description}
        </p>
      )}

      {/* Photos Grid */}
      {log.media && log.media.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {log.media.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setLightboxImg(img.url)}
              className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100 group cursor-pointer"
            >
              <img
                src={img.url}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        {/* Peer Verify Button */}
        {isEligibleForPeerVerify ? (
          <button
            type="button"
            onClick={() => setShowVerifyDialog(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-colors min-h-touch"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isTa ? 'சக சரிபார்ப்பு செய்க' : 'Peer Verify'}</span>
          </button>
        ) : (
          <div />
        )}

        {/* Flag Log Button */}
        {isAuthenticated && !log.isFlagged && !isOwnLog && (
          <button
            type="button"
            onClick={() => setShowFlagDialog(true)}
            className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-red-600 transition-colors ml-auto p-1.5"
            title={isTa ? 'கொடியிடு' : 'Flag suspicious log'}
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="text-[11px]">{isTa ? 'கொடியிடு' : 'Flag'}</span>
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs"
        >
          <div className="relative max-w-2xl w-full max-h-[90vh]">
            <img
              src={lightboxImg}
              alt="Full size preview"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              className="absolute top-3 right-3 p-2 bg-stone-900/80 text-white rounded-full hover:bg-stone-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Peer Verify Dialog */}
      {showVerifyDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-5 border border-stone-200 space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">
              {isTa ? 'சக விவசாயி சரிபார்ப்பு உறுதி' : 'Confirm Peer Verification'}
            </h3>
            <p className="text-xs text-stone-600">
              {isTa
                ? 'இந்த நடைமுறை உங்கள் குழு உறுப்பினரால் சரியாகச் செய்யப்பட்டது என்பதை உறுதிப்படுத்துகிறீர்களா?'
                : 'Do you verify that this natural farming practice was executed properly by your cluster peer?'}
            </p>
            <input
              type="text"
              value={verifyComment}
              onChange={(e) => setVerifyComment(e.target.value)}
              placeholder={isTa ? 'விருப்ப கருத்து (எ.கா. களத்தில் பார்த்தேன்)' : 'Optional comment'}
              className="w-full text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowVerifyDialog(false)}
                className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                {t('app.cancel')}
              </button>
              <button
                type="button"
                onClick={handleVerify}
                disabled={peerVerifyMutation.isPending}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
              >
                {peerVerifyMutation.isPending ? t('app.saving') : t('app.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Dialog */}
      {showFlagDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-5 border border-stone-200 space-y-4">
            <h3 className="font-bold text-red-900 text-sm flex items-center gap-1.5">
              <Flag className="w-4 h-4 text-red-600" />
              <span>{isTa ? 'சந்தேகத்திற்குரியதாகக் கொடியிடு' : 'Flag Suspicious Log'}</span>
            </h3>
            <p className="text-xs text-stone-600">
              {isTa
                ? 'காரணத்தைக் குறிப்பிடவும் (எ.கா. இரசாயன உரம் பயன்படுத்தியது, போலி புகைப்படம்).'
                : 'Specify reason for flagging (e.g., chemical usage evidence, fake photo).'}
            </p>
            <textarea
              rows={2}
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder={isTa ? 'கொடியிடுவதற்கான காரணம்...' : 'Reason for flagging...'}
              className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50"
              required
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFlagDialog(false)}
                className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                {t('app.cancel')}
              </button>
              <button
                type="button"
                onClick={handleFlag}
                disabled={flagMutation.isPending || !flagReason.trim()}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                {flagMutation.isPending ? t('app.saving') : isTa ? 'கொடியிடு' : 'Submit Flag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
