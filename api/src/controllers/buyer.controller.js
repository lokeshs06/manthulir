import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as buyerService from '../services/buyer.service.js';

export const getMyProfileHandler = asyncHandler(async (req, res) => {
  const profile = await buyerService.getMyBuyerProfile(req.user.id);
  sendSuccess(res, { data: profile });
});

export const updateMyProfileHandler = asyncHandler(async (req, res) => {
  const profile = await buyerService.updateMyBuyerProfile(req.user.id, req.body);
  sendSuccess(res, { data: profile });
});
