import { BuyerProfile } from '../models/BuyerProfile.js';
import { ApiError } from '../utils/ApiError.js';

export const getMyBuyerProfile = async (userId) => {
  const profile = await BuyerProfile.findOne({ userId });
  if (!profile) throw ApiError.notFound('BUYER_PROFILE_NOT_FOUND', 'Buyer profile not found');
  return profile;
};

export const updateMyBuyerProfile = async (userId, updates) => {
  const profile = await getMyBuyerProfile(userId);
  Object.assign(profile, updates);
  await profile.save();
  return profile;
};
