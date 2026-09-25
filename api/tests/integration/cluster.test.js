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

describe('Clusters', () => {
  it('creates a cluster with the creator as lead', async () => {
    const { accessToken } = await registerFarmer('9666666660');
    const res = await request(app)
      .post('/api/clusters')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Salem Organic Growers', district: 'Salem' });
    expect(res.status).toBe(201);
    expect(res.body.data.memberCount).toBe(1);
  });

  it('lets a farmer request to join and the lead approve it', async () => {
    const lead = await registerFarmer('9666666661');
    const applicant = await registerFarmer('9666666662');

    const cluster = await request(app)
      .post('/api/clusters')
      .set('Authorization', `Bearer ${lead.accessToken}`)
      .send({ name: 'Erode Growers', district: 'Erode' });

    const joinReq = await request(app)
      .post(`/api/clusters/${cluster.body.data._id}/join`)
      .set('Authorization', `Bearer ${applicant.accessToken}`);
    expect(joinReq.status).toBe(200);
    expect(joinReq.body.data.pendingJoinRequests).toHaveLength(1);

    const applicantFarmerId = joinReq.body.data.pendingJoinRequests[0].farmerId;
    const approve = await request(app)
      .post(`/api/clusters/${cluster.body.data._id}/join-requests/${applicantFarmerId}/approve`)
      .set('Authorization', `Bearer ${lead.accessToken}`);
    expect(approve.status).toBe(200);
    expect(approve.body.data.memberCount).toBe(2);
  });

  it('rejects a non-lead approving a join request', async () => {
    const lead = await registerFarmer('9666666663');
    const member = await registerFarmer('9666666664');
    const applicant = await registerFarmer('9666666665');

    const cluster = await request(app)
      .post('/api/clusters')
      .set('Authorization', `Bearer ${lead.accessToken}`)
      .send({ name: 'Test Cluster', district: 'Salem' });

    const joinReq = await request(app)
      .post(`/api/clusters/${cluster.body.data._id}/join`)
      .set('Authorization', `Bearer ${applicant.accessToken}`);

    const applicantFarmerId = joinReq.body.data.pendingJoinRequests[0].farmerId;
    const res = await request(app)
      .post(`/api/clusters/${cluster.body.data._id}/join-requests/${applicantFarmerId}/approve`)
      .set('Authorization', `Bearer ${member.accessToken}`);
    expect(res.status).toBe(403);
  });

  it('requires a successor when the lead leaves while other members remain', async () => {
    const lead = await registerFarmer('9666666666');
    const member = await registerFarmer('9666666667');

    const cluster = await request(app)
      .post('/api/clusters')
      .set('Authorization', `Bearer ${lead.accessToken}`)
      .send({ name: 'Test Cluster', district: 'Salem' });

    const joinReq = await request(app)
      .post(`/api/clusters/${cluster.body.data._id}/join`)
      .set('Authorization', `Bearer ${member.accessToken}`);
    const memberFarmerId = joinReq.body.data.pendingJoinRequests[0].farmerId;
    await request(app)
      .post(`/api/clusters/${cluster.body.data._id}/join-requests/${memberFarmerId}/approve`)
      .set('Authorization', `Bearer ${lead.accessToken}`);

    const leaveWithoutSuccessor = await request(app)
      .post(`/api/clusters/${cluster.body.data._id}/leave`)
      .set('Authorization', `Bearer ${lead.accessToken}`);
    expect(leaveWithoutSuccessor.status).toBe(400);

    const leaveWithSuccessor = await request(app)
      .post(`/api/clusters/${cluster.body.data._id}/leave`)
      .set('Authorization', `Bearer ${lead.accessToken}`)
      .send({ successorFarmerId: memberFarmerId });
    expect(leaveWithSuccessor.status).toBe(200);
    expect(leaveWithSuccessor.body.data.leadId).toBe(memberFarmerId);
  });

  it('enforces the 3-cluster-per-farmer cap', async () => {
    const farmer = await registerFarmer('9666666668');
    for (let i = 0; i < 3; i++) {
      const res = await request(app)
        .post('/api/clusters')
        .set('Authorization', `Bearer ${farmer.accessToken}`)
        .send({ name: `Cluster ${i}`, district: 'Salem' });
      expect(res.status).toBe(201);
    }
    const fourth = await request(app)
      .post('/api/clusters')
      .set('Authorization', `Bearer ${farmer.accessToken}`)
      .send({ name: 'Cluster 4', district: 'Salem' });
    expect(fourth.status).toBe(400);
  });
});
