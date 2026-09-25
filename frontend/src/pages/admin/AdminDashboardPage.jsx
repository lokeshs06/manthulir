import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  BarChart3,
  Flag,
  Award,
  FileText,
  Bug,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AdminStatsSection } from '../../features/admin/AdminStatsSection';
import { AdminFlaggedLogsSection } from '../../features/admin/AdminFlaggedLogsSection';
import { AdminCertificationsSection } from '../../features/admin/AdminCertificationsSection';
import { AdminSchemesSection } from '../../features/admin/AdminSchemesSection';
import { AdminPestFeedbackSection } from '../../features/admin/AdminPestFeedbackSection';
import { AdminArticlesSection } from '../../features/admin/AdminArticlesSection';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const location = useLocation();
  const navigate = useNavigate();

  // Deduce active tab from URL path
  const getTabFromPath = (path) => {
    if (path.includes('/admin/flagged-logs')) return 'flagged-logs';
    if (path.includes('/admin/certifications')) return 'certifications';
    if (path.includes('/admin/schemes')) return 'schemes';
    if (path.includes('/admin/pest-feedback')) return 'pest-feedback';
    if (path.includes('/admin/articles')) return 'articles';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      navigate('/admin');
    } else {
      navigate(`/admin/${tabId}`);
    }
  };

  const tabs = [
    { id: 'overview', ta: 'கண்காணிப்பு மையம்', en: 'Platform Overview', icon: BarChart3 },
    { id: 'flagged-logs', ta: 'கொடியிடப்பட்ட பதிவுகள்', en: 'Flagged Logs', icon: Flag },
    { id: 'certifications', ta: 'சான்றிதழ் சரிபார்ப்பு', en: 'Certifications', icon: Award },
    { id: 'schemes', ta: 'அரசுத் திட்டங்கள்', en: 'Schemes Audit', icon: FileText },
    { id: 'pest-feedback', ta: 'பூச்சி பின்னூட்டம்', en: 'Pest Model Feedback', icon: Bug },
    { id: 'articles', ta: 'அறிவு மையம்', en: 'Articles CMS', icon: BookOpen },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-agri-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-agri-500/20 text-agri-300 text-[11px] font-bold border border-agri-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isTa ? 'நிர்வாகக் குழு கட்டுப்பாட்டகம்' : 'Platform Administration Console'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isTa ? `வணக்கம், ${user?.name || 'நிர்வாகி'}!` : `Welcome, ${user?.name || 'Admin'}!`}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            {isTa
              ? 'தமிழக இயற்கை விவசாய மாற்றத் தளம், நம்பகத்தன்மை சான்றுகள் மற்றும் களத் தணிக்கைகளை நிர்வகிக்கவும்.'
              : 'Monitor statewide organic transition metrics, audit trust verifications, and manage regulatory schemes.'}
          </p>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-touch ${
                  isActive
                    ? 'bg-agri-700 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isTa ? tab.ta : tab.en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Section Component */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-7 shadow-xs">
        {activeTab === 'overview' && <AdminStatsSection />}
        {activeTab === 'flagged-logs' && <AdminFlaggedLogsSection />}
        {activeTab === 'certifications' && <AdminCertificationsSection />}
        {activeTab === 'schemes' && <AdminSchemesSection />}
        {activeTab === 'pest-feedback' && <AdminPestFeedbackSection />}
        {activeTab === 'articles' && <AdminArticlesSection />}
      </div>
    </div>
  );
};
