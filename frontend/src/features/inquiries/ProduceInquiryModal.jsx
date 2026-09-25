import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { X, Send, ShieldCheck, AlertCircle, ShoppingBag, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCreateInquiry } from '../../hooks/useInquiries';
import { BadgeTile } from '../../components/common/BadgeTile';

export const ProduceInquiryModal = ({ isOpen, onClose, produce, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [requestedQuantity, setRequestedQuantity] = useState(
    produce?.quantity ? Math.min(produce.quantity, 100) : 50
  );
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  const createInquiryMutation = useCreateInquiry();

  if (!isOpen || !produce) return null;

  const isBuyer = isAuthenticated && user?.role === 'buyer';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!requestedQuantity || Number(requestedQuantity) <= 0) {
      setFormError(isTa ? 'தயவுசெய்து சரியான அளவை உள்ளிடவும்.' : 'Please specify a valid quantity.');
      return;
    }

    if (!message.trim()) {
      setFormError(isTa ? 'தயவுசெய்து உங்கள் செய்தி அல்லது தேவையை குறிப்பிடவும்.' : 'Please include a brief message or requirements.');
      return;
    }

    try {
      await createInquiryMutation.mutateAsync({
        produceId: produce._id,
        data: {
          requestedQuantity: Number(requestedQuantity),
          message: message.trim(),
        },
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setFormError(
        err.response?.data?.error?.message ||
          (isTa ? 'விசாரணை அனுப்புவதில் பிழை ஏற்பட்டது.' : 'Failed to submit inquiry. Please try again.')
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                {isTa ? 'விவசாயிக்கு நேரடி வர்த்தக விசாரணை' : 'Send Direct Produce Inquiry'}
              </h3>
              <p className="text-[11px] text-stone-500">
                {isTa ? 'நடுவர் தரகர் இன்றி நேரடி இயற்கை கொள்முதல்' : 'Direct farm-to-table inquiry with no middlemen'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Produce Overview Snapshot */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-sm font-bold text-stone-900 block">
              {isTa ? produce.cropNameTa || produce.cropName : produce.cropName}
            </span>
            <div className="text-xs text-stone-600 flex items-center gap-2">
              <span>{produce.district}</span>
              <span>•</span>
              <span className="font-bold text-agri-900">
                ₹{produce.pricePerUnit} / {produce.unit}
              </span>
              <span>•</span>
              <span>
                {isTa ? 'இருப்பு' : 'Avail'}: {produce.quantity} {produce.unit}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <BadgeTile level={produce.badgeLevel || 'bronze'} size="sm" showLabel={false} />
          </div>
        </div>

        {/* Authentication State Handling */}
        {!isAuthenticated ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-center">
            <Lock className="w-8 h-8 text-amber-700 mx-auto" />
            <div>
              <h4 className="font-bold text-amber-950 text-sm">
                {isTa ? 'வாங்குபவராக உள்நுழையவும்' : 'Buyer Login Required'}
              </h4>
              <p className="text-xs text-amber-800/90 mt-1">
                {isTa
                  ? 'விவசாயிகளுக்கு நேரடியாக வர்த்தக விசாரணை அனுப்ப வாங்குபவர் கணக்கு தேவை.'
                  : 'You must be logged in as a buyer to send inquiries to farmers.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs"
              >
                {t('nav.login')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/register');
                }}
                className="px-4 py-2 text-xs font-bold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl"
              >
                {t('nav.register')}
              </button>
            </div>
          </div>
        ) : !isBuyer ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-amber-700 mx-auto" />
            <p className="text-xs text-amber-900 font-medium">
              {isTa
                ? 'உங்கள் கணக்கு விவசாயி வகையாக உள்ளது. உற்பத்திப் பொருட்களுக்கு விசாரணை அனுப்ப வாங்குபவர் கணக்கு தேவை.'
                : 'You are logged in as a farmer. Inquiries can only be submitted by registered buyers.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Privacy Notice */}
            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>{isTa ? 'தொடர்பு எண் பாதுகாப்பு:' : 'Contact Phone Protected:'}</strong>{' '}
                {isTa
                  ? 'விவசாயி உங்கள் விசாரணையை ஏற்கும் வரை உங்கள் தொடர்பு எண் வெளிப்படாது. அதேபோல் விவசாயியின் தொடர்பு எண்ணும் அவர் ஏற்ற பின்னரே உங்களுக்குத் தெரியவரும்.'
                  : 'Phone numbers remain private until the farmer accepts your inquiry. Once accepted, direct phone contacts are unlocked for both parties.'}
              </p>
            </div>

            {/* Requested Quantity */}
            <div>
              <label htmlFor="inquiry-quantity" className="block text-xs font-bold text-stone-800 mb-1">
                {isTa ? 'தேவைப்படும் அளவு*' : 'Requested Quantity*'} ({produce.unit})
              </label>
              <input
                id="inquiry-quantity"
                type="number"
                min="1"
                max={produce.quantity || undefined}
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(e.target.value)}
                required
                className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="inquiry-message" className="block text-xs font-bold text-stone-800 mb-1">
                {isTa ? 'விசாரணைச் செய்தி / கொள்முதல் விவரம்*' : 'Inquiry Message / Delivery Requirements*'}
              </label>
              <textarea
                id="inquiry-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isTa
                    ? 'எ.கா: வாரந்தோறும் 50 கிலோ தேவைப்படும். சென்னைக்கு டெலிவரி செய்ய முடியுமா?'
                    : 'E.g., Interested in regular weekly supply of 50kg. Can you ship to Chennai?'
                }
                required
                className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
              />
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
              >
                {t('app.cancel')}
              </button>
              <button
                type="submit"
                disabled={createInquiryMutation.isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer min-h-touch"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {createInquiryMutation.isPending
                    ? t('app.saving')
                    : isTa
                    ? 'விசாரணை அனுப்பு'
                    : 'Submit Inquiry'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
