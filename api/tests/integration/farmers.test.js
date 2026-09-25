import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

const registerFarmer = async (phone = '9222222222') => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Farmer One', phone, password: 'password123', role: 'farmer' });
  return res.body.data;
};

describe('Farmer profile', () => {
  it('creates a bare profile at registration and allows completing it', async () => {
    const { accessToken } = await registerFarmer();

    const before = await request(app).get('/api/farmers/me').set('Authorization', `Bearer ${accessToken}`);
    expect(before.status).toBe(200);
    expect(before.body.data.district).toBeNull();

    const update = await request(app)
      .patch('/api/farmers/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ district: 'Salem', landSizeAcres: 2, crops: ['tomato'] });
    expect(update.status).toBe(200);
    expect(update.body.data.district).toBe('Salem');
    expect(update.body.data.crops).toEqual(['tomato']);
  });

  it('rejects an invalid district', async () => {
    const { accessToken } = await registerFarmer('9222222223');
    const res = await request(app)
      .patch('/api/farmers/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ district: 'Not A Real District' });
    expect(res.status).toBe(400);
  });

  it('exposes a public summary without leaking phone number', async () => {
    const { accessToken } = await registerFarmer('9222222224');
    await request(app)
      .patch('/api/farmers/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ district: 'Salem' });

    const me = await request(app).get('/api/farmers/me').set('Authorization', `Bearer ${accessToken}`);
    const publicRes = await request(app).get(`/api/farmers/${me.body.data._id}/public`);

    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.district).toBe('Salem');
    expect(publicRes.body.data.phone).toBeUndefined();
  });

  it('generates a transition timeline on first request', async () => {
    const { accessToken } = await registerFarmer('9222222225');
    const res = await request(app).get('/api/farmers/me/timeline').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('rejects a buyer trying to access farmer-only routes', async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Buyer One', phone: '9222222226', password: 'password123', role: 'buyer' });
    const res = await request(app)
      .get('/api/farmers/me')
      .set('Authorization', `Bearer ${register.body.data.accessToken}`);
    expect(res.status).toBe(403);
  });
});
