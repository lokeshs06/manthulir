import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sprout, Info, Loader2 } from 'lucide-react';
import { TN_DISTRICTS, TN_DISTRICTS_TA, PRODUCE_UNITS } from '../../config/constants';
import { getApiErrorMessage } from '../../lib/errorHandler';

export const ProduceFormModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSubmit,
  isSubmitting = false,
  isPooled = false,
}) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const [formData, setFormData] = useState({
    cropName: '',
    cropNameTa: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    district: TN_DISTRICTS[0],
    availableFrom: '',
    availableUntil: '',
    description: '',
    imageUrl: '',
  });

  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        cropName: initialData.cropName || '',
        cropNameTa: initialData.cropNameTa || '',
        quantity: initialData.quantity?.toString() || '',
        unit: initialData.unit || 'kg',
        pricePerUnit: initialData.pricePerUnit?.toString() || '',
        district: initialData.district || TN_DISTRICTS[0],
        availableFrom: initialData.availableFrom ? initialData.availableFrom.substring(0, 10) : '',
        availableUntil: initialData.availableUntil ? initialData.availableUntil.substring(0, 10) : '',
        description: initialData.description || '',
        imageUrl: initialData.images?.[0] || '',
      });
    } else {
      setFormData({
        cropName: '',
        cropNameTa: '',
        quantity: '',
        unit: 'kg',
        pricePerUnit: '',
        district: TN_DISTRICTS[0],
        availableFrom: '',
        availableUntil: '',
        description: '',
        imageUrl: '',
      });
    }
    setErrorMsg(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload = {
      cropName: formData.cropName.trim(),
      cropNameTa: formData.cropNameTa.trim() || undefined,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      pricePerUnit: Number(formData.pricePerUnit),
      district: formData.district,
      availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : undefined,
      availableUntil: formData.availableUntil ? new Date(formData.availableUntil).toISOString() : undefined,
      description: formData.description.trim() || undefined,
      images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : undefined,
    };

    if (!payload.cropName || !payload.quantity || !payload.pricePerUnit) {
      setErrorMsg(isTa ? 'அனைத்து கட்டாய விவரங்களையும் உள்ளிடவும்.' : 'Please enter all required fields.');
      return;
    }

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-stone-200 my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-agri-100 flex items-center justify-center text-agri-700">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                {initialData
                  ? (isTa ? 'விளைபொருளைத் திருத்து' : 'Edit Produce Listing')
                  : (isPooled
                      ? (isTa ? 'குழு கூட்டு விற்பனை சேர்க்க' : 'Add Pooled Cluster Listing')
                      : (isTa ? 'புதிய விளைபொருள் சேர்க்க' : 'Add Produce Listing'))}
              </h3>
              <p className="text-xs text-stone-500">
                {isTa ? 'நேரடி இயற்கை சந்தையில் பட்டியலிடவும்' : 'List in natural farming marketplace'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Server-Computed Badge / Status Notice */}
          <div className="p-3 rounded-xl bg-agri-50 border border-agri-200 flex items-start gap-2 text-xs text-agri-900">
            <Info className="w-4 h-4 text-agri-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isTa
                ? 'நம்பகத்தன்மை பேட்ஜ், சான்றிதழ் நிலை மற்றும் மாற்ற மாதம் ஆகியவை உங்கள் சரிபார்ப்பு பதிவுகளின் அடிப்படையில் தானாக கணக்கிடப்படும்.'
                : 'Trust badge level, certification status, and transition month are server-computed from your verified records.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Crop Name (EN / TA) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {isTa ? 'பயிர் / விளைபொருள் பெயர் (ஆங்கிலம்)*' : 'Crop Name (English)*'}
              </label>
              <input
                type="text"
                required
                value={formData.cropName}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                placeholder="e.g. Traditional Red Rice"
                className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {isTa ? 'பயிர் பெயர் (தமிழ்)' : 'Crop Name (Tamil)'}
              </label>
              <input
                type="text"
                value={formData.cropNameTa}
                onChange={(e) => setFormData({ ...formData, cropNameTa: e.target.value })}
                placeholder="எ.கா. மாப்பிள்ளை சம்பா அரிசி"
                className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {isTa ? 'விற்பனை அளவு*' : 'Available Quantity*'}
              </label>
              <input
                type="number"
                required
                min="0.1"
                step="any"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="500"
                className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {isTa ? 'அலகு*' : 'Unit*'}
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white cursor-pointer"
              >
                {PRODUCE_UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {isTa ? u.ta : u.en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price per unit & District */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {isTa ? 'விலை / அலகு (₹)*' : 'Price per Unit (₹)*'}
              </label>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={formData.pricePerUnit}
                onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                placeholder="80"
                className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {isTa ? 'மாவட்டம்*' : 'District*'}
              </label>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white cursor-pointer"
              >
                {TN_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {isTa ? (TN_DISTRICTS_TA[d] || d) : d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {isTa ? 'கிடைக்கும் நாள் முதல்' : 'Available From'}
              </label>
              <input
                type="date"
                value={formData.availableFrom}
                onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                {isTa ? 'கிடைக்கும் நாள் வரை' : 'Available Until'}
              </label>
              <input
                type="date"
                value={formData.availableUntil}
                onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
                className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              {isTa ? 'புகைப்பட இணைய முகவரி (Image URL)' : 'Photo URL'}
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              {isTa ? 'விளக்கம் & சாகுபடி குறிப்பு' : 'Description & Cultivation Note'}
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isTa ? 'இயற்கை உரம் மட்டும் பயன்படுத்தி சாகுபடி செய்யப்பட்டது...' : 'Grown completely without chemical pesticides...'}
              className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
            >
              {t('app.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs transition-colors min-h-touch flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? t('app.saving') : t('app.save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
