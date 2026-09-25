import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Calendar, User, Phone, CheckCircle2, XCircle, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { useUpdateInquiryStatus } from '../../hooks/useInquiries';
import { getApiErrorMessage } from '../../lib/errorHandler';

export const InquiryCard = ({ inquiry, isFarmerView = true }) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const updateMutation = useUpdateInquiryStatus();

  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [farmerResponse, setFarmerResponse] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  const dateStr = new Date(inquiry.createdAt).toLocaleDateString(
    isTa ? 'ta-IN' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isTa ? 'ஏற்றுக்கொள்ளப்பட்டது' : 'Accepted'}</span>
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3" />
            <span>{isTa ? 'நிராகரிக்கப்பட்டது' : 'Declined'}</span>
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
            <span>{isTa ? 'நிறைவடைந்தது' : 'Closed'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            <span>{isTa ? 'பரிசீலனையில்' : 'Open'}</span>
          </span>
        );
    }
  };

  const handleDecision = async (status) => {
    setErrorMsg(null);
    try {
      await updateMutation.mutateAsync({
        id: inquiry._id,
        status,
        farmerResponse: farmerResponse.trim() || undefined,
      });
      setShowAcceptDialog(false);
      setShowDeclineDialog(false);
      setFarmerResponse('');
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err));
    }
  };

  const produceName = inquiry.produceId?.cropName || (isTa ? 'விளைபொருள்' : 'Produce');

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-3">
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold text-agri-700 block mb-0.5">
            {produceName}
          </span>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-semibold text-stone-700">
              {inquiry.buyerId?.name || (isTa ? 'வாங்குபவர்' : 'Buyer')}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-stone-400" />
              <span>{dateStr}</span>
            </span>
          </div>
        </div>
        <div>{getStatusBadge(inquiry.status)}</div>
      </div>

      {/* Inquiry Message & Requested Qty */}
      <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-1.5">
        {inquiry.requestedQuantity && (
          <div className="text-stone-700 font-semibold">
            {isTa ? 'தேவைப்படும் அளவு:' : 'Requested Quantity:'}{' '}
            <span className="text-agri-900 font-bold">{inquiry.requestedQuantity}</span>
          </div>
        )}
        {inquiry.message && (
          <p className="text-stone-600 leading-relaxed italic">
            "{inquiry.message}"
          </p>
        )}
      </div>

      {/* Farmer Response if any */}
      {inquiry.farmerResponse && (
        <div className="p-2.5 rounded-xl bg-agri-50/50 border border-agri-200 text-xs text-agri-950">
          <span className="font-bold block mb-0.5">
            {isTa ? 'விவசாயியின் பதில்:' : 'Farmer Response:'}
          </span>
          <p className="text-stone-700">{inquiry.farmerResponse}</p>
        </div>
      )}

      {/* Contact Phone: ONLY revealed if accepted in buyer view */}
      {inquiry.farmerContactPhone && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
          <span className="text-emerald-900 font-semibold flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>{isTa ? 'விவசாயி தொடர்பு எண்:' : 'Farmer Contact Phone:'}</span>
          </span>
          <a
            href={`tel:${inquiry.farmerContactPhone}`}
            className="font-bold text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-300 shadow-2xs hover:bg-emerald-100"
          >
            {inquiry.farmerContactPhone}
          </a>
        </div>
      )}

      {/* Decision Buttons (for farmer view when status === 'open') */}
      {isFarmerView && inquiry.status === 'open' && (
        <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowDeclineDialog(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
          >
            {isTa ? 'மறுக்க' : 'Decline'}
          </button>
          <button
            type="button"
            onClick={() => setShowAcceptDialog(true)}
            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer min-h-touch flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isTa ? 'ஏற்றுக்கொள்' : 'Accept Inquiry'}</span>
          </button>
        </div>
      )}

      {/* Accept Warning Confirmation Dialog */}
      {showAcceptDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{isTa ? 'விசாரணை ஏற்பு & தொலைபேசி எண் பகிர்தல்' : 'Accept & Reveal Contact Phone'}</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 leading-relaxed">
              <strong>{isTa ? 'முக்கிய அறிவிப்பு:' : 'Important Notice:'}</strong>{' '}
              {isTa
                ? 'இந்த விசாரணையை ஏற்றுக்கொள்வது உங்கள் பதிவுசெய்யப்பட்ட தொலைபேசி எண்ணை வாங்குபவருக்கு வெளிப்படுத்தும். நீங்கள் நேரடியாக பேசி வணிகத்தை உறுதிப்படுத்தலாம்.'
                : 'Accepting this inquiry will reveal your phone number to the buyer so they can contact you directly.'}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isTa ? 'வாங்குபவருக்கான செய்தி (விருப்பத்தேர்வு)' : 'Response Note (Optional)'}
              </label>
              <input
                type="text"
                value={farmerResponse}
                onChange={(e) => setFarmerResponse(e.target.value)}
                placeholder={isTa ? 'எ.கா. நாளை காலை அழைக்கவும்' : 'e.g. Please call tomorrow morning'}
                className="w-full text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
              />
            </div>

            {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowAcceptDialog(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                {t('app.cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDecision('accepted')}
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isTa ? 'ஏற்று எண் பகிரவும்' : 'Confirm & Accept'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Confirmation Dialog */}
      {showDeclineDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-xl border border-stone-200 space-y-4">
            <h4 className="font-bold text-stone-900 text-sm">
              {isTa ? 'விசாரணையை நிராகரிக்கவா?' : 'Decline Inquiry?'}
            </h4>
            <input
              type="text"
              value={farmerResponse}
              onChange={(e) => setFarmerResponse(e.target.value)}
              placeholder={isTa ? 'காரணம் (எ.கா. இருப்பு முடிந்துவிட்டது)' : 'Reason (e.g. stock sold out)'}
              className="w-full text-xs border border-stone-300 rounded-xl px-3 py-2 bg-stone-50"
            />
            {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowDeclineDialog(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                {t('app.cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDecision('declined')}
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                {isTa ? 'நிராகரி' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
