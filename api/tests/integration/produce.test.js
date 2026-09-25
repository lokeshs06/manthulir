import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../src/app.js';

const app = createApp();

const registerFarmer = async (phone) => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Farmer', phone, password: 'password123', role: 'farmer' });
  return res.body.data;
};

const listingPayload = {
  cropName: 'Tomato',
  cropNameTa: 'தக்காளி',
  quantity: 50,
  unit: 'kg',
  pricePerUnit: 25,
};

describe('Produce listings', () => {
  it('creates a listing with server-computed badge, never the client-supplied one', async () => {
    const { accessToken } = await registerFarmer('9777777770');
    const res = await request(app)
      .post('/api/produce')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...listingPayload, badge: 'gold' }); // attempted spoof

    expect(res.status).toBe(201);
    expect(res.body.data.badge).toBe('none'); // real badge, not the spoofed 'gold'
  });

  it('lists only active listings publicly', async () => {
    const { accessToken } = await registerFarmer('9777777771');
    const created = await request(app)
      .post('/api/produce')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(listingPayload);

    await request(app).delete(`/api/produce/${created.body.data._id}`).set('Authorization', `Bearer ${accessToken}`);

    const publicList = await request(app).get('/api/produce');
    expect(publicList.body.data.some((p) => p._id === created.body.data._id)).toBe(false);
  });

  it('rejects updating a listing you do not own', async () => {
    const owner = await registerFarmer('9777777772');
    const other = await registerFarmer('9777777773');

    const created = await request(app)
      .post('/api/produce')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send(listingPayload);

    const res = await request(app)
      .patch(`/api/produce/${created.body.data._id}`)
      .set('Authorization', `Bearer ${other.accessToken}`)
      .send({ pricePerUnit: 999 });
    expect(res.status).toBe(403);
  });

  it('allows a cluster member to create a pooled listing under the cluster', async () => {
    const { accessToken } = await registerFarmer('9777777774');
    const cluster = await request(app)
      .post('/api/clusters')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Pool Cluster', district: 'Salem' });

    const res = await request(app)
      .post('/api/produce')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...listingPayload, clusterId: cluster.body.data._id });
    expect(res.status).toBe(201);
    expect(res.body.data.clusterId).toBe(cluster.body.data._id);
    expect(res.body.data.farmerId).toBeNull();
  });

  it('rejects pooling a listing under a cluster you do not belong to', async () => {
    const owner = await registerFarmer('9777777775');
    const outsider = await registerFarmer('9777777776');

    const cluster = await request(app)
      .post('/api/clusters')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ name: 'Owner Cluster', district: 'Salem' });

    const res = await request(app)
      .post('/api/produce')
      .set('Authorization', `Bearer ${outsider.accessToken}`)
      .send({ ...listingPayload, clusterId: cluster.body.data._id });
    expect(res.status).toBe(403);
  });
});
