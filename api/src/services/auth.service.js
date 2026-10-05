import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { BuyerProfile } from '../models/BuyerProfile.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

const issueTokenPair = async (user) => {
  const accessToken = signAccessToken(user._id.toString(), user.role);
  const refreshToken = signRefreshToken(user._id.toString());
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
};

export const register = async ({ name, phone, password, role }) => {
  const existing = await User.findOne({ phone });
  if (existing) throw ApiError.conflict('PHONE_ALREADY_REGISTERED', 'This phone number is already registered');

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const user = await User.create({ name, phone, passwordHash, role });

  if (role === 'farmer') {
    await FarmerProfile.create({ userId: user._id });
  } else if (role === 'buyer') {
    await BuyerProfile.create({ userId: user._id, businessName: name });
  }

  const tokens = await issueTokenPair(user);
  return { user, ...tokens };
};

export const login = async ({ phone, password }) => {
  const user = await User.findOne({ phone });
  if (!user || !user.isActive) throw ApiError.unauthorized('INVALID_CREDENTIALS', 'Invalid phone number or password');

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) throw ApiError.unauthorized('INVALID_CREDENTIALS', 'Invalid phone number or password');

  const tokens = await issueTokenPair(user);
  return { user, ...tokens };
};

export const refresh = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
  }

  const user = await User.findById(payload.sub);
  if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
    // Either the token was already rotated (replay of an old token) or the
    // user no longer exists — reject either way.
    throw ApiError.unauthorized('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
  }

  const tokens = await issueTokenPair(user);
  return { ...tokens, user };
};

export const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('USER_NOT_FOUND', 'User not found');
  return user;
};
