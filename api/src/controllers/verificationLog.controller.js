import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as verificationLogService from '../services/verificationLog.service.js';

export const createLogHandler = asyncHandler(async (req, res) => {
  const log = await verificationLogService.createVerificationLog(req.user.id, req.body, req.file);
  sendSuccess(res, { statusCode: 201, data: log });
});

export const listMyLogsHandler = asyncHandler(async (req, res) => {
  const skip = Number(req.query.skip) || 0;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const { items, total } = await verificationLogService.listMyVerificationLogs(req.user.id, { skip, limit });
  sendSuccess(res, { data: items, meta: { total, skip, limit } });
});

export const peerVerifyHandler = asyncHandler(async (req, res) => {
  const log = await verificationLogService.peerVerifyLog(req.user.id, req.params.id);
  sendSuccess(res, { data: log });
});

export const flagLogHandler = asyncHandler(async (req, res) => {
  const log = await verificationLogService.flagLog(req.user.id, req.params.id, req.body);
  sendSuccess(res, { data: log });
});
