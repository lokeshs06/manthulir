import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = {
  nodeEnv,
  isTest: nodeEnv === 'test',
  isDevelopment: nodeEnv === 'development',
  isProduction: nodeEnv === 'production',
  port: Number(process.env.PORT) || 5000,
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000',

  mongodbUri:
    process.env.MONGODB_URI ||
    (nodeEnv === 'test' ? undefined : 'mongodb://localhost:27017/manthulir'),

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,

  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  mlService: {
    url: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    internalKey: process.env.ML_SERVICE_INTERNAL_KEY || 'dev-internal-key',
    confidenceThreshold: Number(process.env.ML_CONFIDENCE_THRESHOLD) || 0.7,
  },

  seedAdmin: {
    name: process.env.SEED_ADMIN_NAME || 'Manthulir Admin',
    phone: process.env.SEED_ADMIN_PHONE || '9999999999',
    password: process.env.SEED_ADMIN_PASSWORD || 'changeme-admin-password',
  },

  whatsapp: {
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    appSecret: process.env.WHATSAPP_APP_SECRET,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    graphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION || 'v20.0',
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};
