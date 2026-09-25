import { Article } from '../models/Article.js';
import { ApiError } from '../utils/ApiError.js';

export const createArticle = async (authorId, data) => {
  const article = await Article.create({ ...data, authorId });
  if (article.isPublished && !article.publishedAt) {
    article.publishedAt = new Date();
    await article.save();
  }
  return article;
};

export const updateArticle = async (id, updates) => {
  const article = await Article.findById(id);
  if (!article) throw ApiError.notFound('ARTICLE_NOT_FOUND', 'Article not found');

  const wasPublished = article.isPublished;
  Object.assign(article, updates);
  if (!wasPublished && article.isPublished) {
    article.publishedAt = new Date();
  }
  await article.save();
  return article;
};

export const deleteArticle = async (id) => {
  const article = await Article.findByIdAndDelete(id);
  if (!article) throw ApiError.notFound('ARTICLE_NOT_FOUND', 'Article not found');
};

export const getArticleById = async (id) => {
  const article = await Article.findById(id);
  if (!article) throw ApiError.notFound('ARTICLE_NOT_FOUND', 'Article not found');
  return article;
};

export const listAllArticlesForAdmin = async () => Article.find().sort({ createdAt: -1 });

export const listPublishedArticles = async ({ category, tag, search }) => {
  const filter = { isPublished: true };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: search };

  return Article.find(filter).sort({ publishedAt: -1 });
};
