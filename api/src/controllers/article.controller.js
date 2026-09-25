import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as articleService from '../services/article.service.js';
import { resolveLang, localizeFields, localizeList } from '../utils/localization.js';

const ARTICLE_FIELD_PAIRS = [
  ['title', 'titleTa'],
  ['content', 'contentTa'],
];

export const createArticleHandler = asyncHandler(async (req, res) => {
  const article = await articleService.createArticle(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, data: article });
});

export const updateArticleHandler = asyncHandler(async (req, res) => {
  const article = await articleService.updateArticle(req.params.id, req.body);
  sendSuccess(res, { data: article });
});

export const deleteArticleHandler = asyncHandler(async (req, res) => {
  await articleService.deleteArticle(req.params.id);
  sendSuccess(res, { data: null });
});

export const listAllArticlesForAdminHandler = asyncHandler(async (req, res) => {
  const articles = await articleService.listAllArticlesForAdmin();
  sendSuccess(res, { data: articles });
});

export const getArticleHandler = asyncHandler(async (req, res) => {
  const article = await articleService.getArticleById(req.params.id);
  sendSuccess(res, { data: localizeFields(article, ARTICLE_FIELD_PAIRS, resolveLang(req)) });
});

export const listPublishedArticlesHandler = asyncHandler(async (req, res) => {
  const articles = await articleService.listPublishedArticles(req.query);
  sendSuccess(res, { data: localizeList(articles, ARTICLE_FIELD_PAIRS, resolveLang(req)) });
});
