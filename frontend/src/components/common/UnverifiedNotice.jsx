import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const UnverifiedNotice = ({ verified = false, lastVerifiedAt, className = '' }) => {
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  if (verified) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 ${className}`}
        title={lastVerifiedAt ? `Verified on ${new Date(lastVerifiedAt).toLocaleDateString()}` : 'Verified'}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>{isTa ? 'சரிபார்க்கப்பட்டது' : 'Officially Verified'}</span>
      </span>
    );
  }

  return (
    <div
      role="note"
      className={`flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs ${className}`}
    >
      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-amber-950">
          {isTa
            ? 'அரசு தளம் மூலம் இன்னும் சரிபார்க்கப்படவில்லை'
            : 'Not yet verified — confirm on the official site'}
        </p>
        <p className="text-amber-800/90 mt-0.5 leading-relaxed">
          {isTa
            ? 'மானிய தொகைகள் தற்காலிகமானவை. அதிகாரப்பூர்வ அரசு அறிவிப்பைப் பார்க்கவும்.'
            : 'Benefit amounts are estimated placeholders. Confirm latest amounts directly on the official portal.'}
        </p>
        {lastVerifiedAt && (
          <p className="text-[10px] text-amber-700/80 mt-1">
            {isTa ? 'கடைசி சரிபார்ப்பு:' : 'Last checked:'}{' '}
            {new Date(lastVerifiedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};
