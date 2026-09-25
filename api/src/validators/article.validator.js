import { z } from 'zod';
import { ARTICLE_CATEGORIES } from '../config/constants.js';

export const createArticleSchema = {
  body: z.object({
    title: z.string().min(1),
    titleTa: z.string().optional(),
    content: z.string().min(1),
    contentTa: z.string().optional(),
    category: z.enum(ARTICLE_CATEGORIES),
    tags: z.array(z.string()).default([]),
    coverImageUrl: z.string().optional(),
    isPublished: z.boolean().default(false),
  }),
};

export const updateArticleSchema = {
  body: createArticleSchema.body.partial(),
};

export const listArticlesQuerySchema = {
  query: z.object({
    category: z.enum(ARTICLE_CATEGORIES).optional(),
    tag: z.string().optional(),
    search: z.string().optional(),
    lang: z.enum(['ta', 'en', 'all']).optional(),
  }),
};
