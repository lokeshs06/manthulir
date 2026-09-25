import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as pestDetectionService from '../services/pestDetection.service.js';
import * as pestRemedyService from '../services/pestRemedy.service.js';
import { resolveLang, localizeFields, localizeList } from '../utils/localization.js';

const REMEDY_FIELD_PAIRS = [
  ['pestName', 'pestNameTa'],
  ['symptoms', 'symptomsTa'],
];

const localizeDetection = (detection, lang) => {
  const obj = detection.toObject ? detection.toObject() : { ...detection };
  return obj;
};

export const detectPestHandler = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const result = await pestDetectionService.detectPest(req.user.id, req.file, req.body);
  sendSuccess(res, {
    statusCode: 201,
    data: {
      detection: localizeDetection(result.detection, lang),
      remedies: localizeList(result.remedies, REMEDY_FIELD_PAIRS, lang),
      message: lang === 'ta' ? result.messageTa || result.message : result.message,
    },
  });
});

export const listMyDetectionsHandler = asyncHandler(async (req, res) => {
  const lang = resolveLang(req);
  const skip = Number(req.query.skip) || 0;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const { items, total } = await pestDetectionService.listMyDetections(req.user.id, { skip, limit });
  sendSuccess(res, {
    data: items.map((d) => localizeDetection(d, lang)),
    meta: { total, skip, limit },
  });
});

export const submitFeedbackHandler = asyncHandler(async (req, res) => {
  const detection = await pestDetectionService.submitFeedback(req.user.id, req.params.id, req.body);
  sendSuccess(res, { data: detection });
});

// ---- Pest remedy management (admin) ----

export const listRemediesHandler = asyncHandler(async (req, res) => {
  const remedies = await pestRemedyService.listPestRemedies();
  sendSuccess(res, { data: localizeList(remedies, REMEDY_FIELD_PAIRS, resolveLang(req)) });
});

export const getRemedyHandler = asyncHandler(async (req, res) => {
  const remedy = await pestRemedyService.getPestRemedyById(req.params.id);
  sendSuccess(res, { data: localizeFields(remedy, REMEDY_FIELD_PAIRS, resolveLang(req)) });
});

export const createRemedyHandler = asyncHandler(async (req, res) => {
  const remedy = await pestRemedyService.createPestRemedy(req.body);
  sendSuccess(res, { statusCode: 201, data: remedy });
});

export const updateRemedyHandler = asyncHandler(async (req, res) => {
  const remedy = await pestRemedyService.updatePestRemedy(req.params.id, req.body);
  sendSuccess(res, { data: remedy });
});

export const deleteRemedyHandler = asyncHandler(async (req, res) => {
  await pestRemedyService.deletePestRemedy(req.params.id);
  sendSuccess(res, { data: null });
});
