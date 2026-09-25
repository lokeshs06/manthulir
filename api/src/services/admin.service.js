import { FarmerProfile } from '../models/FarmerProfile.js';
import { VerificationLog } from '../models/VerificationLog.js';
import { PestDetection } from '../models/PestDetection.js';
import { Produce } from '../models/Produce.js';
import { Cluster } from '../models/Cluster.js';
import { Scheme } from '../models/Scheme.js';
import { ApiError } from '../utils/ApiError.js';
import { computeBadgeForFarmer } from './badge.service.js';

export const getPlatformStats = async () => {
  const [farmersByDistrict, farmersByTransitionStatus, activeListings, clusterCount] = await Promise.all([
    FarmerProfile.aggregate([{ $group: { _id: '$district', count: { $sum: 1 } } }]),
    FarmerProfile.aggregate([{ $group: { _id: '$transitionStatus', count: { $sum: 1 } } }]),
    Produce.countDocuments({ isActive: true }),
    Cluster.countDocuments(),
  ]);

  const detectionsPerWeek = await PestDetection.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%G-W%V', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    farmersByDistrict,
    farmersByTransitionStatus,
    activeListings,
    clusterCount,
    detectionsPerWeek,
  };
};

export const listFlaggedLogs = async () => VerificationLog.find({ flagged: true }).sort({ createdAt: -1 });

export const resolveFlaggedLog = async (logId, adminUserId) => {
  const log = await VerificationLog.findById(logId);
  if (!log) throw ApiError.notFound('LOG_NOT_FOUND', 'Verification log not found');

  // Clearing the flag makes this log count toward the farmer's badge again.
  log.flagged = false;
  log.flagResolvedAt = new Date();
  log.flagResolvedBy = adminUserId;
  await log.save();

  await computeBadgeForFarmer(log.farmerId);
  return log;
};

export const listPendingCertifications = async () => FarmerProfile.find({ 'certification.status': 'pending' });

// The only path in the whole system that sets transitionStatus to
// 'certified' — nothing else is allowed to grant that status.
export const reviewCertification = async (farmerProfileId, adminUserId, { approve, rejectionReason }) => {
  const profile = await FarmerProfile.findById(farmerProfileId);
  if (!profile) throw ApiError.notFound('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found');
  if (profile.certification.status !== 'pending') {
    throw ApiError.badRequest('NO_PENDING_CERTIFICATION', 'This farmer has no pending certification to review');
  }

  profile.certification.reviewedAt = new Date();
  profile.certification.reviewedBy = adminUserId;

  if (approve) {
    profile.certification.status = 'approved';
    profile.transitionStatus = 'certified';
  } else {
    profile.certification.status = 'rejected';
    profile.certification.rejectionReason = rejectionReason;
  }

  await profile.save();
  await computeBadgeForFarmer(profile._id);
  return profile;
};

// Schemes that were never verified, or verified more than 12 months ago
// (stale — content like benefit amounts may no longer be accurate).
export const getUnverifiedSchemesReport = async () => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  return Scheme.find({
    isDeleted: false,
    $or: [{ verified: false }, { verifiedAt: { $lt: twelveMonthsAgo } }],
  });
};

export const getPestFeedbackReport = async () =>
  PestDetection.find({ farmerFeedback: 'incorrect' }).populate('remedyIds').sort({ createdAt: -1 });
