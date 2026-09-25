import { Scheme } from '../models/Scheme.js';
import { schemesSeedData } from './data/schemes.data.js';
import { logger } from '../utils/logger.js';

export const seedSchemes = async () => {
  let created = 0;
  for (const schemeData of schemesSeedData) {
    const result = await Scheme.updateOne(
      { name: schemeData.name },
      { $setOnInsert: { ...schemeData, verified: false } },
      { upsert: true },
    );
    if (result.upsertedCount > 0) created += 1;
  }
  logger.info(`Schemes seeded: ${created} created, ${schemesSeedData.length - created} already existed`);
};
