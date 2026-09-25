import { Produce } from '../models/Produce.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { Cluster } from '../models/Cluster.js';
import { ApiError } from '../utils/ApiError.js';
import { lowestBadge } from './badge.service.js';

const monthsSince = (date) => {
  if (!date) return null;
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 30));
};

// Badge/transition fields are always derived server-side from the actual
// owning farmer (or, for a cluster listing, the lowest-badged member) —
// never accepted from the client, so a farmer can't just claim a badge or
// certification status they don't actually have.
const computeTrustFields = async ({ farmerId, clusterId }) => {
  if (farmerId) {
    const profile = await FarmerProfile.findById(farmerId);
    return {
      badge: profile.badge,
      transitionStatus: profile.transitionStatus,
      transitionMonth: monthsSince(profile.transitionStartDate),
    };
  }

  const cluster = await Cluster.findById(clusterId).populate('memberIds');
  const members = cluster.memberIds;
  return {
    badge: lowestBadge(members.map((m) => m.badge)),
    transitionStatus: members.every((m) => m.transitionStatus === 'certified') ? 'certified' : 'transitioning',
    transitionMonth: Math.min(...members.map((m) => monthsSince(m.transitionStartDate) ?? Infinity)),
  };
};

export const createProduce = async (userId, data) => {
  const { clusterId, ...rest } = data;
  let ownerFields;

  if (clusterId) {
    const cluster = await Cluster.findById(clusterId);
    if (!cluster) throw ApiError.notFound('CLUSTER_NOT_FOUND', 'Cluster not found');
    const profile = await FarmerProfile.findOne({ userId });
    if (!profile || !cluster.memberIds.some((id) => id.equals(profile._id))) {
      throw ApiError.forbidden('NOT_CLUSTER_MEMBER', 'You must be a member of this cluster to pool a listing under it');
    }
    ownerFields = { clusterId, farmerId: null };
  } else {
    const profile = await FarmerProfile.findOne({ userId });
    if (!profile) throw ApiError.notFound('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found');
    ownerFields = { farmerId: profile._id, clusterId: null };
  }

  const trust = await computeTrustFields(ownerFields);
  return Produce.create({ ...rest, ...ownerFields, ...trust });
};

const getOwnedProduceOrThrow = async (userId, produceId) => {
  const produce = await Produce.findById(produceId);
  if (!produce) throw ApiError.notFound('PRODUCE_NOT_FOUND', 'Produce listing not found');

  const profile = await FarmerProfile.findOne({ userId });
  const ownsDirectly = produce.farmerId && profile && produce.farmerId.equals(profile._id);
  const ownsViaCluster =
    produce.clusterId && profile && profile.clusterIds.some((id) => id.equals(produce.clusterId));
  if (!ownsDirectly && !ownsViaCluster) {
    throw ApiError.forbidden('NOT_LISTING_OWNER', 'You do not own this listing');
  }
  return produce;
};

export const updateProduce = async (userId, produceId, updates) => {
  const produce = await getOwnedProduceOrThrow(userId, produceId);
  // Trust fields are never client-updatable — strip them defensively even
  // though the validator already excludes them from the request schema.
  const { badge, transitionStatus, transitionMonth, farmerId, clusterId, ...safeUpdates } = updates;
  Object.assign(produce, safeUpdates);
  await produce.save();
  return produce;
};

export const deactivateProduce = async (userId, produceId) => {
  const produce = await getOwnedProduceOrThrow(userId, produceId);
  produce.isActive = false;
  await produce.save();
  return produce;
};

export const listActiveProduce = async ({ cropName, district, skip, limit }) => {
  const filter = { isActive: true };
  if (cropName) filter.cropName = new RegExp(cropName, 'i');

  let query = Produce.find(filter);
  if (district) {
    // District lives on the owning farmer/cluster, not the listing itself.
    const farmerIds = await FarmerProfile.find({ district }).distinct('_id');
    const clusterIds = await Cluster.find({ district }).distinct('_id');
    query = Produce.find({ ...filter, $or: [{ farmerId: { $in: farmerIds } }, { clusterId: { $in: clusterIds } }] });
  }

  const [items, total] = await Promise.all([
    query.clone().sort({ createdAt: -1 }).skip(skip).limit(limit),
    query.clone().countDocuments(),
  ]);
  return { items, total };
};

export const listMyProduce = async (userId) => {
  const profile = await FarmerProfile.findOne({ userId });
  if (!profile) throw ApiError.notFound('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found');
  return Produce.find({ $or: [{ farmerId: profile._id }, { clusterId: { $in: profile.clusterIds } }] }).sort({
    createdAt: -1,
  });
};

// Called by badge.service.js whenever a farmer's badge changes, so any
// listing that displays a badge (their own, or a cluster's pooled one they
// belong to) stays accurate without a farmer having to re-save it.
export const refreshProduceBadgesForFarmer = async (farmerProfileId) => {
  const ownListings = await Produce.find({ farmerId: farmerProfileId });
  for (const listing of ownListings) {
    const trust = await computeTrustFields({ farmerId: farmerProfileId });
    Object.assign(listing, trust);
    await listing.save();
  }

  const profile = await FarmerProfile.findById(farmerProfileId);
  const clusterListings = await Produce.find({ clusterId: { $in: profile.clusterIds } });
  for (const listing of clusterListings) {
    const trust = await computeTrustFields({ clusterId: listing.clusterId });
    Object.assign(listing, trust);
    await listing.save();
  }
};
