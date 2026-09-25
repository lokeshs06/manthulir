import { FarmerProfile } from '../models/FarmerProfile.js';
import { Scheme } from '../models/Scheme.js';
import { ApiError } from '../utils/ApiError.js';

// Fixed template for the organic-transition journey — matches the
// realistic multi-year timeline for full NPOP organic certification.
const MILESTONE_TEMPLATE = [
  {
    month: 0,
    title: 'Begin organic transition',
    titleTa: 'இயற்கை மாற்றத்தை தொடங்குதல்',
    description: 'Stop chemical inputs and start recording your practices.',
    descriptionTa: 'இரசாயன பயன்பாட்டை நிறுத்தி, உங்கள் நடைமுறைகளை பதிவு செய்யத் தொடங்கவும்.',
  },
  {
    month: 6,
    title: 'Establish organic practices',
    titleTa: 'இயற்கை முறைகளை நிலைநிறுத்துதல்',
    description: 'Build soil health with compost, panchagavya, and natural pest control.',
    descriptionTa: 'உரம், பஞ்சகவ்யா மற்றும் இயற்கை பூச்சி கட்டுப்பாட்டால் மண் வளத்தை மேம்படுத்தவும்.',
  },
  {
    month: 12,
    title: 'Mid-transition review',
    titleTa: 'இடைநிலை மதிப்பாய்வு',
    description: 'A full year of verified organic practice — check eligible schemes.',
    descriptionTa: 'ஒரு முழு வருடம் சரிபார்க்கப்பட்ட இயற்கை பயிற்சி — தகுதியான திட்டங்களை பார்க்கவும்.',
  },
  {
    month: 24,
    title: 'Pre-certification readiness',
    titleTa: 'சான்றிதழுக்கு முந்தைய தயார்நிலை',
    description: 'Most certification bodies require this much verified history.',
    descriptionTa: 'பெரும்பாலான சான்றிதழ் நிறுவனங்களுக்கு இவ்வளவு சரிபார்க்கப்பட்ட வரலாறு தேவை.',
  },
  {
    month: 36,
    title: 'Certification eligibility',
    titleTa: 'சான்றிதழுக்கான தகுதி',
    description: 'You may now be eligible to apply for full organic certification.',
    descriptionTa: 'இப்போது நீங்கள் முழு இயற்கை சான்றிதழுக்கு விண்ணப்பிக்க தகுதி பெறலாம்.',
  },
];

const monthsSince = (date) => {
  if (!date) return null;
  const diffMs = Date.now() - new Date(date).getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
};

const computeStatus = (milestoneMonth, elapsedMonths, nextMilestoneMonth) => {
  if (elapsedMonths == null) return 'upcoming';
  if (elapsedMonths < milestoneMonth) return 'upcoming';
  if (nextMilestoneMonth != null && elapsedMonths >= nextMilestoneMonth) return 'completed';
  return elapsedMonths >= milestoneMonth ? 'current' : 'upcoming';
};

// A scheme links to a milestone only if it declares BOTH
// applicableFromMonth and applicableToMonth, and this milestone's month
// falls within that window — a scheme with no window declared is never
// linked to any milestone (an easy bug to introduce by defaulting it to
// milestone 0 instead, which is NOT the intended behavior).
const linkSchemesToMilestone = (schemes, milestoneMonth) =>
  schemes
    .filter(
      (s) =>
        s.applicableFromMonth != null &&
        s.applicableToMonth != null &&
        milestoneMonth >= s.applicableFromMonth &&
        milestoneMonth < s.applicableToMonth,
    )
    .map((s) => s._id);

export const generateTimeline = async (userId) => {
  const profile = await FarmerProfile.findOne({ userId });
  if (!profile) throw ApiError.notFound('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found');

  const schemes = await Scheme.find({ isDeleted: false, verified: true });
  const elapsedMonths = monthsSince(profile.transitionStartDate);

  profile.milestones = MILESTONE_TEMPLATE.map((template, index) => {
    const nextMonth = MILESTONE_TEMPLATE[index + 1]?.month ?? null;
    return {
      ...template,
      status: computeStatus(template.month, elapsedMonths, nextMonth),
      linkedSchemeIds: linkSchemesToMilestone(schemes, template.month),
    };
  });

  await profile.save();
  return profile.milestones;
};

export const getMyTimeline = async (userId) => {
  const profile = await FarmerProfile.findOne({ userId }).populate('milestones.linkedSchemeIds');
  if (!profile) throw ApiError.notFound('FARMER_PROFILE_NOT_FOUND', 'Farmer profile not found');
  if (!profile.milestones?.length) {
    return generateTimeline(userId);
  }
  return profile.milestones;
};

// Run daily (see jobs/milestoneUpdater.js) across every farmer who has
// started their transition — refreshes status progression and re-links
// schemes verified since the milestones were last generated.
export const refreshAllTimelines = async () => {
  const profiles = await FarmerProfile.find({ transitionStartDate: { $ne: null } });
  const schemes = await Scheme.find({ isDeleted: false, verified: true });

  for (const profile of profiles) {
    const elapsedMonths = monthsSince(profile.transitionStartDate);
    profile.milestones = MILESTONE_TEMPLATE.map((template, index) => {
      const nextMonth = MILESTONE_TEMPLATE[index + 1]?.month ?? null;
      return {
        ...template,
        status: computeStatus(template.month, elapsedMonths, nextMonth),
        linkedSchemeIds: linkSchemesToMilestone(schemes, template.month),
      };
    });
    await profile.save();
  }

  return profiles.length;
};
