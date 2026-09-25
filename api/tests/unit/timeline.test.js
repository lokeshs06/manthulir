import { describe, it, expect } from '@jest/globals';
import mongoose from 'mongoose';
import { FarmerProfile } from '../../src/models/FarmerProfile.js';
import { Scheme } from '../../src/models/Scheme.js';
import { generateTimeline } from '../../src/services/timeline.service.js';

const monthsAgo = (n) => new Date(Date.now() - n * 30 * 24 * 60 * 60 * 1000);

const makeScheme = (overrides = {}) =>
  Scheme.create({
    name: `Scheme ${Math.random()}`,
    description: 'Test scheme',
    department: 'Test dept',
    verified: true,
    isDeleted: false,
    ...overrides,
  });

describe('generateTimeline', () => {
  it('does NOT link a scheme with no explicit month window to any milestone', async () => {
    const userId = new mongoose.Types.ObjectId();
    await FarmerProfile.create({ userId, transitionStartDate: monthsAgo(1) });
    await makeScheme({ applicableFromMonth: null, applicableToMonth: null });

    const milestones = await generateTimeline(userId.toString());
    const anyLinked = milestones.some((m) => m.linkedSchemeIds.length > 0);
    expect(anyLinked).toBe(false);
  });

  it('links a scheme to a milestone whose month falls within its applicable window', async () => {
    const userId = new mongoose.Types.ObjectId();
    await FarmerProfile.create({ userId, transitionStartDate: monthsAgo(1) });
    const scheme = await makeScheme({ applicableFromMonth: 0, applicableToMonth: 6 });

    const milestones = await generateTimeline(userId.toString());
    const monthZero = milestones.find((m) => m.month === 0);
    expect(monthZero.linkedSchemeIds.map((id) => id.toString())).toContain(scheme._id.toString());

    const monthTwelve = milestones.find((m) => m.month === 12);
    expect(monthTwelve.linkedSchemeIds).toHaveLength(0);
  });

  it('marks the first milestone as current when transition just started', async () => {
    const userId = new mongoose.Types.ObjectId();
    await FarmerProfile.create({ userId, transitionStartDate: monthsAgo(1) });

    const milestones = await generateTimeline(userId.toString());
    expect(milestones[0].status).toBe('current');
    expect(milestones[1].status).toBe('upcoming');
  });

  it('marks earlier milestones completed once enough time has passed', async () => {
    const userId = new mongoose.Types.ObjectId();
    await FarmerProfile.create({ userId, transitionStartDate: monthsAgo(8) });

    const milestones = await generateTimeline(userId.toString());
    expect(milestones[0].status).toBe('completed');
    expect(milestones[1].status).toBe('current');
  });
});
