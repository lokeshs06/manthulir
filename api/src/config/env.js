import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';

const cleanEnvString = (val) => {
  if (typeof val !== 'string') return val;
  let cleaned = val.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
};

const cleanMongoUri = (val) => {
  let cleaned = cleanEnvString(val);
  if (!cleaned) return cleaned;
  if (cleaned.startsWith('MONGODB_URI=')) {
    cleaned = cleanEnvString(cleaned.slice('MONGODB_URI='.length));
  }
  return cleaned;
};

export const env = {
  nodeEnv,
  isTest: nodeEnv === 'test',
  isDevelopment: nodeEnv === 'development',
  isProduction: nodeEnv === 'production',
  port: Number(process.env.PORT) || 5000,
  apiBaseUrl: cleanEnvString(process.env.API_BASE_URL) || 'http://localhost:5000',

  mongodbUri:
    cleanMongoUri(process.env.MONGODB_URI) ||
    (nodeEnv === 'test' ? undefined : 'mongodb://localhost:27017/manthulir'),

  jwt: {
    accessSecret: cleanEnvString(process.env.JWT_ACCESS_SECRET),
    refreshSecret: cleanEnvString(process.env.JWT_REFRESH_SECRET),
    accessExpiresIn: cleanEnvString(process.env.JWT_ACCESS_EXPIRES_IN) || '15m',
    refreshExpiresIn: cleanEnvString(process.env.JWT_REFRESH_EXPIRES_IN) || '7d',
  },
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,

  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => cleanEnvString(origin))
    .filter(Boolean),

  cloudinary: {
    cloudName: cleanEnvString(process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: cleanEnvString(process.env.CLOUDINARY_API_KEY),
    apiSecret: cleanEnvString(process.env.CLOUDINARY_API_SECRET),
  },

  mlService: {
    url: cleanEnvString(process.env.ML_SERVICE_URL) || 'http://localhost:8000',
    internalKey: cleanEnvString(process.env.ML_SERVICE_INTERNAL_KEY) || 'dev-internal-key',
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
