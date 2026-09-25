import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as clusterService from '../services/cluster.service.js';

export const createClusterHandler = asyncHandler(async (req, res) => {
  const cluster = await clusterService.createCluster(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, data: cluster });
});

export const listClustersHandler = asyncHandler(async (req, res) => {
  const clusters = await clusterService.listClusters(req.query.district);
  sendSuccess(res, { data: clusters });
});

export const getClusterHandler = asyncHandler(async (req, res) => {
  const cluster = await clusterService.getCluster(req.params.id);
  sendSuccess(res, { data: cluster });
});

export const requestToJoinHandler = asyncHandler(async (req, res) => {
  const cluster = await clusterService.requestToJoin(req.user.id, req.params.id);
  sendSuccess(res, { data: cluster });
});

export const approveJoinRequestHandler = asyncHandler(async (req, res) => {
  const cluster = await clusterService.approveJoinRequest(req.user.id, req.params.id, req.params.farmerId);
  sendSuccess(res, { data: cluster });
});

export const rejectJoinRequestHandler = asyncHandler(async (req, res) => {
  const cluster = await clusterService.rejectJoinRequest(req.user.id, req.params.id, req.params.farmerId);
  sendSuccess(res, { data: cluster });
});

export const leaveClusterHandler = asyncHandler(async (req, res) => {
  const cluster = await clusterService.leaveCluster(req.user.id, req.params.id, req.body);
  sendSuccess(res, { data: cluster });
});
