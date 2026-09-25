import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as adminService from '../services/admin.service.js';

export const getStatsHandler = asyncHandler(async (req, res) => {
  const stats = await adminService.getPlatformStats();
  sendSuccess(res, { data: stats });
});

export const listFlaggedLogsHandler = asyncHandler(async (req, res) => {
  const logs = await adminService.listFlaggedLogs();
  sendSuccess(res, { data: logs });
});

export const resolveFlaggedLogHandler = asyncHandler(async (req, res) => {
  const log = await adminService.resolveFlaggedLog(req.params.id, req.user.id);
  sendSuccess(res, { data: log });
});

export const listPendingCertificationsHandler = asyncHandler(async (req, res) => {
  const profiles = await adminService.listPendingCertifications();
  sendSuccess(res, { data: profiles });
});

export const reviewCertificationHandler = asyncHandler(async (req, res) => {
  const profile = await adminService.reviewCertification(req.params.farmerId, req.user.id, req.body);
  sendSuccess(res, { data: profile });
});

export const getUnverifiedSchemesReportHandler = asyncHandler(async (req, res) => {
  const schemes = await adminService.getUnverifiedSchemesReport();
  sendSuccess(res, { data: schemes });
});

export const getPestFeedbackReportHandler = asyncHandler(async (req, res) => {
  const detections = await adminService.getPestFeedbackReport();
  sendSuccess(res, { data: detections });
});
