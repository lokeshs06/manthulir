import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const connectDB = async (uri = env.mongodbUri) => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  logger.info('MongoDB connected');
  return mongoose.connection;
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};

export const isDBConnected = () => mongoose.connection.readyState === 1;
