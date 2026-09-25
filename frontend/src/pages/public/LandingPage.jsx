import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import {
  Sprout,
  ShieldCheck,
  Calendar,
  Bug,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Award,
  Users,
} from 'lucide-react';

export const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const isTa = i18n.language === 'ta';

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-agri-900 via-agri-800 to-agri-950 text-white p-6 sm:p-12 md:p-16 shadow-lg">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-agri-700/60 border border-agri-500/40 text-agri-200 text-xs font-semibold mb-6 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              {isTa
                ? 'தமிழ்நாடு இயற்கை வேளாண் மாற்ற ஆதரவு தளம்'
                : 'Tamil Nadu Natural Farming Transition Platform'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            {isTa ? (
              <>
                இயற்கை வழியில் <span className="text-agri-400">நஞ்சில்லா வேளாண்மை</span>. உறுதியான வருமானம்.
              </>
            ) : (
              <>
                Transition to <span className="text-agri-400">Chemical-Free Farming</span> with Guaranteed Trust.
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg text-agri-100 font-normal leading-relaxed mb-8 max-w-2xl">
            {isTa
              ? 'நம்மாழ்வாரின் தத்துவத்தின்படி, இரசாயன உரங்களிலிருந்து இயற்கை விவசாயத்திற்கு மாறும் விவசாயிகளுக்கு படிப்படியான வழிகாட்டல், சக விவசாயி சரிபார்ப்பு மற்றும் நேரடி சந்தை வாய்ப்பு.'
              : 'Empowering small and marginal farmers across Tamil Nadu to transition from chemical inputs to organic cultivation with peer-verified trust badges, government scheme alignment, and direct buyer access.'}
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'farmer' ? '/farmer' : user?.role === 'buyer' ? '/buyer' : '/admin'}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-base shadow-md transition-all min-h-touch"
              >
                <span>{isTa ? 'என் தளத்திற்குச் செல்' : 'Go to Dashboard'}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-agri-500 hover:bg-agri-400 text-stone-950 font-bold text-base shadow-md transition-all min-h-touch"
                >
                  <span>{isTa ? 'இலவசமாக இணையுங்கள்' : 'Get Started Free'}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/20 transition-all min-h-touch backdrop-blur-xs"
                >
                  <span>{t('nav.login')}</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Decorative Leaf in background */}
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10 pointer-events-none hidden lg:block">
          <Sprout className="w-96 h-96 text-white" />
        </div>
      </section>

      {/* Trust Badges Showcase Section */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs">
        <div className="max-w-2xl mb-6">
          <span className="text-xs font-bold text-agri-700 tracking-wider uppercase">
            {isTa ? 'நம்பகத்தன்மை அமைப்பு' : 'Trust Verification Hierarchy'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
            {isTa ? 'விவசாயிகளுக்கான படிநிலை பேட்ஜ்கள்' : 'Verified Transition Badges'}
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            {isTa
              ? 'அரசு சான்றிதழ் வரும் வரை காத்திருக்காமல், உங்கள் விவசாய நடைமுறைப் பதிவுகள் மூலமாகவே வாங்குபவர்களிடம் நம்பிக்கையை உருவாக்குங்கள்.'
              : 'Build verifiable buyer trust through peer-reviewed field logs before third-party certification.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Bronze */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                🥉
              </div>
              <span className="font-bold text-amber-900 text-sm">{t('badges.bronze')}</span>
            </div>
            <p className="text-xs text-amber-800/80 leading-relaxed">{t('badges.bronzeDesc')}</p>
          </div>

          {/* Silver */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-slate-600 text-white flex items-center justify-center font-bold text-xs">
                🥈
              </div>
              <span className="font-bold text-slate-900 text-sm">{t('badges.silver')}</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{t('badges.silverDesc')}</p>
          </div>

          {/* Gold */}
          <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50/60 flex flex-col justify-between">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-600 text-white flex items-center justify-center font-bold text-xs">
                🥇
              </div>
              <span className="font-bold text-yellow-950 text-sm">{t('badges.gold')}</span>
            </div>
            <p className="text-xs text-yellow-900/80 leading-relaxed">{t('badges.goldDesc')}</p>
          </div>
        </div>
      </section>

      {/* 4 Core Features Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Milestone Timeline */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-agri-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900 mb-1">
            {isTa ? '3 ஆண்டு காலவரிசை' : 'Transition Timeline'}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {isTa
              ? 'மாதம் 0 முதல் 36 வரை திட்டமிட்ட மைல்கற்கள், பரிந்துரைக்கப்படும் நடைமுறைகள் மற்றும் பொருத்தமான மானியங்கள்.'
              : 'Milestones at 0, 6, 12, 24, and 36 months tailored to soil recovery and bio-inputs.'}
          </p>
        </div>

        {/* Verification Trail */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-agri-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900 mb-1">
            {isTa ? 'சரிபார்ப்பு பாதை' : 'Verification Trail'}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {isTa
              ? 'பஞ்சகவ்யா, ஜீவாமிர்தம் தெளித்த புகைப்படங்களைப் பதிவிட்டு சக விவசாயிகளால் சரிபார்க்கவும்.'
              : 'Log daily bio-input applications and get peer-verified by cluster members in under 30 days.'}
          </p>
        </div>

        {/* Pest AI */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-agri-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
            <Bug className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900 mb-1">
            {isTa ? 'பூச்சி கண்டறிதல்' : 'Pest Detection'}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {isTa
              ? 'பயிரின் புகைப்படத்தை எடுத்துப் பதிவேற்றினால், உடனுக்குடன் இயற்கை பூச்சி விரட்டி தீர்வுகள்.'
              : 'Upload crop photos to detect pests instantly and get traditional non-chemical herbal remedies.'}
          </p>
        </div>

        {/* Clusters & Market */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-agri-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900 mb-1">
            {isTa ? 'விளைபொருள் சந்தை' : 'Marketplace & Clusters'}
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {isTa
              ? 'விளைபொருட்களை பட்டியலிடுங்கள். குழுவாக இணைந்து மொத்தமாக விற்பனை செய்து நல்ல விலை பெறுங்கள்.'
              : 'Pool harvest listings with local cluster farmers and connect directly with verified buyers.'}
          </p>
        </div>
      </section>
    </div>
  );
};
