import { Article } from '../models/Article.js';
import { articlesSeedData } from './data/articles.data.js';
import { logger } from '../utils/logger.js';

export const seedArticles = async () => {
  let created = 0;
  for (const articleData of articlesSeedData) {
    const result = await Article.updateOne(
      { title: articleData.title },
      { $setOnInsert: { ...articleData, publishedAt: articleData.isPublished ? new Date() : null } },
      { upsert: true },
    );
    if (result.upsertedCount > 0) created += 1;
  }
  logger.info(`Articles seeded: ${created} created, ${articlesSeedData.length - created} already existed`);
};
