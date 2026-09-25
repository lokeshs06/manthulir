import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiDir = path.join(__dirname, 'api');

const apiRequire = createRequire(path.join(apiDir, 'package.json'));
const { MongoMemoryServer } = apiRequire('mongodb-memory-server');

async function main() {
  console.log('Starting MongoDB for local development...');
  const dbPath = path.resolve(__dirname, '.mongo-data');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  const mongod = await MongoMemoryServer.create({
    instance: {
      dbPath: dbPath,
      storageEngine: 'wiredTiger',
    }
  });

  const mongoUri = mongod.getUri() + 'manthulir';
  console.log('MongoDB started at:', mongoUri);

  // Switch working directory to apiDir so swagger-jsdoc relative paths ('./src/routes/*.js') resolve correctly!
  process.chdir(apiDir);

  process.env.NODE_ENV = 'development';
  process.env.MONGODB_URI = mongoUri;
  process.env.PORT = '5000';
  process.env.API_BASE_URL = 'http://localhost:5000';
  process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:4173';
  process.env.JWT_ACCESS_SECRET = 'manthulir-dev-access-token-secret-key-32chars';
  process.env.JWT_REFRESH_SECRET = 'manthulir-dev-refresh-token-secret-key-32chars';
  process.env.SEED_ADMIN_NAME = 'Manthulir Admin';
  process.env.SEED_ADMIN_PHONE = '9999999999';
  process.env.SEED_ADMIN_PASSWORD = 'adminPass123';

  // Seed database
  console.log('Seeding database with test data...');
  const { connectDB, disconnectDB } = await import('./api/src/config/db.js');
  const { seedAdmin } = await import('./api/src/seed/adminSeed.js');
  const { seedSchemes } = await import('./api/src/seed/schemeSeed.js');
  const { seedPestRemedies } = await import('./api/src/seed/pestRemedySeed.js');
  const { seedSampleFarmers } = await import('./api/src/seed/sampleDataSeed.js');
  const { seedArticles } = await import('./api/src/seed/articleSeed.js');

  await connectDB(mongoUri);
  await seedAdmin();
  await seedSchemes();
  await seedPestRemedies();
  await seedSampleFarmers();
  await seedArticles();
  console.log('Seeding completed.');

  // Start API server
  const { createApp } = await import('./api/src/app.js');
  const { scheduleMilestoneUpdater } = await import('./api/src/jobs/milestoneUpdater.js');
  scheduleMilestoneUpdater();

  const app = createApp();
  const server = app.listen(5000, () => {
    console.log('----------------------------------------------------');
    console.log('✅ Manthulir API running at http://localhost:5000');
    console.log('📖 Swagger UI docs: http://localhost:5000/api/docs');
    console.log('📄 OpenAPI JSON:     http://localhost:5000/api/docs.json');
    console.log('----------------------------------------------------');
  });

  const shutdown = async (sig) => {
    console.log(`Received ${sig}, shutting down...`);
    server.close();
    await disconnectDB();
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch(err => {
  console.error('Fatal error running dev backend:', err);
  process.exit(1);
});
