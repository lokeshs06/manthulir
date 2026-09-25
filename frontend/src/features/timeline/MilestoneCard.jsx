import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Calendar, Bookmark, BookmarkCheck, ArrowRight, FileCheck } from 'lucide-react';
import { useSaveScheme, useUnsaveScheme, useApplyScheme } from '../../hooks/useFarmer';

export const MilestoneCard = ({ milestone, onSelectScheme }) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const saveMutation = useSaveScheme();
  const unsaveMutation = useUnsaveScheme();
  const applyMutation = useApplyScheme();

  const isCompleted = milestone.status === 'completed';
  const isActive = milestone.status === 'active';
  const isUpcoming = milestone.status === 'upcoming';

  const monthLabel = isTa
    ? `மாதம் ${milestone.monthMark}`
    : `Month ${milestone.monthMark}`;

  // Guidance texts tailored to Nammalvar natural farming transition milestones
  const milestoneGuidance = {
    0: {
      ta: 'ஆரம்ப நிலை: இரசாயன உரங்கள் மற்றும் பூச்சிக்கொல்லிகளை முழுமையாக நிறுத்துதல். பண்ணை எல்லைகளில் மரக்கன்றுகள் நடுதல் மற்றும் மண் பரிசோதனை.',
      en: 'Initial stage: Complete cessation of chemical inputs. Planting live fences and initial soil testing.',
    },
    6: {
      ta: 'மண் மீட்பு நிலை: ஜீவாமிர்தம் மற்றும் பஞ்சகவ்யா தயாரிப்பு மற்றும் தொடர் பயன்பாடு. மண்புழுக்கள் எண்ணிக்கையை அதிகரித்தல்.',
      en: 'Soil recovery: Regular application of Jeevamrutham and Panchagavya. Boosting earthworm population and microbial life.',
    },
    12: {
      ta: 'உயிரியல் உறுதிப்பாடு: பலபயிர் சாகுபடி முறை, பயறுவகை ஊடுபயிர்கள் மூலம் மண்ணில் தழைச்சத்து நிலைநிறுத்துதல்.',
      en: 'Biological stabilization: Multi-cropping systems and leguminous intercrops for biological nitrogen fixation.',
    },
    24: {
      ta: 'முதிர்ச்சி நிலை: பூச்சி சமநிலை உருவாக்கம். தாவர பூச்சி விரட்டிகள் மட்டுமே பயன்பாடு. இயற்கை சான்றிதழுக்கு விண்ணப்பித்தல்.',
      en: 'Maturity stage: Natural predator-pest equilibrium. Ready for official third-party organic certification.',
    },
    36: {
      ta: 'முழுமையான இயற்கை வேளாண்மை: மண் வளம் மற்றும் மகசூல் முழு உறுதிப்பாடு. முழு இயற்கை சான்றிதழ் பெறுதல்.',
      en: 'Full organic conversion: Complete soil vitality restored. Harvest certified 100% natural and organic.',
    },
  };

  const guidance = milestoneGuidance[milestone.monthMark]
    ? isTa
      ? milestoneGuidance[milestone.monthMark].ta
      : milestoneGuidance[milestone.monthMark].en
    : milestone.guidanceKey;

  return (
    <div className="relative pl-8 sm:pl-10 pb-8 last:pb-2">
      {/* Timeline vertical bar */}
      <div className="absolute left-[15px] sm:left-[19px] top-6 bottom-0 w-0.5 bg-stone-200" />

      {/* Timeline status node icon */}
      <div
        className={`absolute left-0 top-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-4 border-white shadow-xs z-10 transition-colors ${
          isCompleted
            ? 'bg-emerald-600 text-white'
            : isActive
            ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
            : 'bg-stone-200 text-stone-500'
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : isActive ? (
          <Clock className="w-5 h-5" />
        ) : (
          <span className="text-xs font-bold">{milestone.monthMark}</span>
        )}
      </div>

      {/* Milestone Box */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-all ${
          isActive
            ? 'bg-white border-agri-500 shadow-md ring-1 ring-agri-500'
            : isCompleted
            ? 'bg-white border-emerald-200 shadow-xs'
            : 'bg-stone-50/70 border-stone-200 text-stone-600'
        }`}
      >
        {/* Milestone Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg sm:text-xl text-stone-900">
              {monthLabel}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800'
                  : isActive
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {isCompleted
                ? isTa
                  ? 'நிறைவடைந்தது'
                  : 'Completed'
                : isActive
                ? isTa
                  ? 'தற்போதைய நிலை'
                  : 'Active Stage'
                : isTa
                ? 'எதிர்வரும் நிலை'
                : 'Upcoming'}
            </span>
          </div>

          {milestone.dueDate && (
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>
                {isTa ? 'இலக்கு தேதி:' : 'Target Date:'}{' '}
                {new Date(milestone.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Guidance Text */}
        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50/80 p-3.5 rounded-xl border border-stone-100 mb-4">
          {guidance}
        </p>

        {/* Linked Schemes for this Milestone */}
        {milestone.linkedSchemes && milestone.linkedSchemes.length > 0 && (
          <div>
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-2">
              {isTa ? 'இந்த நிலைக்குரிய அரசுத் திட்டங்கள்:' : 'Relevant Schemes for this stage:'}
            </span>
            <div className="space-y-2">
              {milestone.linkedSchemes.map((item, idx) => {
                const scheme = item.scheme;
                if (!scheme) return null;
                const schemeName = (isTa && scheme.nameTa) ? scheme.nameTa : scheme.name;

                return (
                  <div
                    key={scheme._id || idx}
                    className="p-3 rounded-xl border border-stone-200 bg-white hover:border-agri-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            scheme.level === 'state'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {scheme.level}
                        </span>
                        {item.isApplied && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{isTa ? 'விண்ணப்பிக்கப்பட்டது' : 'Applied'}</span>
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                        {schemeName}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (item.isSaved) {
                            unsaveMutation.mutate(scheme._id);
                          } else {
                            saveMutation.mutate(scheme._id);
                          }
                        }}
                        className="p-1.5 rounded-lg border text-stone-600 hover:bg-stone-100 transition-colors min-h-touch min-w-touch flex items-center justify-center"
                        title={item.isSaved ? 'Saved' : 'Save'}
                      >
                        {item.isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-100" />
                        ) : (
                          <Bookmark className="w-4 h-4 text-stone-500" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectScheme && onSelectScheme(scheme, item.isSaved, item.isApplied, item.applicationStatus)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-agri-50 hover:bg-agri-100 text-agri-800 text-xs font-bold border border-agri-200 transition-colors min-h-touch"
                      >
                        <span>{isTa ? 'விவரங்கள்' : 'Details'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
