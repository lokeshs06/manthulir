import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createArticleSchema, updateArticleSchema, listArticlesQuerySchema } from '../validators/article.validator.js';
import {
  createArticleHandler,
  updateArticleHandler,
  deleteArticleHandler,
  listAllArticlesForAdminHandler,
  getArticleHandler,
  listPublishedArticlesHandler,
} from '../controllers/article.controller.js';

const router = Router();

/**
 * @openapi
 * /articles:
 *   get:
 *     tags: [Articles]
 *     summary: List published articles (category/tag/text-search filters)
 *     responses:
 *       200: { description: List of published articles }
 *   post:
 *     tags: [Articles]
 *     summary: Create an article (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ArticleInput' }
 *     responses:
 *       201: { description: Article created }
 */
router.get('/', validate(listArticlesQuerySchema), listPublishedArticlesHandler);
router.post('/', authenticate, requireRole('admin'), validate(createArticleSchema), createArticleHandler);

/**
 * @openapi
 * /articles/admin:
 *   get:
 *     tags: [Articles]
 *     summary: List all articles including unpublished ones (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: All articles }
 */
router.get('/admin', authenticate, requireRole('admin'), listAllArticlesForAdminHandler);

/**
 * @openapi
 * /articles/{id}:
 *   get:
 *     tags: [Articles]
 *     summary: Get an article by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Article }
 *   patch:
 *     tags: [Articles]
 *     summary: Update an article (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ArticleInput' }
 *     responses:
 *       200: { description: Updated article }
 *   delete:
 *     tags: [Articles]
 *     summary: Delete an article (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Article deleted }
 */
router.get('/:id', getArticleHandler);
router.patch('/:id', authenticate, requireRole('admin'), validate(updateArticleSchema), updateArticleHandler);
router.delete('/:id', authenticate, requireRole('admin'), deleteArticleHandler);

export default router;
