import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  Calendar,
  CheckCircle,
  Bug,
  ShoppingBag,
  Users,
  FileText,
  User,
  ArrowRight,
} from 'lucide-react';

export const FarmerDashboardPage = () => {
  const { user, profile } = useAuth();
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const actionCards = [
    {
      to: '/farmer/timeline',
      title: isTa ? 'மாற்ற காலவரிசை' : 'Transition Timeline',
      desc: isTa ? 'உங்கள் மாத இலக்குகளையும் திட்டங்களையும் பாருங்கள்' : 'Track your 0-36 month milestones',
      icon: Calendar,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      to: '/farmer/verification',
      title: isTa ? 'சரிபார்ப்பு பதிவுகள்' : 'Verification Trail',
      desc: isTa ? 'புதிய செயல்பாட்டைப் பதிவு செய்து பேட்ஜ் பெறுங்கள்' : 'Log field practices and get peer-verified',
      icon: CheckCircle,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      to: '/farmer/pests',
      title: isTa ? 'பூச்சி கண்டறிதல்' : 'Pest Detection',
      desc: isTa ? 'புகைப்படம் எடுத்து உடனடி இயற்கை தீர்வு பெறுங்கள்' : 'Scan crop issues for organic remedies',
      icon: Bug,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      to: '/farmer/produce',
      title: isTa ? 'என் விளைபொருட்கள்' : 'My Produce',
      desc: isTa ? 'விற்பனைக்கான பொருட்களைப் பட்டியலிடுங்கள்' : 'List harvested crops for buyers',
      icon: ShoppingBag,
      color: 'bg-green-50 text-green-800 border-green-200',
    },
    {
      to: '/farmer/clusters',
      title: isTa ? 'விவசாயக் குழுக்கள்' : 'Farmer Clusters',
      desc: isTa ? 'அருகிலுள்ள குழுவில் இணைந்து ஒன்றாக விற்பனை செய்யுங்கள்' : 'Join local clusters for pooled sales',
      icon: Users,
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    {
      to: '/schemes',
      title: isTa ? 'அரசுத் திட்டங்கள்' : 'Government Schemes',
      desc: isTa ? 'உங்களுக்குப் பொருந்தும் மானியங்களைக் கண்டறியுங்கள்' : 'Browse schemes matching your land & crop',
      icon: FileText,
      color: 'bg-stone-50 text-stone-800 border-stone-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-agri-800 to-agri-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-agri-200 uppercase tracking-wider">
              {t('roles.farmer')} • {profile?.district || 'Tamil Nadu'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              {isTa ? `வணக்கம், ${user?.name}!` : `Welcome, ${user?.name}!`}
            </h1>
            <p className="text-sm text-agri-100 mt-1 max-w-xl">
              {isTa
                ? 'உங்கள் இயற்கை விவசாய மாற்றப் பயணத்தை எளிதாக நிர்வகிக்கலாம்.'
                : 'Manage your organic transition trail, schemes, and produce sales from one place.'}
            </p>
          </div>

          <Link
            to="/farmer/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold border border-white/20 transition-colors self-start sm:self-center min-h-touch backdrop-blur-xs"
          >
            <User className="w-4 h-4" />
            <span>{isTa ? 'சுயவிவரம்' : 'My Profile'}</span>
          </Link>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actionCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.to}
              to={card.to}
              className={`p-5 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between min-h-[140px] bg-white group ${card.color.split(' ')[2]}`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-stone-700 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h2 className="font-bold text-base text-stone-900 mb-0.5">{card.title}</h2>
                <p className="text-xs text-stone-500 leading-relaxed">{card.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
