import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bug, CheckCircle, AlertTriangle, Calendar, User, Eye } from 'lucide-react';
import { usePestFeedbackList } from '../../hooks/useAdmin';

export const AdminPestFeedbackSection = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const { data, isLoading, isError, refetch } = usePestFeedbackList();
  const feedbackList = data?.data || [];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Bug className="w-5 h-5 text-amber-600" />
            <span>{isTa ? 'பூச்சி கண்டறிதல் மாதிரி பின்னூட்டம்' : 'Pest Model Feedback & Corrections'}</span>
          </h2>
          <p className="text-xs text-stone-500">
            {isTa
              ? 'விவசாயிகளால் தவறான முடிவுகளாகக் குறிக்கப்பட்ட படங்கள் (ML மாதிரி மேம்பாட்டிற்காக)'
              : 'Detections flagged incorrect by farmers for PyTorch model retraining and tuning'}
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 rounded-full">
          {feedbackList.length} {isTa ? 'பதிவுகள்' : 'Items'}
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-stone-500 text-sm">{t('app.loading')}</div>
      ) : isError ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{t('app.error')}</span>
          <button type="button" onClick={() => refetch()} className="font-bold underline">
            {t('app.retry')}
          </button>
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">
            {isTa ? 'தவறான முடிவுகள் எதுவும் இல்லை' : 'No inaccurate detections reported'}
          </h3>
          <p className="text-xs text-stone-500">
            {isTa
              ? 'விவசாயிகள் சமர்ப்பித்த அனைத்து பூச்சி கண்டறிதல்களும் திருப்திகரமாக உள்ளன.'
              : 'Farmers have not flagged any recent predictions as incorrect.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbackList.map((item) => {
            const pred = item.prediction || {};
            const farmerName = item.farmerId?.name || (isTa ? 'விவசாயி' : 'Farmer');
            const conf = pred.confidence ? (pred.confidence * 100).toFixed(1) : 'N/A';

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        {isTa ? 'தவறான கணிப்பு' : 'Reported Incorrect'}
                      </span>
                      <h4 className="text-sm font-bold text-stone-900 mt-1">
                        {pred.primaryLabel || 'Unknown Pest'}
                      </h4>
                      <div className="text-xs text-stone-500">
                        {isTa ? 'கணிப்பு துல்லியம்' : 'Confidence'}: <strong>{conf}%</strong>
                      </div>
                    </div>

                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt="Pest Photo"
                        className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shrink-0"
                      />
                    )}
                  </div>

                  {/* Feedback notes */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs space-y-1">
                    <span className="font-bold text-stone-700 block">
                      {isTa ? 'விவசாயியின் திருத்தம் / குறிப்பு:' : "Farmer's Feedback Note:"}
                    </span>
                    <p className="italic text-stone-600">
                      "{item.feedbackNote || (isTa ? 'விளக்கம் இல்லை' : 'No note provided')}"
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>{farmerName}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
