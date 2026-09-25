import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

const registerPayload = {
  name: 'Test Farmer',
  phone: '9111111111',
  password: 'strongPassword123',
  role: 'farmer',
};

describe('Auth flow', () => {
  it('registers a new farmer and returns tokens', async () => {
    const res = await request(app).post('/api/auth/register').send(registerPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.role).toBe('farmer');
  });

  it('rejects registering the same phone number twice', async () => {
    await request(app).post('/api/auth/register').send(registerPayload);
    const res = await request(app).post('/api/auth/register').send(registerPayload);
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials and rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send(registerPayload);

    const good = await request(app)
      .post('/api/auth/login')
      .send({ phone: registerPayload.phone, password: registerPayload.password });
    expect(good.status).toBe(200);

    const bad = await request(app)
      .post('/api/auth/login')
      .send({ phone: registerPayload.phone, password: 'wrongPassword' });
    expect(bad.status).toBe(401);
  });

  it('returns the current user from /me with a valid access token', async () => {
    const register = await request(app).post('/api/auth/register').send(registerPayload);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${register.body.data.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.phone).toBe(registerPayload.phone);
  });

  it('rejects /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rotates the refresh token and invalidates the old one on reuse', async () => {
    const register = await request(app).post('/api/auth/register').send(registerPayload);
    const oldRefreshToken = register.body.data.refreshToken;

    const refreshed = await request(app).post('/api/auth/refresh').send({ refreshToken: oldRefreshToken });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.refreshToken).not.toBe(oldRefreshToken);

    // Replaying the old (now-rotated-out) refresh token must fail.
    const replay = await request(app).post('/api/auth/refresh').send({ refreshToken: oldRefreshToken });
    expect(replay.status).toBe(401);
  });

  it('logs out and clears the refresh token', async () => {
    const register = await request(app).post('/api/auth/register').send(registerPayload);
    const { accessToken, refreshToken } = register.body.data;

    const logout = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${accessToken}`);
    expect(logout.status).toBe(200);

    const refreshAfterLogout = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(refreshAfterLogout.status).toBe(401);
  });
});
