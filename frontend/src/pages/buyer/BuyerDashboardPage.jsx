import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, FileText, User, ArrowRight } from 'lucide-react';

export const BuyerDashboardPage = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
          {t('roles.buyer')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1">
          {isTa ? `வணக்கம், ${user?.name}!` : `Welcome, ${user?.name}!`}
        </h1>
        <p className="text-sm text-emerald-100 mt-1 max-w-xl">
          {isTa
            ? 'இயற்கை விவசாயிகளிடமிருந்து நேரடியாக சரிபார்க்கப்பட்ட விளைபொருட்களை வாங்குங்கள்.'
            : 'Source trustworthy, verified transitional & organic crops directly from Tamil Nadu farmers.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/produce"
          className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-agri-400 hover:shadow-md transition-all flex flex-col justify-between group min-h-[140px]"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h2 className="font-bold text-base text-stone-900 mb-0.5">
              {isTa ? 'விளைபொருட்களை உலாவுக' : 'Browse Produce'}
            </h2>
            <p className="text-xs text-stone-500">
              {isTa ? 'மாவட்டம், பயிர் மற்றும் பேட்ஜ் வாரியாகத் தேடுங்கள்' : 'Search by district, crop, and trust badge'}
            </p>
          </div>
        </Link>

        <Link
          to="/buyer/inquiries"
          className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-agri-400 hover:shadow-md transition-all flex flex-col justify-between group min-h-[140px]"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h2 className="font-bold text-base text-stone-900 mb-0.5">
              {isTa ? 'என் விசாரணைகள்' : 'My Inquiries'}
            </h2>
            <p className="text-xs text-stone-500">
              {isTa ? 'விவசாயிகளுக்கு அனுப்பிய கோரிக்கைகளின் நிலை' : 'Track orders and accepted phone contacts'}
            </p>
          </div>
        </Link>

        <Link
          to="/buyer/profile"
          className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-agri-400 hover:shadow-md transition-all flex flex-col justify-between group min-h-[140px]"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-1 transition-all" />
          </div>
          <div>
            <h2 className="font-bold text-base text-stone-900 mb-0.5">
              {isTa ? 'சுயவிவரம்' : 'Buyer Profile'}
            </h2>
            <p className="text-xs text-stone-500">
              {isTa ? 'வணிக விவரங்கள் மற்றும் விருப்பங்களை நிர்வகிக்கவும்' : 'Manage your business details & preferences'}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};
