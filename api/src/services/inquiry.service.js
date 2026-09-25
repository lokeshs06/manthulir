import { Inquiry } from '../models/Inquiry.js';
import { Produce } from '../models/Produce.js';
import { BuyerProfile } from '../models/BuyerProfile.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const createInquiry = async (userId, { produceId, message }) => {
  const buyerProfile = await BuyerProfile.findOne({ userId });
  if (!buyerProfile) throw ApiError.notFound('BUYER_PROFILE_NOT_FOUND', 'Buyer profile not found');

  const produce = await Produce.findOne({ _id: produceId, isActive: true });
  if (!produce) throw ApiError.notFound('PRODUCE_NOT_FOUND', 'Produce listing not found');

  return Inquiry.create({
    produceId,
    buyerId: buyerProfile._id,
    farmerId: produce.farmerId,
    clusterId: produce.clusterId,
    message,
  });
};

export const listMyInquiriesAsBuyer = async (userId) => {
  const buyerProfile = await BuyerProfile.findOne({ userId });
  if (!buyerProfile) throw ApiError.notFound('BUYER_PROFILE_NOT_FOUND', 'Buyer profile not found');
  return Inquiry.find({ buyerId: buyerProfile._id }).populate('produceId').sort({ createdAt: -1 });
};

export const listInquiriesForMyProduce = async (userId) => {
  const profile = await FarmerProfile.findOne({ userId });
  if (!profile) throw ApiError.notFound('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found');

  return Inquiry.find({
    $or: [{ farmerId: profile._id }, { clusterId: { $in: profile.clusterIds } }],
  })
    .populate('produceId')
    .populate('buyerId')
    .sort({ createdAt: -1 });
};

const assertCanRespond = async (userId, inquiry) => {
  const profile = await FarmerProfile.findOne({ userId });
  if (!profile) throw ApiError.notFound('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found');

  const isOwner = inquiry.farmerId?.equals(profile._id);
  const isClusterMember = inquiry.clusterId && profile.clusterIds.some((id) => id.equals(inquiry.clusterId));
  if (!isOwner && !isClusterMember) {
    throw ApiError.forbidden('NOT_INQUIRY_OWNER', 'You do not have permission to respond to this inquiry');
  }
};

export const acceptInquiry = async (userId, inquiryId) => {
  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) throw ApiError.notFound('INQUIRY_NOT_FOUND', 'Inquiry not found');
  await assertCanRespond(userId, inquiry);

  inquiry.status = 'accepted';
  inquiry.respondedAt = new Date();
  await inquiry.save();
  return inquiry;
};

export const rejectInquiry = async (userId, inquiryId) => {
  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) throw ApiError.notFound('INQUIRY_NOT_FOUND', 'Inquiry not found');
  await assertCanRespond(userId, inquiry);

  inquiry.status = 'rejected';
  inquiry.respondedAt = new Date();
  await inquiry.save();
  return inquiry;
};

// The farmer's phone number is only ever revealed to a buyer once the
// farmer has explicitly accepted their inquiry — never before, regardless
// of who's asking.
export const getRevealedContact = async (userId, inquiryId) => {
  const buyerProfile = await BuyerProfile.findOne({ userId });
  const inquiry = await Inquiry.findById(inquiryId);
  if (!inquiry) throw ApiError.notFound('INQUIRY_NOT_FOUND', 'Inquiry not found');
  if (!buyerProfile || !inquiry.buyerId.equals(buyerProfile._id)) {
    throw ApiError.forbidden('NOT_INQUIRY_OWNER', 'You do not have permission to view this inquiry');
  }
  if (inquiry.status !== 'accepted') {
    throw ApiError.forbidden('INQUIRY_NOT_ACCEPTED', 'The farmer has not accepted this inquiry yet');
  }

  const farmerProfile = await FarmerProfile.findById(inquiry.farmerId);
  const user = await User.findById(farmerProfile.userId);
  return { name: user.name, phone: user.phone };
};
