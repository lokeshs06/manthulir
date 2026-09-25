import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Clock, Calendar, BookOpen, Share2, Globe, Tag } from 'lucide-react';
import { useArticle } from '../../hooks/useArticles';
import { MarkdownViewer } from '../../components/common/MarkdownViewer';

export const ArticleDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const isTaGlobal = i18n.language === 'ta';

  const { data: res, isLoading, isError } = useArticle(slug);
  const article = res?.data;

  // Allows toggling viewing language between Tamil & English for this specific article
  const [viewLanguage, setViewLanguage] = useState(isTaGlobal ? 'ta' : 'en');

  if (isLoading) {
    return <div className="py-16 text-center text-stone-500 text-sm">{t('app.loading')}</div>;
  }

  if (isError || !article) {
    return (
      <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-4 max-w-lg mx-auto">
        <h3 className="text-base font-bold text-stone-900">
          {isTaGlobal ? 'கட்டுரை கிடைக்கவில்லை' : 'Article Not Found'}
        </h3>
        <p className="text-xs text-stone-500">
          {isTaGlobal
            ? 'நீங்கள் தேடும் கட்டுரை நீக்கப்பட்டிருக்கலாம் அல்லது வெளியிடப்படாமல் இருக்கலாம்.'
            : 'The requested knowledge base article does not exist.'}
        </p>
        <Link
          to="/knowledge"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-agri-800 bg-agri-100 hover:bg-agri-200 rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isTaGlobal ? 'அறிவு மையத்திற்குத் திரும்பு' : 'Back to Knowledge Base'}</span>
        </Link>
      </div>
    );
  }

  const isCurrentTa = viewLanguage === 'ta';
  const displayTitle = isCurrentTa ? article.titleTa || article.title : article.title;
  const displayContent = isCurrentTa ? article.contentTa || article.content : article.content;

  const hasBothLanguages = Boolean(article.contentTa && article.content);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Back and Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/knowledge"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isTaGlobal ? 'அறிவு மையம்' : 'Knowledge Base'}</span>
        </Link>

        {hasBothLanguages && (
          <div className="inline-flex items-center gap-1 p-1 bg-stone-100 rounded-2xl border border-stone-200 text-xs">
            <Globe className="w-3.5 h-3.5 text-stone-500 ml-1.5 mr-0.5" />
            <button
              type="button"
              onClick={() => setViewLanguage('ta')}
              className={`px-2.5 py-1 font-bold rounded-xl transition-all cursor-pointer ${
                isCurrentTa ? 'bg-white text-agri-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={() => setViewLanguage('en')}
              className={`px-2.5 py-1 font-bold rounded-xl transition-all cursor-pointer ${
                !isCurrentTa ? 'bg-white text-agri-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              English
            </button>
          </div>
        )}
      </div>

      {/* Article Article Container */}
      <article className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-6">
        {/* Article Meta Header */}
        <div className="space-y-4 border-b border-stone-100 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-agri-800 bg-agri-100 px-3 py-1 rounded-full uppercase tracking-wider">
              {article.category}
            </span>
            {article.readTimeMinutes && (
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readTimeMinutes} {isCurrentTa ? 'நிமிடம் வாசிப்பு' : 'min read'}</span>
              </span>
            )}
            <span className="text-xs text-stone-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight leading-snug">
            {displayTitle}
          </h1>

          {article.author && (
            <div className="text-xs text-stone-600 font-medium">
              {isCurrentTa ? 'எழுதியவர்' : 'Written by'}: <span className="font-bold text-stone-900">{article.author}</span>
            </div>
          )}
        </div>

        {/* Markdown Body */}
        <div className="text-stone-800">
          <MarkdownViewer content={displayContent} />
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-6 border-t border-stone-100 flex flex-wrap items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-stone-400 mr-1" />
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
};
