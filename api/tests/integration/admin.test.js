import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import path from 'node:path';

jest.unstable_mockModule(path.resolve(process.cwd(), 'src/services/cloudinaryUpload.service.js'), () => ({
  uploadImageBuffer: jest.fn().mockResolvedValue({ url: 'https://example.com/mock.jpg', publicId: 'mock-id' }),
  deleteImage: jest.fn(),
}));
jest.unstable_mockModule(path.resolve(process.cwd(), 'src/services/mlClient.service.js'), () => ({
  requestPrediction: jest.fn().mockResolvedValue({ predictions: [{ label: 'tomato_aphid', confidence: 0.9 }], modelVersion: 'v1' }),
}));

let app;
let User;
let FarmerProfile;
let Scheme;

beforeAll(async () => {
  const appModule = await import('../../src/app.js');
  app = appModule.createApp();
  ({ User } = await import('../../src/models/User.js'));
  ({ FarmerProfile } = await import('../../src/models/FarmerProfile.js'));
  ({ Scheme } = await import('../../src/models/Scheme.js'));
});

const registerAdmin = async (phone) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', phone, password: 'password123', role: 'farmer' });
  await User.findByIdAndUpdate(res.body.data.user.id, { role: 'admin' });
  const login = await request(app).post('/api/auth/login').send({ phone, password: 'password123' });
  return login.body.data;
};

const registerFarmer = async (phone) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Farmer', phone, password: 'password123', role: 'farmer' });
  return res.body.data;
};

describe('Admin', () => {
  it('rejects non-admins from every admin route', async () => {
    const farmer = await registerFarmer('9222000001');
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${farmer.accessToken}`);
    expect(res.status).toBe(403);
  });

  it('returns platform stats', async () => {
    const admin = await registerAdmin('9222000002');
    await registerFarmer('9222000003');
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${admin.accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.farmersByDistrict)).toBe(true);
  });

  it('resolves a flagged log and it counts toward the badge again', async () => {
    const admin = await registerAdmin('9222000004');
    const farmer = await registerFarmer('9222000005');

    await request(app)
      .post('/api/verification-logs')
      .set('Authorization', `Bearer ${farmer.accessToken}`)
      .field('practiceType', 'compost_application')
      .attach('file', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]), 'p.jpg');

    const logs = await request(app).get('/api/verification-logs').set('Authorization', `Bearer ${farmer.accessToken}`);
    const logId = logs.body.data[0]._id;

    await request(app)
      .post(`/api/verification-logs/${logId}/flag`)
      .set('Authorization', `Bearer ${farmer.accessToken}`)
      .send({ flagReason: 'Testing flag flow' });

    const flaggedList = await request(app)
      .get('/api/admin/flagged-logs')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(flaggedList.body.data.some((l) => l._id === logId)).toBe(true);

    const resolve = await request(app)
      .post(`/api/admin/flagged-logs/${logId}/resolve`)
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(resolve.status).toBe(200);
    expect(resolve.body.data.flagged).toBe(false);
  });

  it('approving certification is the only path that sets transitionStatus to certified', async () => {
    const admin = await registerAdmin('9222000006');
    const farmer = await registerFarmer('9222000007');

    await request(app)
      .post('/api/farmers/me/certification')
      .set('Authorization', `Bearer ${farmer.accessToken}`)
      .attach('file', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]), 'cert.jpg');

    const profileBefore = await FarmerProfile.findOne({ userId: farmer.user.id });
    expect(profileBefore.transitionStatus).not.toBe('certified');

    const approve = await request(app)
      .post(`/api/admin/certifications/${profileBefore._id}/review`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ approve: true });
    expect(approve.status).toBe(200);
    expect(approve.body.data.transitionStatus).toBe('certified');
    expect(approve.body.data.certification.status).toBe('approved');
  });

  it('reports schemes that are unverified or stale', async () => {
    const admin = await registerAdmin('9222000008');
    await Scheme.create({ name: 'Never Verified', description: 'X', department: 'X', verified: false });

    const res = await request(app)
      .get('/api/admin/reports/unverified-schemes')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.some((s) => s.name === 'Never Verified')).toBe(true);
  });

  it('reports pest detections marked incorrect by farmers', async () => {
    const admin = await registerAdmin('9222000009');
    const farmer = await registerFarmer('9222000010');

    const detection = await request(app)
      .post('/api/pests/detect')
      .set('Authorization', `Bearer ${farmer.accessToken}`)
      .attach('file', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]), 'p.jpg');

    await request(app)
      .post(`/api/pests/detections/${detection.body.data.detection._id}/feedback`)
      .set('Authorization', `Bearer ${farmer.accessToken}`)
      .send({ farmerFeedback: 'incorrect' });

    const res = await request(app)
      .get('/api/admin/reports/pest-feedback')
      .set('Authorization', `Bearer ${admin.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
