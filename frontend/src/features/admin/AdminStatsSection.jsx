import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Sprout, ShoppingBag, Award, Bug, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdmin';

export const AdminStatsSection = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const { data: statsRes, isLoading, isError, refetch } = useAdminStats();
  const stats = statsRes?.data || {};

  if (isLoading) {
    return <div className="py-12 text-center text-stone-500 text-sm">{t('app.loading')}</div>;
  }

  if (isError) {
    return (
      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
        <span>{t('app.error')}</span>
        <button type="button" onClick={() => refetch()} className="font-bold underline">
          {t('app.retry')}
        </button>
      </div>
    );
  }

  const farmerStatus = stats.farmersByStatus || { transitioning: 0, certified: 0, chemical: 0 };
  const districtCounts = stats.farmersByDistrict || [];
  const detectionsPerWeek = stats.detectionsPerWeek || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Farmers */}
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">
              {isTa ? 'மொத்த விவசாயிகள்' : 'Total Farmers'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats.totalFarmers || 0}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block">
            {farmerStatus.transitioning || 0} {isTa ? 'மாற்றத்தில்' : 'transitioning'}
          </span>
        </div>

        {/* Active Produce Listings */}
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">
              {isTa ? 'விற்பனைப் பொருட்கள்' : 'Produce Listings'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats.activeListings || 0}
          </div>
          <span className="text-[11px] text-stone-500 font-medium block">
            {isTa ? 'நேரடி இயற்கை சந்தை' : 'Active on marketplace'}
          </span>
        </div>

        {/* Farmer Clusters */}
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">
              {isTa ? 'விவசாயக் குழுக்கள்' : 'Farmer Clusters'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">
            {stats.activeClusters || 0}
          </div>
          <span className="text-[11px] text-stone-500 font-medium block">
            {isTa ? 'கூட்டு விற்பனை & சாகுபடி' : 'FPOs & Collective units'}
          </span>
        </div>

        {/* Pending Action Items */}
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">
              {isTa ? 'மறுஆய்வு கோரிக்கைகள்' : 'Pending Review'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950">
            {(stats.pendingCertifications || 0) + (stats.flaggedLogs || 0)}
          </div>
          <span className="text-[11px] text-amber-800 font-medium block">
            {stats.pendingCertifications || 0} {isTa ? 'சான்றிதழ்' : 'certs'} • {stats.flaggedLogs || 0}{' '}
            {isTa ? 'கொடிகள்' : 'flags'}
          </span>
        </div>
      </div>

      {/* Two Column Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Farmers Transition Status Breakdown */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-agri-700" />
            <span>{isTa ? 'இயற்கை மாற்ற நிலை வகைப்பாடு' : 'Farmers Transition Status'}</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-stone-700">{isTa ? 'இயற்கை மாற்றத்தில் (In-Transition)' : 'Transitioning'}</span>
                <span className="font-bold text-agri-900">{farmerStatus.transitioning || 0}</span>
              </div>
              <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-agri-600 rounded-full"
                  style={{
                    width: `${
                      stats.totalFarmers ? ((farmerStatus.transitioning || 0) / stats.totalFarmers) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-stone-700">{isTa ? 'அங்கீகரிக்கப்பட்ட இயற்கை (Certified)' : 'Certified Organic'}</span>
                <span className="font-bold text-emerald-900">{farmerStatus.certified || 0}</span>
              </div>
              <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{
                    width: `${
                      stats.totalFarmers ? ((farmerStatus.certified || 0) / stats.totalFarmers) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-stone-700">{isTa ? 'இரசாயன வேளாண்மை (Pre-Transition)' : 'Chemical / Conventional'}</span>
                <span className="font-bold text-stone-600">{farmerStatus.chemical || 0}</span>
              </div>
              <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-stone-400 rounded-full"
                  style={{
                    width: `${
                      stats.totalFarmers ? ((farmerStatus.chemical || 0) / stats.totalFarmers) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Districts */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-agri-700" />
            <span>{isTa ? 'முன்னணி மாவட்டங்கள்' : 'Top Transition Districts'}</span>
          </h3>

          {districtCounts.length === 0 ? (
            <p className="text-xs text-stone-500 italic py-4">
              {isTa ? 'மாவட்ட விவரங்கள் கிடைக்கவில்லை' : 'No district records yet.'}
            </p>
          ) : (
            <div className="space-y-2.5 max-h-52 overflow-y-auto">
              {districtCounts.slice(0, 5).map((d, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs"
                >
                  <span className="font-semibold text-stone-800">{d.district || d._id}</span>
                  <span className="font-bold text-agri-800 bg-agri-100 px-2 py-0.5 rounded-full">
                    {d.count} {isTa ? 'விவசாயிகள்' : 'farmers'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
