import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Clock, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { useArticles } from '../../hooks/useArticles';

export const KnowledgePage = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, refetch } = useArticles({
    category: category || undefined,
    search: searchQuery || undefined,
  });

  const articles = data?.data || [];

  const CATEGORIES = [
    { id: '', ta: 'அனைத்தும்', en: 'All' },
    { id: 'philosophy', ta: 'நம்மாழ்வார் தத்துவம்', en: 'Philosophy' },
    { id: 'practice', ta: 'இயற்கை சாகுபடி முறைகள்', en: 'Practices' },
    { id: 'scheme-guide', ta: 'அரசுத் திட்ட வழிகாட்டி', en: 'Scheme Guide' },
    { id: 'pest-management', ta: 'இயற்கை பூச்சி மேலாண்மை', en: 'Pest Management' },
  ];

  const getCategoryLabel = (cat) => {
    const found = CATEGORIES.find((c) => c.id === cat);
    return found ? (isTa ? found.ta : found.en) : cat;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-agri-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold backdrop-blur-xs border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isTa ? 'அய்யா நம்மாழ்வாரின் வழிகாட்டல்' : "Ayya Nammazhvar's Wisdom"}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isTa ? 'இயற்கை வேளாண் அறிவு மையம்' : 'Natural Farming Knowledge Base'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
            {isTa
              ? 'மண் வளம், பாரம்பரிய விதைகள், பூச்சி மேலாண்மை மற்றும் இயற்கை மாற்ற முறைகளுக்கான முழுமையான வழிகாட்டிகள்.'
              : 'Practical field guides, soil rejuvenation practices, traditional seeds, and organic transition techniques.'}
          </p>
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={isTa ? 'கட்டுரைகள் அல்லது வழிகாட்டிகள் தேடுக...' : 'Search articles or guides...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                category === c.id
                  ? 'bg-agri-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
              }`}
            >
              {isTa ? c.ta : c.en}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-stone-500 text-sm">{t('app.loading')}</div>
      ) : isError ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{t('app.error')}</span>
          <button type="button" onClick={() => refetch()} className="font-bold underline">
            {t('app.retry')}
          </button>
        </div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">
            {isTa ? 'கட்டுரைகள் எதுவும் கிடைக்கவில்லை' : 'No articles found'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {isTa
              ? 'தேடல் சொற்களை மாற்றி மீண்டும் முயற்சிக்கவும்.'
              : 'Try searching with different terms or select another category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((art) => {
            const title = isTa ? art.titleTa || art.title : art.title;
            const summary = isTa ? art.summaryTa || art.summary : art.summary;

            return (
              <Link
                key={art._id}
                to={`/knowledge/${art.slug}`}
                className="group bg-white rounded-3xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-agri-800 bg-agri-100 px-2.5 py-0.5 rounded-full">
                      {getCategoryLabel(art.category)}
                    </span>
                    {art.readTimeMinutes && (
                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{art.readTimeMinutes} {isTa ? 'நிமிடம்' : 'min read'}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-stone-900 text-base group-hover:text-agri-700 transition-colors line-clamp-2">
                    {title}
                  </h3>

                  {summary && (
                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {summary}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span>{new Date(art.publishedAt || art.createdAt).toLocaleDateString()}</span>
                  <span className="inline-flex items-center gap-1 text-agri-700 font-bold group-hover:translate-x-1 transition-transform">
                    <span>{isTa ? 'வாசிக்க' : 'Read'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
