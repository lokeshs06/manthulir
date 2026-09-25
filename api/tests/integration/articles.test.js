import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { User } from '../../src/models/User.js';

const app = createApp();

const registerAdmin = async (phone) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', phone, password: 'password123', role: 'farmer' });
  await User.findByIdAndUpdate(res.body.data.user.id, { role: 'admin' });
  const login = await request(app).post('/api/auth/login').send({ phone, password: 'password123' });
  return login.body.data;
};

describe('Articles', () => {
  it('creates an unpublished article and it does not appear in the public list', async () => {
    const { accessToken } = await registerAdmin('9111000001');
    const created = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Draft Article', content: 'Draft content', category: 'practice', isPublished: false });
    expect(created.status).toBe(201);

    const publicList = await request(app).get('/api/articles');
    expect(publicList.body.data.some((a) => a._id === created.body.data._id)).toBe(false);
  });

  it('publishing an article sets publishedAt and it appears publicly', async () => {
    const { accessToken } = await registerAdmin('9111000002');
    const created = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Published Article', content: 'Content here', category: 'philosophy', isPublished: true });
    expect(created.body.data.publishedAt).not.toBeNull();

    const publicList = await request(app).get('/api/articles');
    expect(publicList.body.data.some((a) => a._id === created.body.data._id)).toBe(true);
  });

  it('filters by category and text search', async () => {
    const { accessToken } = await registerAdmin('9111000003');
    await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Composting Basics', content: 'How to compost', category: 'practice', isPublished: true });
    await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Nammalvar Legacy', content: 'History', category: 'philosophy', isPublished: true });

    const byCategory = await request(app).get('/api/articles').query({ category: 'practice' });
    expect(byCategory.body.data.every((a) => a.category === 'practice')).toBe(true);
  });

  it('rejects a non-admin creating an article', async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Farmer', phone: '9111000004', password: 'password123', role: 'farmer' });
    const res = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${register.body.data.accessToken}`)
      .send({ title: 'X', content: 'X', category: 'practice' });
    expect(res.status).toBe(403);
  });
});
