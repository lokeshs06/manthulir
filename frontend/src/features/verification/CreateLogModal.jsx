import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateVerificationLog } from '../../hooks/useVerification';
import { VERIFICATION_ENTRY_TYPES } from '../../config/constants';
import { compressImage } from '../../lib/imageCompressor';
import { getApiErrorMessage } from '../../lib/errorHandler';
import {
  X,
  Camera,
  Upload,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const CreateLogModal = ({ onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const createMutation = useCreateVerificationLog();

  const [entryType, setEntryType] = useState('panchagavya-application');
  const [description, setDescription] = useState('');
  const [capturedAt, setCapturedAt] = useState(
    new Date().toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
  );
  const [coords, setCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [serverError, setServerError] = useState('');

  // Handle Geolocation capture
  const captureLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus(isTa ? 'இருப்பிட வசதி ஆதரிக்கப்படவில்லை' : 'Geolocation not supported');
      return;
    }
    setGeoStatus(isTa ? 'இருப்பிடம் பெறுகிறது...' : 'Locating...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setGeoStatus(
          `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        );
      },
      () => {
        setGeoStatus(isTa ? 'இருப்பிடம் பெறுவதில் பிழை' : 'Location access denied');
      },
      { timeout: 10000 }
    );
  };

  // Handle image files selection and previews
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    setSelectedFiles(files);

    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setIsCompressing(true);

    try {
      // Client-side image compression for low-bandwidth 3G/4G
      const compressedFiles = await Promise.all(
        selectedFiles.map((file) => compressImage(file))
      );
      setIsCompressing(false);

      const formData = new FormData();
      formData.append('entryType', entryType);
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      formData.append('capturedAt', new Date(capturedAt).toISOString());

      if (coords) {
        formData.append('lat', String(coords.lat));
        formData.append('lng', String(coords.lng));
      }

      compressedFiles.forEach((file) => {
        formData.append('images', file);
      });

      await createMutation.mutateAsync(formData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setIsCompressing(false);
      setServerError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200 overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-agri-100 text-agri-800 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              {isTa ? 'சரிபார்ப்பு பதிவு சேர்த்தல்' : 'New Field Verification Log'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {serverError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Entry Type Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {isTa ? 'செயல்பாட்டு வகை' : 'Practice Type'} *
            </label>
            <select
              value={entryType}
              onChange={(e) => setEntryType(e.target.value)}
              className="w-full text-sm font-medium border border-stone-300 rounded-xl px-3.5 py-3 bg-stone-50 focus:bg-white min-h-touch"
              required
            >
              {VERIFICATION_ENTRY_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {isTa ? type.ta : type.en}
                </option>
              ))}
            </select>
          </div>

          {/* Captured At */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {isTa ? 'செயல்படுத்திய நேரம்' : 'Captured Date & Time'} *
            </label>
            <input
              type="datetime-local"
              max={new Date().toISOString().slice(0, 16)}
              value={capturedAt}
              onChange={(e) => setCapturedAt(e.target.value)}
              className="w-full text-sm font-medium border border-stone-300 rounded-xl px-3.5 py-3 bg-stone-50 focus:bg-white min-h-touch"
              required
            >
            </input>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              {isTa ? 'விளக்கம் / குறிப்புகள்' : 'Description / Field Notes'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isTa
                  ? 'எ.கா. 5 ஏக்கர் நெல் வயலுக்கு 200 லிட்டர் ஜீவாமிர்தம் பாசன நீரில் கலந்து விடப்பட்டது.'
                  : 'e.g. Applied 200L Jeevamrutham through flood irrigation for 5 acres of paddy.'
              }
              className="w-full text-sm font-medium border border-stone-300 rounded-xl p-3.5 bg-stone-50 focus:bg-white resize-none"
            />
          </div>

          {/* Photo Upload (Up to 3 photos) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                {isTa ? 'பண்ணை புகைப்படங்கள் (அதிகபட்சம் 3)' : 'Field Photos (Max 3)'}
              </label>
              <span className="text-[10px] text-stone-400 font-medium">
                {isTa ? 'தானாக சுருக்கப்படும்' : 'Client-compressed'}
              </span>
            </div>

            <div className="border-2 border-dashed border-stone-200 rounded-xl p-4 text-center hover:border-agri-400 transition-colors bg-stone-50/50">
              <input
                type="file"
                id="log-photos"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="log-photos"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="w-6 h-6 text-agri-700" />
                <span className="text-xs font-bold text-stone-800">
                  {isTa ? 'புகைப்படங்களைத் தேர்ந்தெடுக்கவும்' : 'Tap to select photos'}
                </span>
                <span className="text-[10px] text-stone-500">
                  JPEG, PNG, WebP (Max 3)
                </span>
              </label>
            </div>

            {/* Previews */}
            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2.5">
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-100"
                  >
                    <img
                      src={url}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-stone-900/70 text-white text-[9px] px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Geolocation Pin */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <MapPin className="w-4 h-4 text-agri-700" />
              <span>{geoStatus || (isTa ? 'இருப்பிடம் இணைக்கப்படவில்லை' : 'No GPS attached')}</span>
            </div>
            <button
              type="button"
              onClick={captureLocation}
              className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-800 font-bold hover:bg-stone-100 min-h-touch"
            >
              {isTa ? 'GPS இணை' : 'Attach GPS'}
            </button>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 min-h-touch"
            >
              {t('app.cancel')}
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || isCompressing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold shadow-sm transition-all min-h-touch disabled:opacity-60"
            >
              {isCompressing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isTa ? 'படங்கள் சுருக்கப்படுகிறது...' : 'Compressing photos...'}</span>
                </>
              ) : createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('app.saving')}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isTa ? 'பதிவைச் சமர்ப்பி' : 'Submit Entry'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
