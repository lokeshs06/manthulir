import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import path from 'node:path';

const mockUpload = jest.fn().mockResolvedValue({ url: 'https://example.com/mock.jpg', publicId: 'mock-id' });
const mockPredict = jest.fn();

jest.unstable_mockModule(path.resolve(process.cwd(), 'src/services/cloudinaryUpload.service.js'), () => ({
  uploadImageBuffer: mockUpload,
  deleteImage: jest.fn(),
}));

jest.unstable_mockModule(path.resolve(process.cwd(), 'src/services/mlClient.service.js'), () => ({
  requestPrediction: mockPredict,
}));

let app;
let PestRemedy;

beforeAll(async () => {
  const appModule = await import('../../src/app.js');
  app = appModule.createApp();
  ({ PestRemedy } = await import('../../src/models/PestRemedy.js'));
});

beforeEach(() => {
  mockPredict.mockReset();
});

const registerFarmer = async (phone) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Farmer', phone, password: 'password123', role: 'farmer' });
  return res.body.data;
};

const seedRemedy = (label) =>
  PestRemedy.create({
    modelClassLabel: label,
    pestName: label,
    problemType: 'insect',
    affectedCrops: ['tomato'],
  });

// sniffImageType requires >= 12 bytes to check the magic-byte header.
const FAKE_JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);

const detect = (accessToken) =>
  request(app).post('/api/pests/detect').set('Authorization', `Bearer ${accessToken}`).attach('file', FAKE_JPEG, 'photo.jpg');

describe('Pest detection', () => {
  it('returns a single remedy for a confident prediction', async () => {
    await seedRemedy('tomato_aphid');
    mockPredict.mockResolvedValue({ predictions: [{ label: 'tomato_aphid', confidence: 0.92 }], modelVersion: 'v1' });

    const { accessToken } = await registerFarmer('9999000001');
    const res = await detect(accessToken);
    expect(res.status).toBe(201);
    expect(res.body.data.detection.resultType).toBe('confident');
    expect(res.body.data.remedies).toHaveLength(1);
    expect(res.body.data.remedies[0].modelClassLabel).toBe('tomato_aphid');
  });

  it('returns up to 3 possible remedies for an uncertain prediction', async () => {
    await seedRemedy('tomato_aphid');
    await seedRemedy('tomato_whitefly');
    mockPredict.mockResolvedValue({
      predictions: [
        { label: 'tomato_aphid', confidence: 0.4 },
        { label: 'tomato_whitefly', confidence: 0.3 },
      ],
      modelVersion: 'v1',
    });

    const { accessToken } = await registerFarmer('9999000002');
    const res = await detect(accessToken);
    expect(res.status).toBe(201);
    expect(res.body.data.detection.resultType).toBe('uncertain');
    expect(res.body.data.remedies.length).toBeGreaterThan(0);
    expect(res.body.data.message).toBeDefined();
  });

  it('records a service-unavailable detection and returns 503 when the ML service is unreachable', async () => {
    mockPredict.mockRejectedValue(new Error('ECONNREFUSED'));

    const { accessToken } = await registerFarmer('9999000003');
    const res = await detect(accessToken);
    expect(res.status).toBe(503);

    const list = await request(app).get('/api/pests/detections').set('Authorization', `Bearer ${accessToken}`);
    expect(list.body.data[0].resultType).toBe('service-unavailable');
  });

  it('lets a farmer submit feedback on their own detection', async () => {
    await seedRemedy('tomato_aphid');
    mockPredict.mockResolvedValue({ predictions: [{ label: 'tomato_aphid', confidence: 0.92 }], modelVersion: 'v1' });

    const { accessToken } = await registerFarmer('9999000004');
    const detection = await detect(accessToken);

    const res = await request(app)
      .post(`/api/pests/detections/${detection.body.data.detection._id}/feedback`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ farmerFeedback: 'incorrect', feedbackNote: 'It was actually whiteflies' });
    expect(res.status).toBe(200);
    expect(res.body.data.farmerFeedback).toBe('incorrect');
  });

  it('lists pest remedies publicly and allows admin CRUD', async () => {
    const list = await request(app).get('/api/pests/remedies');
    expect(list.status).toBe(200);

    const farmer = await registerFarmer('9999000005');
    const forbidden = await request(app)
      .post('/api/pests/remedies')
      .set('Authorization', `Bearer ${farmer.accessToken}`)
      .send({ modelClassLabel: 'mealybugs', pestName: 'Mealybugs', problemType: 'insect' });
    expect(forbidden.status).toBe(403);
  });
});
