// Bilingual response pattern used across the API: every localizable model
// stores its canonical (English) value in a base field and an optional
// Tamil translation in a `<field>Ta` field. Responses default to Tamil
// (the primary audience), with `?lang=en` or `?lang=all` as an override.
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../config/constants.js';

export const resolveLang = (req) => {
  const requested = req.query?.lang;
  if (requested === 'all') return 'all';
  if (SUPPORTED_LANGUAGES.includes(requested)) return requested;
  return DEFAULT_LANGUAGE;
};

// fieldPairs: [[baseField, taField], ...] — e.g. [['cropName', 'cropNameTa']]
export const localizeFields = (doc, fieldPairs, lang) => {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

  if (lang === 'all') return obj;

  for (const [baseField, taField] of fieldPairs) {
    if (lang === 'ta' && obj[taField]) {
      obj[baseField] = obj[taField];
    }
    delete obj[taField];
  }
  return obj;
};

export const localizeList = (docs, fieldPairs, lang) => docs.map((doc) => localizeFields(doc, fieldPairs, lang));
