import cron from 'node-cron';
import { refreshAllTimelines } from '../services/timeline.service.js';
import { logger } from '../utils/logger.js';

// Daily at 02:00 IST — refreshes milestone status progression and
// re-links newly-verified schemes for every farmer who has started their
// transition.
export const scheduleMilestoneUpdater = () => {
  cron.schedule(
    '0 2 * * *',
    async () => {
      try {
        const count = await refreshAllTimelines();
        logger.info(`Milestone updater: refreshed timelines for ${count} farmers`);
      } catch (err) {
        logger.error({ err }, 'Milestone updater failed');
      }
    },
    { timezone: 'Asia/Kolkata' },
  );
};
