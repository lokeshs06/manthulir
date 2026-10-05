import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as authService from '../services/auth.service.js';
import { FarmerProfile } from '../models/FarmerProfile.js';
import { BuyerProfile } from '../models/BuyerProfile.js';

export const registerHandler = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  sendSuccess(res, {
    statusCode: 201,
    data: { user: { id: user._id, name: user.name, phone: user.phone, role: user.role }, accessToken, refreshToken },
  });
});

export const loginHandler = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  sendSuccess(res, {
    data: { user: { id: user._id, name: user.name, phone: user.phone, role: user.role }, accessToken, refreshToken },
  });
});

export const refreshHandler = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.refresh(req.body.refreshToken);
  const userObj = user ? { id: user._id, name: user.name, phone: user.phone, role: user.role } : null;
  sendSuccess(res, {
    data: {
      accessToken,
      refreshToken,
      ...(userObj ? { ...userObj, user: userObj } : {}),
    },
  });
});

export const logoutHandler = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  sendSuccess(res, { data: null });
});

export const meHandler = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  let profile = null;
  if (user.role === 'farmer') {
    profile = await FarmerProfile.findOne({ userId: user._id });
  } else if (user.role === 'buyer') {
    profile = await BuyerProfile.findOne({ userId: user._id });
  }
  const userObj = { id: user._id, name: user.name, phone: user.phone, role: user.role };
  sendSuccess(res, {
    data: {
      ...userObj,
      user: userObj,
      profile,
    },
  });
});
