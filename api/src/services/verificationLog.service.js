import { VerificationLog } from '../models/VerificationLog.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadImageBuffer } from './cloudinaryUpload.service.js';
import { computeBadgeForFarmer } from './badge.service.js';
import { PEER_VERIFICATION_WINDOW_DAYS } from '../config/constants.js';

const getProfileOrThrow = async (userId) => {
  const profile = await FarmerProfile.findOne({ userId });
  if (!profile) throw ApiError.notFound('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found');
  return profile;
};

export const createVerificationLog = async (userId, { practiceType, description }, file) => {
  if (!file) throw ApiError.badRequest('IMAGE_REQUIRED', 'A verification photo is required');

  const profile = await getProfileOrThrow(userId);
  const { url, publicId } = await uploadImageBuffer(file.buffer, 'verification-logs');

  const log = await VerificationLog.create({
    farmerId: profile._id,
    practiceType,
    description,
    photoUrl: url,
    photoPublicId: publicId,
  });

  // First-ever log marks the start of the farmer's transition journey.
  if (!profile.transitionStartDate) {
    profile.transitionStartDate = new Date();
    profile.transitionStatus = 'transitioning';
    await profile.save();
  }

  await computeBadgeForFarmer(profile._id);
  return log;
};

export const listMyVerificationLogs = async (userId, { skip, limit }) => {
  const profile = await getProfileOrThrow(userId);
  const filter = { farmerId: profile._id };
  const [items, total] = await Promise.all([
    VerificationLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    VerificationLog.countDocuments(filter),
  ]);
  return { items, total };
};

export const peerVerifyLog = async (userId, logId) => {
  const viewerProfile = await getProfileOrThrow(userId);
  const log = await VerificationLog.findById(logId);
  if (!log) throw ApiError.notFound('LOG_NOT_FOUND', 'Verification log not found');

  if (log.farmerId.equals(viewerProfile._id)) {
    throw ApiError.badRequest('CANNOT_VERIFY_OWN_LOG', 'You cannot peer-verify your own log');
  }

  const ownerProfile = await FarmerProfile.findById(log.farmerId);
  const sharesCluster = ownerProfile.clusterIds.some((id) => viewerProfile.clusterIds.some((vid) => vid.equals(id)));
  if (!sharesCluster) {
    throw ApiError.forbidden('NOT_IN_SHARED_CLUSTER', 'You can only verify logs from farmers in your cluster');
  }

  const ageDays = (Date.now() - log.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays > PEER_VERIFICATION_WINDOW_DAYS) {
    throw ApiError.badRequest('LOG_TOO_OLD', `This log is older than ${PEER_VERIFICATION_WINDOW_DAYS} days and can no longer be peer-verified`);
  }

  const alreadyVerified = log.peerVerifications.some((v) => v.verifierId.equals(viewerProfile._id));
  if (alreadyVerified) {
    throw ApiError.conflict('ALREADY_VERIFIED', 'You have already verified this log');
  }

  log.peerVerifications.push({ verifierId: viewerProfile._id });
  await log.save();
  await computeBadgeForFarmer(log.farmerId);
  return log;
};

export const flagLog = async (userId, logId, { flagReason }) => {
  const log = await VerificationLog.findById(logId);
  if (!log) throw ApiError.notFound('LOG_NOT_FOUND', 'Verification log not found');

  log.flagged = true;
  log.flagReason = flagReason;
  await log.save();
  await computeBadgeForFarmer(log.farmerId);
  return log;
};
