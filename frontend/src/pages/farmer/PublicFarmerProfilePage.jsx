import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Users,
  Award,
  FileCheck2,
  Lock,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { usePublicFarmer, usePublicFarmerLogs } from '../../hooks/usePublicFarmer';
import { BadgeTile } from '../../components/common/BadgeTile';
import { LogCard } from '../../features/verification/LogCard';

export const PublicFarmerProfilePage = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const { data: farmerRes, isLoading: farmerLoading, isError: farmerError } = usePublicFarmer(id);
  const { data: logsRes, isLoading: logsLoading } = usePublicFarmerLogs(id);

  const farmer = farmerRes?.data || {};
  const logs = logsRes?.data || [];

  if (farmerLoading) {
    return <div className="py-16 text-center text-stone-500 text-sm">{t('app.loading')}</div>;
  }

  if (farmerError || !farmer) {
    return (
      <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-4 max-w-lg mx-auto">
        <h3 className="text-base font-bold text-stone-900">
          {isTa ? 'விவசாயி சுயவிவரம் கிடைக்கவில்லை' : 'Farmer Profile Not Found'}
        </h3>
        <p className="text-xs text-stone-500">
          {isTa
            ? 'இந்த சுயவிவரம் பொதுப் பார்வைக்கு கிடைக்கவில்லை அல்லது நீக்கப்பட்டிருக்கலாம்.'
            : 'The requested farmer trust profile does not exist or has been made private.'}
        </p>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-agri-800 bg-agri-100 hover:bg-agri-200 rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isTa ? 'சந்தைக்குத் திரும்பு' : 'Back to Marketplace'}</span>
        </Link>
      </div>
    );
  }

  const badgeLevel = farmer.badgeLevel || farmer.trustBadge || 'bronze';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back Navigation */}
      <div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isTa ? 'சந்தைப் பக்கத்திற்குத் திரும்பு' : 'Back to Marketplace'}</span>
        </Link>
      </div>

      {/* Trust Profile Header Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-radial from-agri-100/60 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 font-bold text-[11px] border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isTa ? 'சரிபார்க்கப்பட்ட இயற்கை விவசாயி' : 'Verified Natural Farmer'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
              {farmer.name || (isTa ? 'இயற்கை விவசாயி' : 'Natural Farmer')}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
              {farmer.district && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{farmer.district}</span>
                </span>
              )}
              {farmer.transitionMonth !== undefined && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    {isTa ? 'இயற்கை மாற்ற மாதம்' : 'Transition Month'}: {farmer.transitionMonth}
                  </span>
                </span>
              )}
              {farmer.clusterCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    {farmer.clusterCount} {isTa ? 'குழுக்களில் உறுப்பினர்' : 'Clusters affiliated'}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Trust Badge Visual Tile */}
          <div className="shrink-0 bg-stone-50 p-4 rounded-3xl border border-stone-200/80 text-center">
            <BadgeTile level={badgeLevel} size="lg" />
            <div className="text-[11px] text-stone-500 font-medium mt-1">
              {farmer.logCount || logs.length} {isTa ? 'பதிவுகள் சரிபார்க்கப்பட்டது' : 'logs verified'}
            </div>
          </div>
        </div>

        {/* Privacy Shield Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex items-start gap-3 text-xs text-amber-950">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              {isTa ? 'தனிநபர் தகவல் & தொடர்பு எண் பாதுகாப்பு' : 'Farmer Contact Privacy Shield'}
            </span>
            <p className="leading-relaxed text-amber-900/90">
              {isTa
                ? 'விவசாயிகளின் தனிப்பட்ட தொலைபேசி எண் மற்றும் முகவரி பாதுகாக்கப்பட்டுள்ளது. நீங்கள் சந்தைப் பக்கத்தில் இவரின் விளைபொருட்களைத் தேர்வு செய்து நேரடி விசாரணை அனுப்பும்போது, விவசாயி ஏற்றுக்கொண்டதும் தொடர்பு எண் பகிரப்படும்.'
                : 'Farmer phone numbers are not shown publicly to prevent spam. To contact this farmer, browse active listings and send a purchase inquiry.'}
            </p>
          </div>
        </div>
      </div>

      {/* Verification Trail Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-agri-700" />
              <span>{isTa ? 'பொது சரிபார்ப்பு வரலாறு (தடயம்)' : 'Public Verification Trail'}</span>
            </h2>
            <p className="text-xs text-stone-500">
              {isTa
                ? 'பூச்சி மேலாண்மை, சாணம்/ஜீவாமிர்தம் பயன்பாடு மற்றும் சக விவசாயிகளின் சரிபார்ப்புப் பதிவுகள்'
                : 'Immutable timeline of timestamped organic practices, photos, and peer sign-offs'}
            </p>
          </div>
          <span className="text-xs font-bold text-agri-800 bg-agri-100 px-3 py-1 rounded-full">
            {logs.length} {isTa ? 'பதிவுகள்' : 'logs'}
          </span>
        </div>

        {logsLoading ? (
          <div className="py-8 text-center text-stone-500 text-xs">{t('app.loading')}</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
            <Award className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs text-stone-500">
              {isTa ? 'சரிபார்க்கப்பட்ட பொதுப் பதிவுகள் எதுவும் இல்லை.' : 'No public verification logs recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <LogCard
                key={log._id}
                log={log}
                currentFarmerId={null}
                viewerClusterIds={[]}
                onPeerVerify={null}
                onFlag={null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
