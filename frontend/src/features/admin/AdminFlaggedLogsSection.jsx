import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flag, CheckCircle, AlertTriangle, Calendar, User, X, ShieldAlert } from 'lucide-react';
import { useFlaggedLogs, useResolveFlaggedLog } from '../../hooks/useAdmin';

export const AdminFlaggedLogsSection = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const { data, isLoading, isError, refetch } = useFlaggedLogs();
  const resolveMutation = useResolveFlaggedLog();

  const flaggedLogs = data?.data || [];

  const [selectedLog, setSelectedLog] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [actionError, setActionError] = useState('');

  const handleResolve = async (e) => {
    e.preventDefault();
    setActionError('');

    try {
      await resolveMutation.mutateAsync({
        id: selectedLog._id,
        resolutionNote: resolutionNote.trim(),
      });
      setSelectedLog(null);
      setResolutionNote('');
    } catch (err) {
      setActionError(
        err.response?.data?.error?.message ||
          (isTa ? 'கொடியை தீர்ப்பதில் பிழை ஏற்பட்டது.' : 'Failed to resolve flag.')
      );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-600" />
            <span>{isTa ? 'கொடியிடப்பட்ட சரிபார்ப்பு பதிவுகள்' : 'Flagged Logs Review Queue'}</span>
          </h2>
          <p className="text-xs text-stone-500">
            {isTa
              ? 'சந்தேகத்திற்குரியதாக அல்லது விதிமீறலாக சக விவசாயிகளால் தெரிவிக்கப்பட்ட பதிவுகள்'
              : 'Logs reported as suspicious or inaccurate by community members'}
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-red-100 text-red-800 rounded-full">
          {flaggedLogs.length} {isTa ? 'நிலுவையில்' : 'Pending'}
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
      ) : flaggedLogs.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">
            {isTa ? 'கொடியிடப்பட்ட பதிவுகள் எதுவும் இல்லை' : 'No flagged logs currently'}
          </h3>
          <p className="text-xs text-stone-500">
            {isTa
              ? 'அனைத்து சரிபார்ப்பு பதிவுகளும் சமூகம் மற்றும் நடுவர்களால் அங்கீகரிக்கப்பட்டுள்ளன.'
              : 'The community verification trail is clean and verified.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {flaggedLogs.map((log) => {
            const farmerName = log.farmerId?.name || (isTa ? 'விவசாயி' : 'Farmer');
            return (
              <div
                key={log._id}
                className="bg-white rounded-3xl border border-red-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-200">
                      <ShieldAlert className="w-3 h-3 text-red-700" />
                      <span>{isTa ? 'சந்தேகக் கொடி' : 'Flagged'}</span>
                    </span>
                    <h4 className="text-sm font-bold text-stone-900">{log.entryType}</h4>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-medium text-stone-700">{farmerName}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{new Date(log.capturedAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLog(log);
                      setResolutionNote('');
                    }}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs cursor-pointer min-h-touch"
                  >
                    {isTa ? 'மறுஆய்வு & முடிவு' : 'Review & Resolve'}
                  </button>
                </div>

                {/* Flag reason note */}
                <div className="p-3 bg-red-50/70 rounded-2xl border border-red-200 text-xs space-y-1 text-red-950">
                  <span className="font-bold block flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    {isTa ? 'கொடியிட்டதற்கான காரணம்:' : 'Flag Reason:'}
                  </span>
                  <p className="italic">"{log.flagReason || (isTa ? 'காரணம் குறிப்பிடப்படவில்லை' : 'No reason provided')}"</p>
                </div>

                {/* Log Description & Photos */}
                {log.description && (
                  <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-100">
                    {log.description}
                  </p>
                )}

                {log.images && log.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {log.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Evidence"
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve Dialog Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-agri-700" />
                <span>{isTa ? 'கொடி மறுஆய்வு & தீர்வு' : 'Resolve Flagged Log'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolve} className="space-y-4 text-xs">
              <p className="text-stone-600 leading-relaxed">
                {isTa
                  ? 'இந்த பதிவை ஆய்வு செய்து சந்தேகக் கொடியை நீக்க விரும்புகிறீர்களா? கள ஆய்வு முடிவை கீழே பதிவு செய்யவும்.'
                  : 'Verify that this log satisfies organic integrity standards before clearing the flag.'}
              </p>

              <div>
                <label htmlFor="resolution-note" className="block font-bold text-stone-800 mb-1">
                  {isTa ? 'நிர்வாகியின் தீர்வு குறிப்பு*' : 'Resolution Notes*'}
                </label>
                <textarea
                  id="resolution-note"
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder={
                    isTa
                      ? 'எ.கா: புகைப்படத்தில் பஞ்சகவ்யா பயன்பாடு தெளிவாக உறுதி செய்யப்பட்டது.'
                      : 'E.g., Verified practice and geotag coordinates with cluster lead.'
                  }
                  required
                  className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                />
              </div>

              {actionError && <p className="text-red-600">{actionError}</p>}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-3.5 py-1.5 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  {t('app.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={resolveMutation.isPending}
                  className="px-4 py-2 font-bold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs"
                >
                  {resolveMutation.isPending
                    ? t('app.saving')
                    : isTa
                    ? 'கொடியை நீக்குக'
                    : 'Clear Flag & Verify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
