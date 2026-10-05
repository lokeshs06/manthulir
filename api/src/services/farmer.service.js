import { FarmerProfile } from '../models/FarmerProfile.js';
import { Scheme } from '../models/Scheme.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadImageBuffer } from './cloudinaryUpload.service.js';

export const getMyFarmerProfile = async (userId) => {
  let profile = await FarmerProfile.findOne({ userId });
  if (!profile) {
    profile = await FarmerProfile.create({ userId });
  }
  return profile;
};

export const updateMyFarmerProfile = async (userId, updates) => {
  const profile = await getMyFarmerProfile(userId);
  Object.assign(profile, updates);
  await profile.save();
  return profile;
};

// Public-facing summary — deliberately excludes phone/contact details and
// anything beyond what's needed to establish trust (badge, district,
// transition status, crops). See buyer.service.js for how contact info is
// only ever revealed via an accepted Inquiry.
export const getPublicFarmerSummary = async (farmerProfileId) => {
  const profile = await FarmerProfile.findById(farmerProfileId).populate('userId', 'name');
  if (!profile) throw ApiError.notFound('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found');

  return {
    id: profile._id,
    name: profile.userId?.name,
    district: profile.district,
    crops: profile.crops,
    transitionStatus: profile.transitionStatus,
    transitionStartDate: profile.transitionStartDate,
    badge: profile.badge,
    bio: profile.bio,
    photoUrl: profile.photoUrl,
  };
};

export const saveScheme = async (userId, schemeId) => {
  const scheme = await Scheme.findOne({ _id: schemeId, isDeleted: false });
  if (!scheme) throw ApiError.notFound('SCHEME_NOT_FOUND', 'Scheme not found');

  const profile = await getMyFarmerProfile(userId);
  if (!profile.savedSchemeIds.some((id) => id.equals(schemeId))) {
    profile.savedSchemeIds.push(schemeId);
    await profile.save();
  }
  return profile;
};

export const unsaveScheme = async (userId, schemeId) => {
  const profile = await getMyFarmerProfile(userId);
  profile.savedSchemeIds = profile.savedSchemeIds.filter((id) => !id.equals(schemeId));
  await profile.save();
  return profile;
};

export const markSchemeApplied = async (userId, schemeId) => {
  const scheme = await Scheme.findOne({ _id: schemeId, isDeleted: false });
  if (!scheme) throw ApiError.notFound('SCHEME_NOT_FOUND', 'Scheme not found');

  const profile = await getMyFarmerProfile(userId);
  if (!profile.appliedSchemeIds.some((id) => id.equals(schemeId))) {
    profile.appliedSchemeIds.push(schemeId);
    await profile.save();
  }
  return profile;
};

export const listMySavedSchemes = async (userId) => {
  const profile = await getMyFarmerProfile(userId);
  return Scheme.find({ _id: { $in: profile.savedSchemeIds }, isDeleted: false });
};

export const submitCertification = async (userId, file) => {
  if (!file) throw ApiError.badRequest('DOCUMENT_REQUIRED', 'A certification document image is required');

  const profile = await getMyFarmerProfile(userId);
  const { url, publicId } = await uploadImageBuffer(file.buffer, 'certifications');

  profile.certification = {
    status: 'pending',
    documentUrl: url,
    documentPublicId: publicId,
    submittedAt: new Date(),
  };
  await profile.save();
  return profile;
};

export const listMyAppliedSchemes = async (userId) => {
  const profile = await getMyFarmerProfile(userId);
  return Scheme.find({ _id: { $in: profile.appliedSchemeIds }, isDeleted: false });
};
