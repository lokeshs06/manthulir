import { connectDB, disconnectDB } from '../config/db.js';
import { seedAdmin } from './adminSeed.js';
import { seedSchemes } from './schemeSeed.js';
import { seedPestRemedies } from './pestRemedySeed.js';
import { seedSampleFarmers } from './sampleDataSeed.js';
import { seedArticles } from './articleSeed.js';
import { logger } from '../utils/logger.js';

const run = async () => {
  await connectDB();
  await seedAdmin();
  await seedSchemes();
  await seedPestRemedies();
  await seedSampleFarmers();
  await seedArticles();
  logger.info('Seeding complete');
  await disconnectDB();
  process.exit(0);
};

run().catch((err) => {
  logger.error({ err }, 'Seeding failed');
  process.exit(1);
});
