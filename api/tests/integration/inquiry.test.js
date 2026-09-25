import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

const registerRole = async (role, phone) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: `${role} user`, phone, password: 'password123', role });
  return res.body.data;
};

const createListing = (accessToken) =>
  request(app)
    .post('/api/produce')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ cropName: 'Tomato', quantity: 10, unit: 'kg', pricePerUnit: 25 });

describe('Inquiries', () => {
  it('creates an inquiry as a buyer', async () => {
    const farmer = await registerRole('farmer', '9888888880');
    const buyer = await registerRole('buyer', '9888888881');
    const listing = await createListing(farmer.accessToken);

    const res = await request(app)
      .post('/api/inquiries')
      .set('Authorization', `Bearer ${buyer.accessToken}`)
      .send({ produceId: listing.body.data._id, message: 'Interested in bulk purchase' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
  });

  it('never reveals the farmer contact before the inquiry is accepted', async () => {
    const farmer = await registerRole('farmer', '9888888882');
    const buyer = await registerRole('buyer', '9888888883');
    const listing = await createListing(farmer.accessToken);

    const inquiry = await request(app)
      .post('/api/inquiries')
      .set('Authorization', `Bearer ${buyer.accessToken}`)
      .send({ produceId: listing.body.data._id, message: 'Hi' });

    const contactBefore = await request(app)
      .get(`/api/inquiries/${inquiry.body.data._id}/contact`)
      .set('Authorization', `Bearer ${buyer.accessToken}`);
    expect(contactBefore.status).toBe(403);

    await request(app)
      .post(`/api/inquiries/${inquiry.body.data._id}/accept`)
      .set('Authorization', `Bearer ${farmer.accessToken}`);

    const contactAfter = await request(app)
      .get(`/api/inquiries/${inquiry.body.data._id}/contact`)
      .set('Authorization', `Bearer ${buyer.accessToken}`);
    expect(contactAfter.status).toBe(200);
    expect(contactAfter.body.data.phone).toBe('9888888882');
  });

  it('rejects another farmer accepting an inquiry that is not theirs', async () => {
    const farmer = await registerRole('farmer', '9888888884');
    const otherFarmer = await registerRole('farmer', '9888888885');
    const buyer = await registerRole('buyer', '9888888886');
    const listing = await createListing(farmer.accessToken);

    const inquiry = await request(app)
      .post('/api/inquiries')
      .set('Authorization', `Bearer ${buyer.accessToken}`)
      .send({ produceId: listing.body.data._id, message: 'Hi' });

    const res = await request(app)
      .post(`/api/inquiries/${inquiry.body.data._id}/accept`)
      .set('Authorization', `Bearer ${otherFarmer.accessToken}`);
    expect(res.status).toBe(403);
  });
});
