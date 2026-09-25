import { jest, describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import path from 'node:path';
import crypto from 'node:crypto';

const mockSendTextMessage = jest.fn().mockResolvedValue(undefined);
const mockDownloadMedia = jest.fn();

jest.unstable_mockModule(path.resolve(process.cwd(), 'src/services/whatsappClient.service.js'), () => ({
  sendTextMessage: mockSendTextMessage,
  downloadMedia: mockDownloadMedia,
}));
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
let PestRemedy;

beforeAll(async () => {
  const appModule = await import('../../src/app.js');
  app = appModule.createApp();
  ({ User } = await import('../../src/models/User.js'));
  ({ FarmerProfile } = await import('../../src/models/FarmerProfile.js'));
  ({ PestRemedy } = await import('../../src/models/PestRemedy.js'));
});

const createRegisteredFarmer = async (phone) => {
  const user = await User.create({ name: 'Farmer', phone, passwordHash: 'x', role: 'farmer' });
  await FarmerProfile.create({ userId: user._id });
  return user;
};

beforeEach(() => {
  mockSendTextMessage.mockClear();
  mockDownloadMedia.mockReset();
});

const APP_SECRET = 'test-app-secret';

const sign = (rawBody) => 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(rawBody).digest('hex');

const postWebhook = (payloadObj) => {
  const raw = JSON.stringify(payloadObj);
  return request(app)
    .post('/api/whatsapp/webhook')
    .set('Content-Type', 'application/json')
    .set('X-Hub-Signature-256', sign(raw))
    .send(raw);
};

const messagePayload = (from, message) => ({
  entry: [{ changes: [{ value: { messages: [{ from, ...message }] } }] }],
});

const lastReplyTo = (phone) => {
  const calls = mockSendTextMessage.mock.calls.filter((c) => c[0] === phone);
  return calls.length ? calls[calls.length - 1][1] : undefined;
};

describe('WhatsApp webhook', () => {
  it('completes the GET verification handshake with a matching token', async () => {
    const res = await request(app)
      .get('/api/whatsapp/webhook')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'test-verify-token', 'hub.challenge': '12345' });
    expect(res.status).toBe(200);
    expect(res.text).toBe('12345');
  });

  it('rejects the verification handshake with a wrong token', async () => {
    const res = await request(app)
      .get('/api/whatsapp/webhook')
      .query({ 'hub.mode': 'subscribe', 'hub.verify_token': 'wrong-token', 'hub.challenge': '12345' });
    expect(res.status).toBe(403);
  });

  it('rejects a POST webhook with an invalid signature', async () => {
    const raw = JSON.stringify(messagePayload('919000000001', { text: { body: '1' } }));
    const res = await request(app)
      .post('/api/whatsapp/webhook')
      .set('Content-Type', 'application/json')
      .set('X-Hub-Signature-256', 'sha256=wrongsignature')
      .send(raw);
    expect(res.status).toBe(401);
  });

  it('tells an unregistered phone number to register first', async () => {
    const res = await postWebhook(messagePayload('919000000099', { text: { body: 'hi' } }));
    expect(res.status).toBe(200);
    expect(lastReplyTo('919000000099')).toMatch(/register/i);
  });

  it('walks a registered farmer through the scheme-match flow', async () => {
    await createRegisteredFarmer('9000000010');
    const phone = '919000000010';

    await postWebhook(messagePayload(phone, { text: { body: '1' } }));
    expect(lastReplyTo(phone)).toMatch(/district/i);

    await postWebhook(messagePayload(phone, { text: { body: 'Salem' } }));
    expect(lastReplyTo(phone)).toMatch(/land size|acres/i);

    await postWebhook(messagePayload(phone, { text: { body: '2.5' } }));
    expect(lastReplyTo(phone)).toMatch(/crop/i);

    await postWebhook(messagePayload(phone, { text: { body: 'tomato' } }));
    expect(mockSendTextMessage).toHaveBeenCalled();
  });

  it('walks a registered farmer through the pest-detection flow via a sent photo', async () => {
    await PestRemedy.create({ modelClassLabel: 'tomato_aphid', pestName: 'Aphids', problemType: 'insect' });
    await createRegisteredFarmer('9000000011');
    const phone = '919000000011';
    mockDownloadMedia.mockResolvedValue(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]));

    await postWebhook(messagePayload(phone, { text: { body: '2' } }));
    expect(lastReplyTo(phone)).toMatch(/photo/i);

    await postWebhook(messagePayload(phone, { type: 'image', image: { id: 'media-1' } }));
    expect(mockDownloadMedia).toHaveBeenCalledWith('media-1');
    expect(lastReplyTo(phone)).toMatch(/aphid/i);
  });
});
