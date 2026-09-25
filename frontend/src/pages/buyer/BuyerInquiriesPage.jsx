import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Inbox,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { useSentInquiries } from '../../hooks/useInquiries';

export const BuyerInquiriesPage = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading, isError, refetch } = useSentInquiries();
  const inquiries = data?.data || [];

  const filteredInquiries = inquiries.filter((inq) => {
    if (statusFilter === 'all') return true;
    return inq.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            <span>{isTa ? 'ஏற்றுக்கொள்ளப்பட்டது' : 'Accepted'}</span>
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-200">
            <XCircle className="w-3 h-3 text-red-700" />
            <span>{isTa ? 'மறுக்கப்பட்டது' : 'Declined'}</span>
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
            <Clock className="w-3 h-3 text-stone-500" />
            <span>{isTa ? 'முடிவடைந்தது' : 'Closed'}</span>
          </span>
        );
      case 'open':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>{isTa ? 'பரிசீலனையில்' : 'Pending Review'}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-agri-700" />
            <span>{isTa ? 'என் நேரடி விசாரணைகள்' : 'Sent Inquiries & Orders'}</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {isTa
              ? 'விவசாயிகளிடம் இயற்கை விளைபொருட்கள் வாங்க நீங்கள் அனுப்பிய விசாரணைகள் மற்றும் தொடர்பு நிலை'
              : 'Direct produce purchase inquiries sent to natural farmers'}
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="inline-flex p-1 bg-stone-100 rounded-2xl border border-stone-200 self-start sm:self-auto">
          {['all', 'open', 'accepted', 'declined'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                statusFilter === s
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {s === 'all'
                ? t('app.all')
                : s === 'open'
                ? isTa ? 'பரிசீலனை' : 'Pending'
                : s === 'accepted'
                ? isTa ? 'ஏற்றவை' : 'Accepted'
                : isTa ? 'மறுக்கப்பட்டவை' : 'Declined'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Feed */}
      {isLoading ? (
        <div className="py-12 text-center text-stone-500 text-sm">{t('app.loading')}</div>
      ) : isError ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{t('app.error')}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-bold underline cursor-pointer"
          >
            {t('app.retry')}
          </button>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <Inbox className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">
            {isTa ? 'விசாரணைகள் எதுவும் இல்லை' : 'No inquiries found'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {isTa
              ? 'சந்தைப் பக்கத்தில் உள்ள இயற்கை விளைபொருட்களைப் பார்த்து விவசாயிகளுக்கு விசாரணை அனுப்பலாம்.'
              : 'Browse our organic marketplace and send inquiries directly to verified farmers.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInquiries.map((inq) => {
            const isAccepted = inq.status === 'accepted';
            const farmerPhone = inq.farmerPhone || inq.farmerId?.phone;
            const cropName =
              inq.produceId?.cropNameTa || inq.produceId?.cropName || (isTa ? 'இயற்கை விளைபொருள்' : 'Produce');
            const farmerName = inq.farmerId?.name || (isTa ? 'விவசாயி' : 'Farmer');

            return (
              <div
                key={inq._id}
                className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-agri-700 block">{cropName}</span>
                      <span className="text-sm font-bold text-stone-900">{farmerName}</span>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>{getStatusBadge(inq.status)}</div>
                  </div>

                  {/* Quantity & Message */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-stone-600">
                      <span>{isTa ? 'கேட்கப்பட்ட அளவு' : 'Requested Quantity'}:</span>
                      <span className="font-bold text-stone-900">
                        {inq.requestedQuantity} {inq.produceId?.unit || 'kg'}
                      </span>
                    </div>
                    {inq.message && (
                      <p className="text-stone-600 italic border-t border-stone-200/60 pt-1 leading-relaxed">
                        "{inq.message}"
                      </p>
                    )}
                  </div>

                  {/* Farmer Response if present */}
                  {inq.farmerResponse && (
                    <div className="p-3 bg-agri-50/60 rounded-2xl border border-agri-200 text-xs text-agri-950 space-y-1">
                      <span className="font-bold block flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-agri-700" />
                        {isTa ? 'விவசாயியின் பதில்:' : "Farmer's Response:"}
                      </span>
                      <p className="leading-relaxed">{inq.farmerResponse}</p>
                    </div>
                  )}
                </div>

                {/* Contact Phone Number Privacy Gate */}
                <div className="pt-3 border-t border-stone-100">
                  {isAccepted ? (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{isTa ? 'விவசாயி தொடர்பு எண்:' : "Farmer's Direct Phone:"}</span>
                        </span>
                        <a
                          href={`tel:${farmerPhone}`}
                          className="font-black text-emerald-800 hover:underline tracking-wide"
                        >
                          {farmerPhone || (isTa ? 'கிடைக்கவில்லை' : 'N/A')}
                        </a>
                      </div>

                      {farmerPhone && (
                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={`tel:${farmerPhone}`}
                            className="flex-1 text-center py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-[11px] shadow-xs"
                          >
                            {isTa ? 'அழைக்கவும்' : 'Call Farmer'}
                          </a>
                          <a
                            href={`https://wa.me/91${farmerPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold text-[11px] border border-emerald-300 flex items-center justify-center gap-1"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-[11px] text-stone-500 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>
                        {isTa
                          ? 'விவசாயி இந்த விசாரணையை ஏற்ற பின்னரே தொடர்பு எண் பகிரப்படும்.'
                          : 'Farmer phone revealed only after inquiry is accepted.'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
