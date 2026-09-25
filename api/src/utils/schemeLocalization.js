import { localizeFields } from './localization.js';

const SCHEME_FIELD_PAIRS = [
  ['name', 'nameTa'],
  ['description', 'descriptionTa'],
  ['benefitsSummary', 'benefitsSummaryTa'],
  ['applicationProcess', 'applicationProcessTa'],
];

export const localizeScheme = (scheme, lang) => localizeFields(scheme, SCHEME_FIELD_PAIRS, lang);

export const localizeSchemeList = (schemes, lang) => schemes.map((scheme) => localizeScheme(scheme, lang));
