import { PestRemedy } from '../models/PestRemedy.js';
import { pestRemediesSeedData } from './data/pestRemedies.data.js';
import { logger } from '../utils/logger.js';

export const seedPestRemedies = async () => {
  let created = 0;
  for (const remedyData of pestRemediesSeedData) {
    const result = await PestRemedy.updateOne(
      { modelClassLabel: remedyData.modelClassLabel },
      { $setOnInsert: remedyData },
      { upsert: true },
    );
    if (result.upsertedCount > 0) created += 1;
  }
  logger.info(`Pest remedies seeded: ${created} created, ${pestRemediesSeedData.length - created} already existed`);
};
