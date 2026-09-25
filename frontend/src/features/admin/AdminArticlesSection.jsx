import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, PlusCircle, Trash2, Edit3, ExternalLink, X, Globe } from 'lucide-react';
import { useArticles, useCreateArticle, useDeleteArticle } from '../../hooks/useArticles';
import { Link } from 'react-router-dom';

export const AdminArticlesSection = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const { data, isLoading, isError, refetch } = useArticles();
  const createArticleMutation = useCreateArticle();
  const deleteArticleMutation = useDeleteArticle();

  const articles = data?.data || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState('ta'); // 'ta' | 'en'

  // Form State
  const [title, setTitle] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('practice');
  const [summary, setSummary] = useState('');
  const [summaryTa, setSummaryTa] = useState('');
  const [content, setContent] = useState('');
  const [contentTa, setContentTa] = useState('');
  const [author, setAuthor] = useState('Manthulir Team');
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [tags, setTags] = useState('natural farming, organic');
  const [actionError, setActionError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionError('');

    const autoSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    try {
      await createArticleMutation.mutateAsync({
        title: title.trim(),
        titleTa: titleTa.trim() || undefined,
        slug: autoSlug,
        category,
        summary: summary.trim() || undefined,
        summaryTa: summaryTa.trim() || undefined,
        content: content.trim(),
        contentTa: contentTa.trim() || undefined,
        author: author.trim(),
        readTimeMinutes: Number(readTimeMinutes) || 5,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });

      setShowAddModal(false);
      setTitle('');
      setTitleTa('');
      setSlug('');
      setContent('');
      setContentTa('');
      setSummary('');
      setSummaryTa('');
    } catch (err) {
      setActionError(
        err.response?.data?.error?.message ||
          (isTa ? 'கட்டுரையை வெளியிடுவதில் பிழை ஏற்பட்டது.' : 'Failed to publish article.')
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(isTa ? 'இந்த கட்டுரையை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this article?')) {
      try {
        await deleteArticleMutation.mutateAsync(id);
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-700" />
            <span>{isTa ? 'அறிவு மையம் கட்டுரைகள் மேலாண்மை' : 'Knowledge Base Articles'}</span>
          </h2>
          <p className="text-xs text-stone-500">
            {isTa
              ? 'விவசாயிகளுக்கான இயற்கை விவசாய வழிகாட்டிகளை வெளியிடுதல் மற்றும் திருத்துதல்'
              : 'Create and publish bilingual Markdown field guides and philosophy articles'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs cursor-pointer min-h-touch self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isTa ? 'புதிய கட்டுரை எழுது' : 'Publish New Article'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-stone-500 text-sm">{t('app.loading')}</div>
      ) : isError ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{t('app.error')}</span>
          <button type="button" onClick={() => refetch()} className="font-bold underline">
            {t('app.retry')}
          </button>
        </div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-2">
          <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">
            {isTa ? 'கட்டுரைகள் எதுவும் இல்லை' : 'No articles published yet'}
          </h3>
          <p className="text-xs text-stone-500">
            {isTa ? 'முதல் வழிகாட்டி கட்டுரையை வெளியிடுங்கள்.' : 'Write the first natural farming field guide.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((art) => {
            const displayTitle = isTa ? art.titleTa || art.title : art.title;

            return (
              <div
                key={art._id}
                className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {art.category}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {new Date(art.publishedAt || art.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-stone-900 text-base leading-snug">{displayTitle}</h4>

                  {art.summary && (
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {isTa ? art.summaryTa || art.summary : art.summary}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/knowledge/${art.slug}`}
                    target="_blank"
                    className="text-xs font-bold text-agri-700 hover:underline flex items-center gap-1"
                  >
                    <span>{isTa ? 'பார்வை' : 'Preview'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(art._id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-agri-700" />
                <span>{isTa ? 'புதிய வழிகாட்டி கட்டுரை வெளியிடவும்' : 'Publish Knowledge Article'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Switch Tabs */}
            <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveLangTab('ta')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeLangTab === 'ta'
                    ? 'bg-white text-agri-950 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                தமிழ் (Tamil Content)
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('en')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeLangTab === 'en'
                    ? 'bg-white text-agri-950 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                English Content
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    {isTa ? 'பிரிவு / வகை*' : 'Category*'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600 cursor-pointer"
                  >
                    <option value="practice">{isTa ? 'இயற்கை சாகுபடி முறைகள் (Practice)' : 'Practice'}</option>
                    <option value="philosophy">{isTa ? 'நம்மாழ்வார் தத்துவம் (Philosophy)' : 'Philosophy'}</option>
                    <option value="scheme-guide">{isTa ? 'அரசுத் திட்ட வழிகாட்டி (Scheme Guide)' : 'Scheme Guide'}</option>
                    <option value="pest-management">{isTa ? 'பூச்சி மேலாண்மை (Pest Management)' : 'Pest Management'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    {isTa ? 'URL Slug (விருப்பப்பட்டால்)' : 'Custom URL Slug'}
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="jeevamrutham-preparation"
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                  />
                </div>
              </div>

              {activeLangTab === 'ta' ? (
                <div className="space-y-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      கட்டுரைத் தலைப்பு (தமிழ்)*
                    </label>
                    <input
                      type="text"
                      value={titleTa}
                      onChange={(e) => setTitleTa(e.target.value)}
                      placeholder="எ.கா. ஜீவாமிர்தம் தயாரிக்கும் எளிய முறை"
                      className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      சுருக்கம் (தமிழ்)
                    </label>
                    <textarea
                      rows={2}
                      value={summaryTa}
                      onChange={(e) => setSummaryTa(e.target.value)}
                      placeholder="கட்டுரையின் முக்கிய குறிப்பு"
                      className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      உள்ளடக்கம் (Markdown தமிழ்)*
                    </label>
                    <textarea
                      rows={6}
                      value={contentTa}
                      onChange={(e) => setContentTa(e.target.value)}
                      placeholder="# தலைப்பு&#10;&#10;தேவையான பொருட்கள்:&#10;- சாணம் 10 கிலோ"
                      className="w-full text-xs font-mono border border-stone-300 rounded-xl p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Article Title (English)*
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="E.g. Step-by-Step Jeevamrutham Guide"
                      className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Summary (English)
                    </label>
                    <textarea
                      rows={2}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Short excerpt for cards"
                      className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Content (Markdown English)*
                    </label>
                    <textarea
                      rows={6}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      placeholder="# Preparation&#10;&#10;Required ingredients:&#10;- 10kg cow dung"
                      className="w-full text-xs font-mono border border-stone-300 rounded-xl p-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    {isTa ? 'வாசிக்கும் நேரம் (நிமிடம்)' : 'Read Time (mins)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={readTimeMinutes}
                    onChange={(e) => setReadTimeMinutes(e.target.value)}
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    {isTa ? 'குறிச்சொற்கள் (Tags)' : 'Tags (comma separated)'}
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="organic, soil, paddy"
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white"
                  />
                </div>
              </div>

              {actionError && <p className="text-red-600">{actionError}</p>}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  {t('app.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createArticleMutation.isPending}
                  className="px-4 py-2 font-bold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs"
                >
                  {createArticleMutation.isPending ? t('app.saving') : t('app.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
