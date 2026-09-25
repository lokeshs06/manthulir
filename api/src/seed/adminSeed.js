import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const seedAdmin = async () => {
  const existing = await User.findOne({ phone: env.seedAdmin.phone });
  if (existing) {
    logger.info('Admin user already exists, skipping');
    return;
  }

  const passwordHash = await bcrypt.hash(env.seedAdmin.password, env.bcryptSaltRounds);
  await User.create({
    name: env.seedAdmin.name,
    phone: env.seedAdmin.phone,
    passwordHash,
    role: 'admin',
  });
  logger.info(`Admin user created (phone: ${env.seedAdmin.phone})`);
};
