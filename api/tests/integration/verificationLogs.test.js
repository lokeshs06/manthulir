import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import path from 'node:path';

// Absolute path, not a relative specifier — jest.unstable_mockModule's
// relative-path resolution can resolve against the wrong file (observed
// resolving against tests/setup.js instead of this file) when
// setupFilesAfterEnv is configured; an absolute path sidesteps that
// entirely since it resolves to the same real file either way.
jest.unstable_mockModule(path.resolve(process.cwd(), 'src/services/cloudinaryUpload.service.js'), () => ({
  uploadImageBuffer: jest.fn().mockResolvedValue({ url: 'https://example.com/mock.jpg', publicId: 'mock-id' }),
  deleteImage: jest.fn(),
}));

let app;
let Cluster;
let FarmerProfile;

beforeAll(async () => {
  const appModule = await import('../../src/app.js');
  app = appModule.createApp();
  ({ Cluster } = await import('../../src/models/Cluster.js'));
  ({ FarmerProfile } = await import('../../src/models/FarmerProfile.js'));
});

const registerFarmer = async (phone) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Farmer', phone, password: 'password123', role: 'farmer' });
  return res.body.data;
};

const createLog = (accessToken, practiceType = 'compost_application') =>
  request(app)
    .post('/api/verification-logs')
    .set('Authorization', `Bearer ${accessToken}`)
    .field('practiceType', practiceType)
    .attach('file', Buffer.from([0xff, 0xd8, 0xff, 0xe0]), 'photo.jpg');

describe('Verification logs', () => {
  it('creates a log and sets transitionStartDate on first log', async () => {
    const { accessToken, user } = await registerFarmer('9555555550');
    const res = await createLog(accessToken);
    expect(res.status).toBe(201);

    const profile = await FarmerProfile.findOne({ userId: user.id });
    expect(profile.transitionStartDate).not.toBeNull();
    expect(profile.transitionStatus).toBe('transitioning');
  });

  it('rejects creating a log without a photo', async () => {
    const { accessToken } = await registerFarmer('9555555551');
    const res = await request(app)
      .post('/api/verification-logs')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('practiceType', 'compost_application');
    expect(res.status).toBe(400);
  });

  it('allows a cluster member to peer-verify a fresh log, but not their own', async () => {
    const farmerA = await registerFarmer('9555555552');
    const farmerB = await registerFarmer('9555555553');

    const cluster = await Cluster.create({
      name: 'Test Cluster',
      district: 'Salem',
      leadId: (await FarmerProfile.findOne({ userId: farmerA.user.id }))._id,
      memberIds: [
        (await FarmerProfile.findOne({ userId: farmerA.user.id }))._id,
        (await FarmerProfile.findOne({ userId: farmerB.user.id }))._id,
      ],
      memberCount: 2,
    });
    await FarmerProfile.updateMany(
      { userId: { $in: [farmerA.user.id, farmerB.user.id] } },
      { $push: { clusterIds: cluster._id } },
    );

    const logRes = await createLog(farmerA.accessToken);

    const selfVerify = await request(app)
      .post(`/api/verification-logs/${logRes.body.data._id}/peer-verify`)
      .set('Authorization', `Bearer ${farmerA.accessToken}`);
    expect(selfVerify.status).toBe(400);

    const peerVerify = await request(app)
      .post(`/api/verification-logs/${logRes.body.data._id}/peer-verify`)
      .set('Authorization', `Bearer ${farmerB.accessToken}`);
    expect(peerVerify.status).toBe(200);
    expect(peerVerify.body.data.peerVerifications).toHaveLength(1);
  });

  it('rejects peer-verification from a farmer outside the cluster', async () => {
    const farmerA = await registerFarmer('9555555554');
    const outsider = await registerFarmer('9555555555');

    const logRes = await createLog(farmerA.accessToken);
    const res = await request(app)
      .post(`/api/verification-logs/${logRes.body.data._id}/peer-verify`)
      .set('Authorization', `Bearer ${outsider.accessToken}`);
    expect(res.status).toBe(403);
  });

  it('flags a log with a reason', async () => {
    const { accessToken } = await registerFarmer('9555555556');
    const logRes = await createLog(accessToken);
    const res = await request(app)
      .post(`/api/verification-logs/${logRes.body.data._id}/flag`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ flagReason: 'Photo looks unrelated' });
    expect(res.status).toBe(200);
    expect(res.body.data.flagged).toBe(true);
  });
});
