import { VerificationLog } from '../models/VerificationLog.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { BADGE_THRESHOLDS, PEER_VERIFICATION_WINDOW_DAYS } from '../config/constants.js';
import { refreshProduceBadgesForFarmer } from './produce.service.js';

const monthsBetween = (start, end) => {
  if (!start) return 0;
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 30);
};

const meetsThreshold = (t, { verificationCount, peerRatio, transitionMonths, isCertified }) => {
  if (verificationCount < t.minVerifications) return false;
  if (t.minTransitionMonths != null && transitionMonths < t.minTransitionMonths) return false;
  if (t.minPeerVerificationRatio != null && peerRatio < t.minPeerVerificationRatio) return false;
  if (t.requiresCertification && !isCertified) return false;
  return true;
};

export const computeBadgeForFarmer = async (farmerProfileId) => {
  const profile = await FarmerProfile.findById(farmerProfileId);
  if (!profile) return 'none';

  // Flagged-and-unresolved logs don't count toward trust until cleared —
  // resolving a flag (admin.service.js) sets flagged back to false, which
  // makes it count again automatically here.
  const logs = await VerificationLog.find({ farmerId: farmerProfileId, flagged: false });
  const verificationCount = logs.length;

  const windowMs = PEER_VERIFICATION_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const peerVerifiedCount = logs.filter(
    (log) => log.peerVerifications.length > 0 && Date.now() - log.createdAt.getTime() <= windowMs,
  ).length;
  const peerRatio = verificationCount > 0 ? peerVerifiedCount / verificationCount : 0;

  const transitionMonths = monthsBetween(profile.transitionStartDate, Date.now());
  const isCertified = profile.certification?.status === 'approved';

  const input = { verificationCount, peerRatio, transitionMonths, isCertified };

  let badge = 'none';
  if (meetsThreshold(BADGE_THRESHOLDS.gold, input)) badge = 'gold';
  else if (meetsThreshold(BADGE_THRESHOLDS.silver, input)) badge = 'silver';
  else if (meetsThreshold(BADGE_THRESHOLDS.bronze, input)) badge = 'bronze';

  const badgeChanged = profile.badge !== badge;
  profile.badge = badge;
  profile.badgeUpdatedAt = new Date();
  await profile.save();

  if (badgeChanged) {
    await refreshProduceBadgesForFarmer(profile._id);
  }

  return badge;
};

export const lowestBadge = (badges) => {
  const order = ['none', 'bronze', 'silver', 'gold'];
  return badges.reduce((lowest, b) => (order.indexOf(b) < order.indexOf(lowest) ? b : lowest), 'gold');
};
