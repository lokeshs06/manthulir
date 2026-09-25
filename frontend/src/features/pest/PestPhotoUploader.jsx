import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, Image as ImageIcon, Sparkles, Check, AlertCircle, X, Loader2 } from 'lucide-react';
import { compressImage } from '../../lib/imageCompressor';
import { useDetectPest } from '../../hooks/usePest';
import { getApiErrorMessage } from '../../lib/errorHandler';

export const PestPhotoUploader = ({ onScanComplete, onScanError }) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [consentForTraining, setConsentForTraining] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);
  const [localError, setLocalError] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const detectMutation = useDetectPest();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);
    setOriginalSize(file.size);
    setIsCompressing(true);

    try {
      // Client-side image compression
      const compressed = await compressImage(file, { maxWidth: 1600, quality: 0.75 });
      setSelectedFile(compressed);
      setCompressedSize(compressed.size);

      const objectUrl = URL.createObjectURL(compressed);
      setPreviewUrl(objectUrl);
    } catch (err) {
      console.error('Compression failed, using original', err);
      setSelectedFile(file);
      setCompressedSize(file.size);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setLocalError(isTa ? 'தயவுசெய்து ஒரு புகைப்படத்தைத் தேர்ந்தெடுக்கவும்.' : 'Please select a photo.');
      return;
    }

    setLocalError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('consentForTraining', consentForTraining ? 'true' : 'false');

    try {
      const response = await detectMutation.mutateAsync(formData);
      if (response?.data) {
        onScanComplete(response.data);
      }
    } catch (err) {
      const errMsg = getApiErrorMessage(err);
      setLocalError(errMsg);
      if (onScanError) {
        onScanError(err);
      }
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '';
    const kb = (bytes / 1024).toFixed(0);
    return `${kb} KB`;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-7 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photo Selection Area */}
        {!previewUrl ? (
          <div className="border-2 border-dashed border-stone-300 hover:border-agri-500 rounded-2xl p-6 sm:p-8 text-center transition-colors bg-stone-50/60">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              id="gallery-input"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="camera-input"
            />

            <div className="mx-auto w-14 h-14 rounded-2xl bg-agri-100 flex items-center justify-center text-agri-700 mb-3 shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>

            <h3 className="font-bold text-stone-900 text-base mb-1">
              {t('pests.scanTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-5">
              {t('pests.scanSubtitle')}
            </p>

            {/* Upload action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-sm font-bold shadow-xs transition-colors min-h-touch cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{t('pests.takePhoto')}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-sm font-semibold border border-stone-300 transition-colors min-h-touch cursor-pointer"
              >
                <Upload className="w-4 h-4 text-stone-500" />
                <span>{t('pests.uploadPhoto')}</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-400 mt-4">
              JPG, PNG, WebP • {isTa ? 'குறைந்த அலைவரிசைக்கு தானாக சுருக்கப்படும்' : 'Compressed client-side for low data usage'}
            </p>
          </div>
        ) : (
          /* Preview Mode */
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 max-h-96 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Selected crop preview"
                className="w-full max-h-96 object-contain"
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-3 right-3 p-2 bg-stone-900/80 hover:bg-stone-950 text-white rounded-full transition-colors cursor-pointer"
                title={t('app.cancel')}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Compression stats chip */}
              <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] px-3 py-1 rounded-full border border-white/20 flex items-center gap-2">
                <span>{formatBytes(originalSize)}</span>
                <span>→</span>
                <span className="text-emerald-400 font-bold">{formatBytes(compressedSize)} (சுருக்கப்பட்டது)</span>
              </div>
            </div>

            {/* Retake buttons */}
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
              >
                {isTa ? 'மாற்று படம் எடு' : 'Choose different photo'}
              </button>
            </div>
          </div>
        )}

        {/* Training Consent Checkbox */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
          <input
            id="training-consent"
            type="checkbox"
            checked={consentForTraining}
            onChange={(e) => setConsentForTraining(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-agri-600 rounded border-stone-300 focus:ring-agri-500 cursor-pointer"
          />
          <label htmlFor="training-consent" className="text-xs text-stone-700 leading-relaxed cursor-pointer select-none">
            <span className="font-semibold block text-stone-900 mb-0.5">
              {isTa ? 'மாதிரி மேம்பாட்டு ஒப்புதல்' : 'Model Training Consent'}
            </span>
            {t('pests.consentLabel')}
          </label>
        </div>

        {/* Error Alert */}
        {localError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              {localError}
            </div>
          </div>
        )}

        {/* Submit Scan Button */}
        {previewUrl && (
          <button
            type="submit"
            disabled={detectMutation.isPending || isCompressing}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-agri-600 hover:bg-agri-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all min-h-touch disabled:opacity-50 cursor-pointer"
          >
            {detectMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('pests.analyzing')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isTa ? 'பூச்சி / நோயைக் கண்டறி' : 'Analyze Crop Health'}</span>
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
};
