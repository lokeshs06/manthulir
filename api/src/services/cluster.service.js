import { Cluster } from '../models/Cluster.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { ApiError } from '../utils/ApiError.js';
import { CLUSTER_MAX_PER_FARMER } from '../config/constants.js';

const getFarmerProfileOrThrow = async (userId) => {
  const profile = await FarmerProfile.findOne({ userId });
  if (!profile) throw ApiError.notFound('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found');
  return profile;
};

const getClusterOrThrow = async (clusterId) => {
  const cluster = await Cluster.findById(clusterId);
  if (!cluster) throw ApiError.notFound('CLUSTER_NOT_FOUND', 'Cluster not found');
  return cluster;
};

const assertUnderCap = (profile) => {
  if (profile.clusterIds.length >= CLUSTER_MAX_PER_FARMER) {
    throw ApiError.badRequest('CLUSTER_CAP_REACHED', `A farmer may belong to at most ${CLUSTER_MAX_PER_FARMER} clusters`);
  }
};

export const createCluster = async (userId, { name, district }) => {
  const profile = await getFarmerProfileOrThrow(userId);
  assertUnderCap(profile);

  const cluster = await Cluster.create({
    name,
    district,
    leadId: profile._id,
    memberIds: [profile._id],
    memberCount: 1,
    totalLandSizeAcres: profile.landSizeAcres || 0,
  });

  profile.clusterIds.push(cluster._id);
  await profile.save();
  return cluster;
};

export const listClusters = async (district) => Cluster.find(district ? { district } : {});

export const getCluster = async (clusterId) => getClusterOrThrow(clusterId);

export const requestToJoin = async (userId, clusterId) => {
  const profile = await getFarmerProfileOrThrow(userId);
  assertUnderCap(profile);

  const cluster = await getClusterOrThrow(clusterId);
  if (cluster.memberIds.some((id) => id.equals(profile._id))) {
    throw ApiError.conflict('ALREADY_MEMBER', 'You are already a member of this cluster');
  }
  if (cluster.pendingJoinRequests.some((r) => r.farmerId.equals(profile._id))) {
    throw ApiError.conflict('REQUEST_ALREADY_PENDING', 'You already have a pending request for this cluster');
  }

  cluster.pendingJoinRequests.push({ farmerId: profile._id });
  await cluster.save();
  return cluster;
};

const assertIsLead = (cluster, leadProfileId) => {
  if (!cluster.leadId.equals(leadProfileId)) {
    throw ApiError.forbidden('NOT_CLUSTER_LEAD', 'Only the cluster lead can perform this action');
  }
};

export const approveJoinRequest = async (userId, clusterId, farmerId) => {
  const leadProfile = await getFarmerProfileOrThrow(userId);
  const cluster = await getClusterOrThrow(clusterId);
  assertIsLead(cluster, leadProfile._id);

  const request = cluster.pendingJoinRequests.find((r) => r.farmerId.equals(farmerId));
  if (!request) throw ApiError.notFound('REQUEST_NOT_FOUND', 'Join request not found');

  const applicantProfile = await FarmerProfile.findById(farmerId);
  assertUnderCap(applicantProfile);

  cluster.memberIds.push(farmerId);
  cluster.memberCount = cluster.memberIds.length;
  cluster.totalLandSizeAcres += applicantProfile.landSizeAcres || 0;
  cluster.pendingJoinRequests = cluster.pendingJoinRequests.filter((r) => !r.farmerId.equals(farmerId));
  await cluster.save();

  applicantProfile.clusterIds.push(cluster._id);
  await applicantProfile.save();

  return cluster;
};

export const rejectJoinRequest = async (userId, clusterId, farmerId) => {
  const leadProfile = await getFarmerProfileOrThrow(userId);
  const cluster = await getClusterOrThrow(clusterId);
  assertIsLead(cluster, leadProfile._id);

  cluster.pendingJoinRequests = cluster.pendingJoinRequests.filter((r) => !r.farmerId.equals(farmerId));
  await cluster.save();
  return cluster;
};

export const leaveCluster = async (userId, clusterId, { successorFarmerId } = {}) => {
  const profile = await getFarmerProfileOrThrow(userId);
  const cluster = await getClusterOrThrow(clusterId);

  const isMember = cluster.memberIds.some((id) => id.equals(profile._id));
  if (!isMember) throw ApiError.badRequest('NOT_A_MEMBER', 'You are not a member of this cluster');

  const isLead = cluster.leadId.equals(profile._id);
  const remainingMembers = cluster.memberIds.filter((id) => !id.equals(profile._id));

  if (isLead && remainingMembers.length > 0) {
    if (!successorFarmerId) {
      throw ApiError.badRequest(
        'SUCCESSOR_REQUIRED',
        'As the cluster lead, you must name a successor before leaving while other members remain',
      );
    }
    if (!remainingMembers.some((id) => id.equals(successorFarmerId))) {
      throw ApiError.badRequest('INVALID_SUCCESSOR', 'The successor must be an existing member of this cluster');
    }
    cluster.leadId = successorFarmerId;
  }

  cluster.memberIds = remainingMembers;
  cluster.memberCount = remainingMembers.length;
  cluster.totalLandSizeAcres = Math.max(0, cluster.totalLandSizeAcres - (profile.landSizeAcres || 0));

  profile.clusterIds = profile.clusterIds.filter((id) => !id.equals(clusterId));
  await profile.save();

  if (remainingMembers.length === 0) {
    await Cluster.findByIdAndDelete(clusterId);
    return null;
  }

  await cluster.save();
  return cluster;
};
