import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

const registerBuyer = async (phone = '9333333333') => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Buyer One', phone, password: 'password123', role: 'buyer' });
  return res.body.data;
};

describe('Buyer profile', () => {
  it('creates a bare buyer profile at registration', async () => {
    const { accessToken } = await registerBuyer();
    const res = await request(app).get('/api/buyers/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.businessName).toBe('Buyer One');
  });

  it('updates buyer profile fields', async () => {
    const { accessToken } = await registerBuyer('9333333334');
    const res = await request(app)
      .patch('/api/buyers/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ businessName: 'Fresh Produce Traders', district: 'Coimbatore', interestedCrops: ['tomato'] });
    expect(res.status).toBe(200);
    expect(res.body.data.businessName).toBe('Fresh Produce Traders');
  });

  it('rejects a farmer trying to access buyer-only routes', async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Farmer', phone: '9333333335', password: 'password123', role: 'farmer' });
    const res = await request(app)
      .get('/api/buyers/me')
      .set('Authorization', `Bearer ${register.body.data.accessToken}`);
    expect(res.status).toBe(403);
  });
});
