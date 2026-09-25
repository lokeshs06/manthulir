// Classifies land size into the standard Indian agricultural categories
// (marginal < 2.5 acres / ~1 hectare, small 2.5-5 acres / ~1-2 hectares,
// medium beyond that) — used against a scheme's farmerCategories rule.
export const classifyFarmerCategory = (landSizeAcres) => {
  if (landSizeAcres == null) return null;
  if (landSizeAcres <= 2.5) return 'marginal';
  if (landSizeAcres <= 5) return 'small';
  return 'medium';
};

// Evaluates one scheme against one farmer's criteria. Every rule follows
// the same convention: an empty array (or null bound) means "no
// restriction on this axis", not "matches nobody" — a scheme with no
// applicableDistricts listed is open to every district, for example.
const evaluateRule = (label, passed, reason, reasonTa) => ({ label, passed, reason, reasonTa });

const evaluateScheme = (scheme, criteria) => {
  const rules = [];
  const e = scheme.eligibility || {};

  if (e.applicableDistricts?.length) {
    const passed = criteria.district ? e.applicableDistricts.includes(criteria.district) : false;
    rules.push(
      evaluateRule(
        'district',
        passed,
        passed ? `Available in ${criteria.district}` : `Not available in your district`,
        passed ? `${criteria.district}-இல் கிடைக்கிறது` : 'உங்கள் மாவட்டத்தில் கிடைக்கவில்லை',
      ),
    );
  }

  if (e.applicableCrops?.length) {
    const passed = criteria.crops?.some((c) => e.applicableCrops.includes(c)) ?? false;
    rules.push(
      evaluateRule(
        'crops',
        passed,
        passed ? 'Matches one of your crops' : 'Does not cover your crops',
        passed ? 'உங்கள் பயிர்களில் ஒன்றுடன் பொருந்துகிறது' : 'உங்கள் பயிர்களை உள்ளடக்கவில்லை',
      ),
    );
  }

  if (e.farmerCategories?.length) {
    const category = classifyFarmerCategory(criteria.landSizeAcres);
    const passed = category ? e.farmerCategories.includes(category) : false;
    rules.push(
      evaluateRule(
        'farmerCategory',
        passed,
        passed ? `You qualify as a ${category} farmer` : 'Your land size category does not qualify',
        passed ? `நீங்கள் ${category} விவசாயியாக தகுதி பெறுகிறீர்கள்` : 'உங்கள் நில அளவு பிரிவு தகுதி பெறவில்லை',
      ),
    );
  }

  if (e.minLandSizeAcres != null || e.maxLandSizeAcres != null) {
    const size = criteria.landSizeAcres;
    const passed =
      size != null &&
      (e.minLandSizeAcres == null || size >= e.minLandSizeAcres) &&
      (e.maxLandSizeAcres == null || size <= e.maxLandSizeAcres);
    rules.push(
      evaluateRule(
        'landSize',
        passed,
        passed ? 'Your land size fits the requirement' : 'Your land size does not fit the requirement',
        passed ? 'உங்கள் நில அளவு தேவைக்கு பொருந்துகிறது' : 'உங்கள் நில அளவு தேவைக்கு பொருந்தவில்லை',
      ),
    );
  }

  if (e.requiresCertification != null) {
    const passed = !!criteria.isCertified === e.requiresCertification;
    rules.push(
      evaluateRule(
        'certification',
        passed,
        passed
          ? 'Your certification status matches'
          : e.requiresCertification
            ? 'Requires organic certification'
            : 'Only for farmers not yet certified',
        passed
          ? 'உங்கள் சான்றளிப்பு நிலை பொருந்துகிறது'
          : e.requiresCertification
            ? 'இயற்கை சான்றிதழ் தேவை'
            : 'இன்னும் சான்றிதழ் பெறாத விவசாயிகளுக்கு மட்டும்',
      ),
    );
  }

  const unmetCriteria = rules.filter((r) => !r.passed);
  const matchedReasons = rules.filter((r) => r.passed);

  let status;
  if (unmetCriteria.length === 0) status = 'matched';
  else if (unmetCriteria.length === 1) status = 'near-match';
  else status = 'excluded';

  return { scheme, status, matchedReasons, unmetCriteria };
};

// criteria: { district, landSizeAcres, crops: string[], isCertified }
export const matchSchemes = (schemes, criteria) => {
  const evaluated = schemes.map((scheme) => evaluateScheme(scheme, criteria));
  return {
    matched: evaluated.filter((r) => r.status === 'matched'),
    nearMatches: evaluated.filter((r) => r.status === 'near-match'),
    excluded: evaluated.filter((r) => r.status === 'excluded'),
  };
};
