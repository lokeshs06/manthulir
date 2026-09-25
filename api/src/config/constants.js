import { env } from './env.js';

export const ML_CONFIDENCE_THRESHOLD = env.mlService.confidenceThreshold;

export const USER_ROLES = ['farmer', 'buyer', 'admin'];

export const TRANSITION_STATUSES = ['not_started', 'transitioning', 'certified'];

export const BADGE_LEVELS = ['none', 'bronze', 'silver', 'gold'];

// Trust badge thresholds — see badge.service.js for the full computation.
// Each tier requires meeting ALL of its own criteria (not cumulative with
// lower tiers beyond what's listed), computed from verification log count,
// the ratio of those verifications that were peer-verified by another
// farmer, and months since transition start. Gold additionally requires an
// approved organic certification on file.
export const BADGE_THRESHOLDS = {
  bronze: {
    minVerifications: 3,
  },
  silver: {
    minVerifications: 8,
    minTransitionMonths: 6,
    minPeerVerificationRatio: 0.5,
  },
  gold: {
    minVerifications: 15,
    minTransitionMonths: 12,
    minPeerVerificationRatio: 0.7,
    requiresCertification: true,
  },
};

// A verification log counts toward peer-verification ratio only if
// verified by another farmer within this window of its creation.
export const PEER_VERIFICATION_WINDOW_DAYS = 30;

export const CLUSTER_MAX_PER_FARMER = 3;
export const CLUSTER_ROLES = ['lead', 'member'];
export const CLUSTER_JOIN_STATUSES = ['pending', 'approved', 'rejected'];

export const PRODUCE_UNITS = ['kg', 'quintal', 'ton', 'dozen', 'piece', 'bundle'];

export const INQUIRY_STATUSES = ['pending', 'accepted', 'rejected'];

export const PEST_PROBLEM_TYPES = ['insect', 'disease', 'deficiency'];
export const PEST_DETECTION_RESULT_TYPES = ['confident', 'uncertain', 'service-unavailable'];
export const PEST_FEEDBACK_TYPES = ['correct', 'incorrect'];

export const ARTICLE_CATEGORIES = ['philosophy', 'practice'];

export const SCHEME_APPLICATION_STATUSES = ['saved', 'applied'];

export const SUPPORTED_LANGUAGES = ['ta', 'en'];
export const DEFAULT_LANGUAGE = 'ta';

export const TN_DISTRICTS = [
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Coimbatore',
  'Cuddalore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kallakurichi',
  'Kanchipuram',
  'Kanyakumari',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Namakkal',
  'Nilgiris',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Ranipet',
  'Salem',
  'Sivaganga',
  'Tenkasi',
  'Thanjavur',
  'Theni',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tirupathur',
  'Tiruppur',
  'Tiruvallur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Vellore',
  'Viluppuram',
  'Virudhunagar',
];
