import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { swaggerSpec } from './docs/swagger.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.middleware.js';
import { generalLimiter } from './middlewares/rateLimiters.js';

import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import farmerRoutes from './routes/farmer.routes.js';
import buyerRoutes from './routes/buyer.routes.js';
import schemeRoutes from './routes/scheme.routes.js';
import verificationLogRoutes from './routes/verificationLog.routes.js';
import pestRoutes from './routes/pest.routes.js';
import produceRoutes from './routes/produce.routes.js';
import inquiryRoutes from './routes/inquiry.routes.js';
import clusterRoutes from './routes/cluster.routes.js';
import articleRoutes from './routes/article.routes.js';
import adminRoutes from './routes/admin.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';

export const createApp = () => {
  const app = express();

  // Render (and most PaaS hosts) sit behind a single reverse proxy hop.
  // Without this, express-rate-limit v7 throws on every request in
  // production (it validates X-Forwarded-For against the trust proxy
  // setting to prevent trivial rate-limit bypass via spoofed headers), and
  // req.ip would resolve to the proxy's address instead of the real client.
  app.set('trust proxy', 1);

  app.disable('x-powered-by');
  app.use(helmet());
  const rawOrigins = Array.isArray(env.corsAllowedOrigins)
    ? env.corsAllowedOrigins
    : [env.corsAllowedOrigins];
  const allowedOrigins = rawOrigins
    .map((o) => (typeof o === 'string' ? o.toLowerCase().trim().replace(/\/+$/, '') : ''))
    .filter(Boolean);

  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalized = origin.toLowerCase().trim().replace(/\/+$/, '');

      // Match exact allowed origins (from CORS_ALLOWED_ORIGINS)
      if (allowedOrigins.includes(normalized) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      // Always allow any Netlify origin (e.g. https://manthulir.netlify.app and preview deploys)
      if (/^https:\/\/([a-z0-9-]+)\.netlify\.app$/.test(normalized)) {
        return callback(null, true);
      }

      // Allow localhost in dev
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(
    express.json({
      limit: '2mb',
      // Retained verbatim for WhatsApp webhook signature verification
      // (Meta signs the exact raw bytes, before JSON parsing).
      verify: (req, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    // Meta's webhook verification handshake uses literal dotted query keys
    // (hub.mode, hub.verify_token, hub.challenge) that express-mongo-sanitize
    // would otherwise strip. That GET route never builds a Mongo query from
    // its input, so skipping sanitization there is safe; everything else
    // (including the POST webhook body) stays sanitized.
    if (req.method === 'GET' && req.path === '/api/whatsapp/webhook') return next();
    return mongoSanitize()(req, res, next);
  });

  if (!env.isTest) {
    app.use(pinoHttp({ logger }));
  }

  app.use('/api', generalLimiter);

  // Root redirect to Swagger documentation for browser visits
  app.get('/', (req, res) => {
    res.redirect('/api/docs');
  });

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // Raw OpenAPI JSON, for frontend codegen/tooling rather than the interactive UI.
  app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

  app.use('/api', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/farmers', farmerRoutes);
  app.use('/api/buyers', buyerRoutes);
  app.use('/api/schemes', schemeRoutes);
  app.use('/api/verification-logs', verificationLogRoutes);
  app.use('/api/pests', pestRoutes);
  app.use('/api/produce', produceRoutes);
  app.use('/api/inquiries', inquiryRoutes);
  app.use('/api/clusters', clusterRoutes);
  app.use('/api/articles', articleRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/whatsapp', whatsappRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
