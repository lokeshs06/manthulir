import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, MapPin, Sprout, ShieldCheck, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

export const ClusterCard = ({
  cluster,
  currentFarmerId = null,
  onViewDetails,
  onJoin,
  isJoining = false,
}) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const isMember = cluster.members?.some(
    (m) => (m.farmerId?._id || m.farmerId) === currentFarmerId
  );
  const isLead = cluster.members?.some(
    (m) => (m.farmerId?._id || m.farmerId) === currentFarmerId && m.role === 'lead'
  );

  const pendingRequest = cluster.joinRequests?.find(
    (r) => (r.farmerId?._id || r.farmerId) === currentFarmerId && r.status === 'pending'
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-200 hover:border-stone-300 p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>{cluster.district}</span>
            </div>
            <h3 className="font-bold text-stone-900 text-base leading-tight">
              {cluster.name}
            </h3>
          </div>

          {/* Role / Status Badge */}
          {isLead ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              👑 {isTa ? 'தலைவர்' : 'Lead'}
            </span>
          ) : isMember ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{isTa ? 'உறுப்பினர்' : 'Member'}</span>
            </span>
          ) : pendingRequest ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>{isTa ? 'நிலுவையில்' : 'Pending'}</span>
            </span>
          ) : null}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
          <div>
            <span className="text-[11px] text-stone-500 block">{isTa ? 'உறுப்பினர்கள்' : 'Members'}</span>
            <span className="font-bold text-stone-900 text-sm flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-agri-700" />
              <span>{cluster.memberCount || cluster.members?.length || 0}</span>
            </span>
          </div>
          <div>
            <span className="text-[11px] text-stone-500 block">{isTa ? 'மொத்த நிலம்' : 'Total Land'}</span>
            <span className="font-bold text-stone-900 text-sm">
              {cluster.totalLandAcres || 0} {isTa ? 'ஏக்கர்' : 'Acres'}
            </span>
          </div>
        </div>

        {/* Crop Focus chips */}
        {cluster.cropFocus && cluster.cropFocus.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {cluster.cropFocus.map((crop, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-agri-50 text-agri-900 border border-agri-200"
              >
                {crop}
              </span>
            ))}
          </div>
        )}

        {/* Description snippet */}
        {cluster.description && (
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {cluster.description}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(cluster)}
          className="inline-flex items-center gap-1 text-xs font-bold text-agri-700 hover:text-agri-800 p-1 cursor-pointer"
        >
          <span>{isTa ? 'விவரங்களைப் பார்' : 'View Details'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {!isMember && !pendingRequest && onJoin && (
          <button
            type="button"
            onClick={() => onJoin(cluster._id)}
            disabled={isJoining}
            className="px-3.5 py-1.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isJoining ? t('app.saving') : (isTa ? 'இணைய விண்ணப்பி' : 'Join Cluster')}
          </button>
        )}
      </div>
    </div>
  );
};
