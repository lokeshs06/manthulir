import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as authService from '../services/auth.service.js';

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
  const { accessToken, refreshToken } = await authService.refresh(req.body.refreshToken);
  sendSuccess(res, { data: { accessToken, refreshToken } });
});

export const logoutHandler = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  sendSuccess(res, { data: null });
});

export const meHandler = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  sendSuccess(res, { data: { id: user._id, name: user.name, phone: user.phone, role: user.role } });
});
