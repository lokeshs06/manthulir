import { Router } from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import { isDBConnected } from '../config/db.js';
import { env } from '../config/env.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Report API, database, and ML service status
 *     responses:
 *       200:
 *         description: Health status
 */
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const dbConnected = isDBConnected();

    let mlServiceStatus = 'unknown';
    try {
      await axios.get(`${env.mlService.url}/health`, { timeout: 2000 });
      mlServiceStatus = 'ok';
    } catch {
      mlServiceStatus = 'unreachable';
    }

    sendSuccess(res, {
      data: {
        status: 'ok',
        database: dbConnected ? 'connected' : 'disconnected',
        mlService: mlServiceStatus,
        mongooseState: mongoose.connection.readyState,
      },
    });
  }),
);

export default router;
