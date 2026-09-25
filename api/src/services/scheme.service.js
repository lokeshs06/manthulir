import { Scheme } from '../models/Scheme.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { ApiError } from '../utils/ApiError.js';
import { matchSchemes } from './schemeMatcher.service.js';

export const listSchemes = async () => Scheme.find({ isDeleted: false }).sort({ createdAt: -1 });

export const getSchemeById = async (id) => {
  const scheme = await Scheme.findOne({ _id: id, isDeleted: false });
  if (!scheme) throw ApiError.notFound('SCHEME_NOT_FOUND', 'Scheme not found');
  return scheme;
};

export const createScheme = async (data) => {
  // New schemes always start unverified — an admin must explicitly review
  // and verify the content (especially benefit amounts/URLs) before it's
  // presented to farmers as authoritative.
  return Scheme.create({ ...data, verified: false });
};

export const updateScheme = async (id, updates) => {
  const scheme = await getSchemeById(id);
  Object.assign(scheme, updates);
  // Any content edit invalidates a prior verification — it must be
  // re-reviewed against the new content.
  scheme.verified = false;
  scheme.verifiedAt = null;
  scheme.verifiedBy = null;
  await scheme.save();
  return scheme;
};

export const softDeleteScheme = async (id) => {
  const scheme = await getSchemeById(id);
  scheme.isDeleted = true;
  await scheme.save();
  return scheme;
};

export const verifyScheme = async (id, adminUserId) => {
  const scheme = await getSchemeById(id);
  scheme.verified = true;
  scheme.verifiedAt = new Date();
  scheme.verifiedBy = adminUserId;
  await scheme.save();
  return scheme;
};

// Works both for a logged-in farmer (criteria pulled from their profile)
// and an anonymous visitor (criteria taken from query params instead).
export const matchSchemesForRequest = async (userId, queryCriteria) => {
  let criteria = queryCriteria;

  if (userId) {
    const profile = await FarmerProfile.findOne({ userId });
    if (profile) {
      criteria = {
        district: profile.district,
        landSizeAcres: profile.landSizeAcres,
        crops: profile.crops,
        isCertified: profile.certification?.status === 'approved',
      };
    }
  }

  const schemes = await Scheme.find({ isDeleted: false, verified: true });
  return matchSchemes(schemes, criteria || {});
};
