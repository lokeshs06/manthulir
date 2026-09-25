import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as schemeService from '../services/scheme.service.js';
import { resolveLang } from '../utils/localization.js';
import { localizeScheme, localizeSchemeList } from '../utils/schemeLocalization.js';

export const listSchemesHandler = asyncHandler(async (req, res) => {
  const schemes = await schemeService.listSchemes();
  sendSuccess(res, { data: localizeSchemeList(schemes, resolveLang(req)) });
});

export const getSchemeHandler = asyncHandler(async (req, res) => {
  const scheme = await schemeService.getSchemeById(req.params.id);
  sendSuccess(res, { data: localizeScheme(scheme, resolveLang(req)) });
});

export const createSchemeHandler = asyncHandler(async (req, res) => {
  const scheme = await schemeService.createScheme(req.body);
  sendSuccess(res, { statusCode: 201, data: scheme });
});

export const updateSchemeHandler = asyncHandler(async (req, res) => {
  const scheme = await schemeService.updateScheme(req.params.id, req.body);
  sendSuccess(res, { data: scheme });
});

export const deleteSchemeHandler = asyncHandler(async (req, res) => {
  await schemeService.softDeleteScheme(req.params.id);
  sendSuccess(res, { data: null });
});

export const verifySchemeHandler = asyncHandler(async (req, res) => {
  const scheme = await schemeService.verifyScheme(req.params.id, req.user.id);
  sendSuccess(res, { data: scheme });
});

export const matchSchemesHandler = asyncHandler(async (req, res) => {
  const result = await schemeService.matchSchemesForRequest(req.user?.id, req.query);
  const lang = resolveLang(req);
  sendSuccess(res, {
    data: {
      matched: result.matched.map((m) => ({ ...m, scheme: localizeScheme(m.scheme, lang) })),
      nearMatches: result.nearMatches.map((m) => ({ ...m, scheme: localizeScheme(m.scheme, lang) })),
      excluded: result.excluded.map((m) => ({ ...m, scheme: localizeScheme(m.scheme, lang) })),
    },
  });
});
