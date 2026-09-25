import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as farmerService from '../services/farmer.service.js';
import { getMyTimeline } from '../services/timeline.service.js';
import { resolveLang, localizeList } from '../utils/localization.js';

export const getMyProfileHandler = asyncHandler(async (req, res) => {
  const profile = await farmerService.getMyFarmerProfile(req.user.id);
  sendSuccess(res, { data: profile });
});

export const updateMyProfileHandler = asyncHandler(async (req, res) => {
  const profile = await farmerService.updateMyFarmerProfile(req.user.id, req.body);
  sendSuccess(res, { data: profile });
});

export const getPublicProfileHandler = asyncHandler(async (req, res) => {
  const summary = await farmerService.getPublicFarmerSummary(req.params.id);
  sendSuccess(res, { data: summary });
});

export const saveSchemeHandler = asyncHandler(async (req, res) => {
  await farmerService.saveScheme(req.user.id, req.params.schemeId);
  sendSuccess(res, { data: null });
});

export const unsaveSchemeHandler = asyncHandler(async (req, res) => {
  await farmerService.unsaveScheme(req.user.id, req.params.schemeId);
  sendSuccess(res, { data: null });
});

export const markSchemeAppliedHandler = asyncHandler(async (req, res) => {
  await farmerService.markSchemeApplied(req.user.id, req.params.schemeId);
  sendSuccess(res, { data: null });
});

export const listSavedSchemesHandler = asyncHandler(async (req, res) => {
  const schemes = await farmerService.listMySavedSchemes(req.user.id);
  const lang = resolveLang(req);
  sendSuccess(res, { data: localizeList(schemes, [['name', 'nameTa'], ['description', 'descriptionTa']], lang) });
});

export const getMyTimelineHandler = asyncHandler(async (req, res) => {
  const milestones = await getMyTimeline(req.user.id);
  sendSuccess(res, { data: milestones });
});

export const submitCertificationHandler = asyncHandler(async (req, res) => {
  const profile = await farmerService.submitCertification(req.user.id, req.file);
  sendSuccess(res, { data: profile });
});

export const listAppliedSchemesHandler = asyncHandler(async (req, res) => {
  const schemes = await farmerService.listMyAppliedSchemes(req.user.id);
  const lang = resolveLang(req);
  sendSuccess(res, { data: localizeList(schemes, [['name', 'nameTa'], ['description', 'descriptionTa']], lang) });
});
