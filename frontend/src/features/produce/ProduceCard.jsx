import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Users, IndianRupee, Edit3, Trash2, MessageSquare, Sprout } from 'lucide-react';
import { BadgeTile } from '../../components/common/BadgeTile';
import { PRODUCE_UNITS } from '../../config/constants';

export const ProduceCard = ({
  produce,
  isOwner = false,
  isClusterLead = false,
  onEdit,
  onDeactivate,
  onInquire,
  onClick,
}) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const unitObj = PRODUCE_UNITS.find((u) => u.id === produce.unit);
  const unitLabel = unitObj ? (isTa ? unitObj.ta : unitObj.en) : produce.unit;

  const getCertStatusBadge = (status) => {
    switch (status) {
      case 'certified':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            ✓ {isTa ? 'சான்றளிக்கப்பட்டது' : 'Certified'}
          </span>
        );
      case 'peer-verified':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            👥 {isTa ? 'சக சரிபார்ப்பு' : 'Peer Verified'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
            📝 {isTa ? 'சுய அறிவிப்பு' : 'Self Reported'}
          </span>
        );
    }
  };

  const hasImage = produce.images && produce.images.length > 0;
  const isPooled = Boolean(produce.clusterId);

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-stone-200 hover:border-stone-300 transition-all p-4 sm:p-5 shadow-xs flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div>
        {/* Top Badges & Image Preview */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 mb-3 border border-stone-200">
          {hasImage ? (
            <img
              src={produce.images[0]}
              alt={produce.cropName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-50">
              <Sprout className="w-8 h-8 text-agri-600 mb-1 opacity-70" />
              <span className="text-[11px] text-stone-400">
                {isTa ? 'இயற்கை விளைபொருள்' : 'Organic Produce'}
              </span>
            </div>
          )}

          {/* Floating Trust Badge */}
          <div className="absolute top-2 left-2">
            <BadgeTile badge={produce.badgeLevel || 'none'} size="sm" />
          </div>

          {/* Floating Pooled Tag */}
          {isPooled && (
            <div className="absolute top-2 right-2 bg-agri-800/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
              <Users className="w-3 h-3" />
              <span>{isTa ? 'குழு விற்பனை' : 'Pooled Listing'}</span>
            </div>
          )}
        </div>

        {/* Title & Certification */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-stone-900 text-base leading-tight">
              {isTa && produce.cropNameTa ? produce.cropNameTa : produce.cropName}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{produce.district}</span>
            </div>
          </div>
          <div>{getCertStatusBadge(produce.certificationStatus)}</div>
        </div>

        {/* Quantity & Price */}
        <div className="my-3 p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-stone-500 text-[11px] block">{isTa ? 'இருப்பு அளவு' : 'Available'}</span>
            <span className="font-bold text-stone-900 text-sm">
              {produce.quantity} {unitLabel}
            </span>
          </div>
          <div className="text-right">
            <span className="text-stone-500 text-[11px] block">{isTa ? 'விலை / அலகு' : 'Price / Unit'}</span>
            <span className="font-bold text-agri-700 text-sm flex items-center justify-end">
              ₹{produce.pricePerUnit} / {unitLabel}
            </span>
          </div>
        </div>

        {/* Description snippet */}
        {produce.description && (
          <p className="text-xs text-stone-600 line-clamp-2 mb-3 leading-relaxed">
            {produce.description}
          </p>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        {(isOwner || isClusterLead) ? (
          <div className="flex items-center gap-2 w-full justify-end">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(produce);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('app.edit') || (isTa ? 'திருத்து' : 'Edit')}</span>
              </button>
            )}
            {onDeactivate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeactivate(produce._id);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isTa ? 'நீக்கு' : 'Deactivate'}</span>
              </button>
            )}
          </div>
        ) : (
          onInquire && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInquire(produce);
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer min-h-touch"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isTa ? 'விசாரி / தொடர்பு கொள்' : 'Send Inquiry'}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
