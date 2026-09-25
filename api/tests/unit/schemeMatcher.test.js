import { describe, it, expect } from '@jest/globals';
import { matchSchemes, classifyFarmerCategory } from '../../src/services/schemeMatcher.service.js';

const baseScheme = (overrides = {}) => ({
  _id: 'scheme-1',
  name: 'Test Scheme',
  eligibility: {},
  ...overrides,
});

describe('classifyFarmerCategory', () => {
  it('classifies marginal, small, and medium correctly', () => {
    expect(classifyFarmerCategory(1)).toBe('marginal');
    expect(classifyFarmerCategory(2.5)).toBe('marginal');
    expect(classifyFarmerCategory(4)).toBe('small');
    expect(classifyFarmerCategory(10)).toBe('medium');
    expect(classifyFarmerCategory(null)).toBeNull();
  });
});

describe('matchSchemes', () => {
  it('treats an empty eligibility array as "no restriction" — matches every farmer', () => {
    const scheme = baseScheme({ eligibility: { applicableDistricts: [], applicableCrops: [] } });
    const { matched } = matchSchemes([scheme], { district: 'Salem', crops: ['tomato'] });
    expect(matched).toHaveLength(1);
  });

  it('does not match a farmer whose district is not in a non-empty applicableDistricts list', () => {
    // Only one rule is configured on this scheme, so a farmer failing it
    // has exactly 1 failing rule -> near-match, not excluded (that needs
    // 2+ failing rules — see the dedicated near-match/excluded tests below).
    const scheme = baseScheme({ eligibility: { applicableDistricts: ['Salem'] } });
    const { matched, nearMatches } = matchSchemes([scheme], { district: 'Madurai' });
    expect(matched).toHaveLength(0);
    expect(nearMatches).toHaveLength(1);
  });

  it('classifies a scheme with exactly one failing rule as a near-match', () => {
    const scheme = baseScheme({
      eligibility: { applicableDistricts: ['Salem'], applicableCrops: ['tomato'] },
    });
    // District fails, crop passes -> exactly 1 failing rule.
    const { nearMatches } = matchSchemes([scheme], { district: 'Madurai', crops: ['tomato'] });
    expect(nearMatches).toHaveLength(1);
  });

  it('classifies a scheme with two or more failing rules as excluded, not near-match', () => {
    const scheme = baseScheme({
      eligibility: { applicableDistricts: ['Salem'], applicableCrops: ['tomato'] },
    });
    const { excluded } = matchSchemes([scheme], { district: 'Madurai', crops: ['cotton'] });
    expect(excluded).toHaveLength(1);
  });

  it('respects requiresCertification both ways', () => {
    const requiresCert = baseScheme({ _id: 'a', eligibility: { requiresCertification: true } });
    const requiresNotCert = baseScheme({ _id: 'b', eligibility: { requiresCertification: false } });

    const certifiedFarmer = matchSchemes([requiresCert, requiresNotCert], { isCertified: true });
    expect(certifiedFarmer.matched.map((m) => m.scheme._id)).toEqual(['a']);

    const uncertifiedFarmer = matchSchemes([requiresCert, requiresNotCert], { isCertified: false });
    expect(uncertifiedFarmer.matched.map((m) => m.scheme._id)).toEqual(['b']);
  });
});
