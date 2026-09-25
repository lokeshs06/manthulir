import { FarmerProfile } from '../models/FarmerProfile.js';
import { BuyerProfile } from '../models/BuyerProfile.js';

// Shared helper for anywhere that needs "this user's role-specific profile"
// without caring which role it is (e.g. attaching profile context to /me).
export const getProfileForUser = async (userId, role) => {
  if (role === 'farmer') return FarmerProfile.findOne({ userId });
  if (role === 'buyer') return BuyerProfile.findOne({ userId });
  return null;
};
