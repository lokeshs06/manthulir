import { describe, it, expect } from '@jest/globals';
import mongoose from 'mongoose';
import { FarmerProfile } from '../../src/models/FarmerProfile.js';
import { VerificationLog } from '../../src/models/VerificationLog.js';
import { computeBadgeForFarmer } from '../../src/services/badge.service.js';

const monthsAgo = (n) => new Date(Date.now() - n * 30 * 24 * 60 * 60 * 1000);

const makeLogs = async (farmerId, count, { peerVerifiedCount = 0, flagged = false, createdAt } = {}) => {
  for (let i = 0; i < count; i++) {
    const log = await VerificationLog.create({
      farmerId,
      practiceType: 'compost_application',
      photoUrl: 'https://example.com/x.jpg',
      photoPublicId: `x-${i}`,
      flagged,
      ...(createdAt ? { createdAt } : {}),
    });
    if (i < peerVerifiedCount) {
      log.peerVerifications.push({ verifierId: new mongoose.Types.ObjectId() });
      await log.save();
    }
  }
};

describe('computeBadgeForFarmer', () => {
  it('assigns none with no verification logs', async () => {
    const profile = await FarmerProfile.create({ userId: new mongoose.Types.ObjectId() });
    const badge = await computeBadgeForFarmer(profile._id);
    expect(badge).toBe('none');
  });

  it('assigns bronze at 3+ verifications', async () => {
    const profile = await FarmerProfile.create({ userId: new mongoose.Types.ObjectId() });
    await makeLogs(profile._id, 3);
    const badge = await computeBadgeForFarmer(profile._id);
    expect(badge).toBe('bronze');
  });

  it('assigns silver with enough verifications, peer ratio, and transition months', async () => {
    const profile = await FarmerProfile.create({
      userId: new mongoose.Types.ObjectId(),
      transitionStartDate: monthsAgo(7),
    });
    await makeLogs(profile._id, 8, { peerVerifiedCount: 4 });
    const badge = await computeBadgeForFarmer(profile._id);
    expect(badge).toBe('silver');
  });

  it('does not assign gold without an approved certification even if other criteria are met', async () => {
    const profile = await FarmerProfile.create({
      userId: new mongoose.Types.ObjectId(),
      transitionStartDate: monthsAgo(13),
    });
    await makeLogs(profile._id, 15, { peerVerifiedCount: 12 });
    const badge = await computeBadgeForFarmer(profile._id);
    expect(badge).not.toBe('gold');
  });

  it('assigns gold once certification is approved alongside the other criteria', async () => {
    const profile = await FarmerProfile.create({
      userId: new mongoose.Types.ObjectId(),
      transitionStartDate: monthsAgo(13),
      certification: { status: 'approved' },
    });
    await makeLogs(profile._id, 15, { peerVerifiedCount: 12 });
    const badge = await computeBadgeForFarmer(profile._id);
    expect(badge).toBe('gold');
  });

  it('excludes flagged logs from the verification count', async () => {
    const profile = await FarmerProfile.create({ userId: new mongoose.Types.ObjectId() });
    await makeLogs(profile._id, 2);
    await makeLogs(profile._id, 5, { flagged: true });
    // Only 2 unflagged logs -> below bronze's threshold of 3.
    const badge = await computeBadgeForFarmer(profile._id);
    expect(badge).toBe('none');
  });
});
