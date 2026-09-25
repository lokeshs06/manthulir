import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { scheduleMilestoneUpdater } from './jobs/milestoneUpdater.js';

const start = async () => {
  await connectDB();
  scheduleMilestoneUpdater();

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`Manthulir API listening on port ${env.port} [${env.nodeEnv}]`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
