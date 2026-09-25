import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { Scheme } from '../../src/models/Scheme.js';

const app = createApp();

const registerAdmin = async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', phone: '9444444440', password: 'password123', role: 'farmer' });
  // Promote directly via the model — there's no public admin-signup route.
  const { User } = await import('../../src/models/User.js');
  await User.findByIdAndUpdate(res.body.data.user.id, { role: 'admin' });
  const login = await request(app).post('/api/auth/login').send({ phone: '9444444440', password: 'password123' });
  return login.body.data;
};

describe('Schemes', () => {
  it('creates a scheme as unverified (admin)', async () => {
    const { accessToken } = await registerAdmin();
    const res = await request(app)
      .post('/api/schemes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test Scheme', description: 'A test scheme', department: 'Dept of Testing' });
    expect(res.status).toBe(201);
    expect(res.body.data.verified).toBe(false);
  });

  it('rejects a non-admin creating a scheme', async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Farmer', phone: '9444444441', password: 'password123', role: 'farmer' });
    const res = await request(app)
      .post('/api/schemes')
      .set('Authorization', `Bearer ${register.body.data.accessToken}`)
      .send({ name: 'X', description: 'X', department: 'X' });
    expect(res.status).toBe(403);
  });

  it('resets verification when an admin edits a verified scheme', async () => {
    const { accessToken } = await registerAdmin();
    const created = await request(app)
      .post('/api/schemes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Editable Scheme', description: 'X', department: 'X' });

    await request(app).post(`/api/schemes/${created.body.data._id}/verify`).set('Authorization', `Bearer ${accessToken}`);

    const updated = await request(app)
      .patch(`/api/schemes/${created.body.data._id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'Changed description' });

    expect(updated.body.data.verified).toBe(false);
  });

  it('matches an anonymous visitor by query criteria', async () => {
    await Scheme.create({
      name: 'Open Scheme',
      description: 'X',
      department: 'X',
      verified: true,
      eligibility: { applicableDistricts: [], applicableCrops: [] },
    });

    const res = await request(app).get('/api/schemes/match').query({ district: 'Salem' });
    expect(res.status).toBe(200);
    expect(res.body.data.matched.length).toBeGreaterThan(0);
  });

  it('soft-deletes a scheme so it no longer appears in listings', async () => {
    const { accessToken } = await registerAdmin();
    const created = await request(app)
      .post('/api/schemes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Deletable Scheme', description: 'X', department: 'X' });

    await request(app).delete(`/api/schemes/${created.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);

    const list = await request(app).get('/api/schemes');
    expect(list.body.data.some((s) => s._id === created.body.data._id)).toBe(false);
  });
});
