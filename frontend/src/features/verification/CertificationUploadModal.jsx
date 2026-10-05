import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUploadCertification } from '../../hooks/useVerification';
import { getApiErrorMessage } from '../../lib/errorHandler';
import { compressImage } from '../../lib/imageCompressor';
import {
  X,
  Upload,
  Award,
  AlertCircle,
  Loader2,
  FileCheck,
  Calendar,
} from 'lucide-react';

export const CertificationUploadModal = ({ currentStatus, onClose }) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const uploadMutation = useUploadCertification();

  const [documentFile, setDocumentFile] = useState(null);
  const [certificateNumber, setCertificateNumber] = useState('');
  const [issuedBy, setIssuedBy] = useState('');
  const [validTo, setValidTo] = useState('');
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentFile) {
      setServerError(isTa ? 'சான்றிதழ் ஆவணம் தேர்ந்தெடுக்கப்பட வேண்டும்' : 'Document file is required');
      return;
    }

    setServerError('');
    try {
      // Compress if image
      const processedFile = await compressImage(documentFile);

      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('document', processedFile);
      if (certificateNumber.trim()) {
        formData.append('certificateNumber', certificateNumber.trim());
      }
      if (issuedBy.trim()) {
        formData.append('issuedBy', issuedBy.trim());
      }
      if (validTo) {
        formData.append('validTo', validTo);
      }

      await uploadMutation.mutateAsync(formData);
      onClose();
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              {isTa ? 'இயற்கை சான்றிதழ் சமர்ப்பிப்பு' : 'Upload Certification Document'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {serverError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Current Status banner if any */}
          {currentStatus && currentStatus !== 'none' && (
            <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-xs flex items-center justify-between">
              <span className="text-stone-600 font-medium">
                {isTa ? 'தற்போதைய மதிப்பாய்வு நிலை:' : 'Current review status:'}
              </span>
              <span className="font-bold capitalize px-2 py-0.5 rounded bg-white text-agri-800 border border-stone-200">
                {currentStatus}
              </span>
            </div>
          )}

          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {isTa ? 'சான்றிதழ் ஆவணம் (PDF அல்லது படம்)' : 'Certificate Document (PDF or Photo)'} *
            </label>
            <div className="border-2 border-dashed border-stone-200 rounded-xl p-4 text-center hover:border-agri-400 transition-colors bg-stone-50/50">
              <input
                type="file"
                id="cert-file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="cert-file"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="w-6 h-6 text-agri-700" />
                <span className="text-xs font-bold text-stone-800">
                  {documentFile ? documentFile.name : isTa ? 'கோப்பைத் தேர்ந்தெடுக்கவும்' : 'Choose Document File'}
                </span>
                <span className="text-[10px] text-stone-500">PDF, JPG, PNG (Max 5MB)</span>
              </label>
            </div>
          </div>

          {/* Certificate Number */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {isTa ? 'சான்றிதழ் எண்' : 'Certificate Number'}
            </label>
            <input
              type="text"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              placeholder={isTa ? 'எ.கா. TNOCD-ORG-2026-1049' : 'e.g. TNOCD-ORG-2026-1049'}
              className="w-full text-sm font-medium border border-stone-300 rounded-xl px-3.5 py-2.5 bg-stone-50 focus:bg-white min-h-touch"
            />
          </div>

          {/* Issued By */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {isTa ? 'வழங்கிய நிறுவனம்' : 'Issued By'}
            </label>
            <input
              type="text"
              value={issuedBy}
              onChange={(e) => setIssuedBy(e.target.value)}
              placeholder={isTa ? 'எ.கா. TNOCD / Aditi Organic / INDOCERT' : 'e.g. TNOCD / Aditi / INDOCERT'}
              className="w-full text-sm font-medium border border-stone-300 rounded-xl px-3.5 py-2.5 bg-stone-50 focus:bg-white min-h-touch"
            />
          </div>

          {/* Valid To */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {isTa ? 'செல்லுபடியாகும் காலம் வரை' : 'Valid Until'}
            </label>
            <input
              type="date"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
              className="w-full text-sm font-medium border border-stone-300 rounded-xl px-3.5 py-2.5 bg-stone-50 focus:bg-white min-h-touch"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 min-h-touch"
            >
              {t('app.cancel')}
            </button>
            <button
              type="submit"
              disabled={uploadMutation.isPending || !documentFile}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold shadow-sm transition-all min-h-touch disabled:opacity-50"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('app.saving')}</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>{isTa ? 'சமர்ப்பி' : 'Submit for Review'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
