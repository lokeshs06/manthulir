import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as produceService from '../services/produce.service.js';
import { resolveLang, localizeFields, localizeList } from '../utils/localization.js';

const CROP_FIELD_PAIRS = [['cropName', 'cropNameTa']];

export const createProduceHandler = asyncHandler(async (req, res) => {
  const produce = await produceService.createProduce(req.user.id, req.body);
  sendSuccess(res, { statusCode: 201, data: produce });
});

export const updateProduceHandler = asyncHandler(async (req, res) => {
  const produce = await produceService.updateProduce(req.user.id, req.params.id, req.body);
  sendSuccess(res, { data: produce });
});

export const deactivateProduceHandler = asyncHandler(async (req, res) => {
  await produceService.deactivateProduce(req.user.id, req.params.id);
  sendSuccess(res, { data: null });
});

export const listActiveProduceHandler = asyncHandler(async (req, res) => {
  const skip = Number(req.query.skip) || 0;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const { items, total } = await produceService.listActiveProduce({ ...req.query, skip, limit });
  const lang = resolveLang(req);
  sendSuccess(res, { data: localizeList(items, CROP_FIELD_PAIRS, lang), meta: { total, skip, limit } });
});

export const listMyProduceHandler = asyncHandler(async (req, res) => {
  const items = await produceService.listMyProduce(req.user.id);
  const lang = resolveLang(req);
  sendSuccess(res, { data: localizeList(items, CROP_FIELD_PAIRS, lang) });
});
