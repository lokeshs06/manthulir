import { describe, it, expect } from 'vitest';
import i18n from '../src/i18n';
import ta from '../src/i18n/loc/ta.json';
import en from '../src/i18n/loc/en.json';

describe('i18n localization', () => {
  it('defaults to Tamil', () => {
    expect(i18n.language).toBe('ta');
  });

  it('translates app name and auth strings in Tamil', () => {
    expect(i18n.t('app.name')).toBe('மண் துளிர்');
    expect(i18n.t('auth.loginTitle')).toBe('கணக்கில் உள்நுழைக');
    expect(i18n.t('roles.farmer')).toBe('விவசாயி');
  });

  it('switches to English smoothly', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('app.name')).toBe('Manthulir');
    expect(i18n.t('auth.loginTitle')).toBe('Login to your account');
    expect(i18n.t('roles.farmer')).toBe('Farmer');

    // Switch back to Tamil default
    await i18n.changeLanguage('ta');
  });

  it('has identical keys in both Tamil and English dictionaries', () => {
    const getKeys = (obj, prefix = '') => {
      return Object.keys(obj).flatMap((key) => {
        const full = prefix ? `${prefix}.${key}` : key;
        return typeof obj[key] === 'object' && obj[key] !== null
          ? getKeys(obj[key], full)
          : [full];
      });
    };

    const taKeys = getKeys(ta).sort();
    const enKeys = getKeys(en).sort();
    expect(taKeys).toEqual(enKeys);
  });
});
