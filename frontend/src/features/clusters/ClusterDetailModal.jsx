import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Users,
  MapPin,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  PlusCircle,
  FileText,
  AlertTriangle,
  LogOut,
  Loader2,
} from 'lucide-react';
import {
  useDecideJoinRequest,
  useLeaveCluster,
  useClusterSchemeEligibility,
} from '../../hooks/useClusters';
import { getApiErrorMessage } from '../../lib/errorHandler';

export const ClusterDetailModal = ({
  isOpen,
  onClose,
  cluster,
  currentFarmerId,
  onAddPooledProduce,
}) => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'requests' | 'schemes'
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [transferLeadTo, setTransferLeadTo] = useState('');
  const [actionError, setActionError] = useState(null);

  const decideMutation = useDecideJoinRequest();
  const leaveMutation = useLeaveCluster();
  const { data: eligibilityData, isLoading: isLoadingSchemes } = useClusterSchemeEligibility(
    cluster?._id
  );

  if (!isOpen || !cluster) return null;

  const isLead = cluster.members?.some(
    (m) => (m.farmerId?._id || m.farmerId) === currentFarmerId && m.role === 'lead'
  );
  const isMember = cluster.members?.some(
    (m) => (m.farmerId?._id || m.farmerId) === currentFarmerId
  );

  const pendingRequests = cluster.joinRequests?.filter((r) => r.status === 'pending') || [];
  const otherMembers = cluster.members?.filter(
    (m) => (m.farmerId?._id || m.farmerId) !== currentFarmerId
  ) || [];

  const handleDecision = async (applicantFarmerId, status) => {
    setActionError(null);
    try {
      await decideMutation.mutateAsync({
        clusterId: cluster._id,
        farmerId: applicantFarmerId,
        status,
      });
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleLeaveCluster = async () => {
    setActionError(null);
    if (isLead && otherMembers.length > 0 && !transferLeadTo) {
      setActionError(
        isTa
          ? 'தலைமைப் பொறுப்பை ஏற்க புதிய உறுப்பினரைத் தேர்ந்தெடுக்கவும்.'
          : 'Please select a successor member to transfer cluster leadership.'
      );
      return;
    }

    try {
      await leaveMutation.mutateAsync({
        clusterId: cluster._id,
        transferLeadTo: transferLeadTo || undefined,
      });
      setShowLeaveDialog(false);
      onClose();
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const eligibleSchemes = eligibilityData?.data?.eligible || [];
  const nearMatches = eligibilityData?.data?.nearMatches || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-stone-200 my-8">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-stone-50 border-b border-stone-200 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-agri-700 bg-agri-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{cluster.district}</span>
              </span>
              {isLead && (
                <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  👑 {isTa ? 'நீங்கள் இக்குழுவின் தலைவர்' : 'You are Cluster Lead'}
                </span>
              )}
            </div>
            <h3 className="font-bold text-stone-900 text-lg sm:text-xl">
              {cluster.name}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              {cluster.description || (isTa ? 'விளக்கம் இல்லை' : 'No description')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Error Message */}
        {actionError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {actionError}
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex border-b border-stone-200 px-6 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'members'
                ? 'border-agri-700 text-agri-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {isTa ? 'உறுப்பினர்கள்' : 'Members'} ({cluster.members?.length || 0})
          </button>

          {isLead && (
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'border-agri-700 text-agri-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>{isTa ? 'சேர்க்கை கோரிக்கைகள்' : 'Join Requests'}</span>
              {pendingRequests.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('schemes')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'schemes'
                ? 'border-agri-700 text-agri-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {isTa ? 'குழுத் திட்ட தகுதி' : 'Cluster Schemes'}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-6 max-h-[50vh] overflow-y-auto space-y-4">
          {/* Members List Tab */}
          {activeTab === 'members' && (
            <div className="space-y-2">
              {cluster.members?.map((m, idx) => {
                const farmerName = m.farmerId?.name || (isTa ? 'விவசாயி' : 'Farmer');
                const isMemberLead = m.role === 'lead';

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-agri-100 flex items-center justify-center font-bold text-agri-800">
                        {farmerName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 block">{farmerName}</span>
                        <span className="text-[11px] text-stone-500">
                          {isTa ? 'இணைந்த நாள்' : 'Joined'}: {new Date(m.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      {isMemberLead ? (
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                          👑 {isTa ? 'குழு தலைவர்' : 'Lead'}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-stone-600 bg-stone-200/60 px-2 py-0.5 rounded-full">
                          {isTa ? 'உறுப்பினர்' : 'Member'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Join Requests Tab (Lead Only) */}
          {activeTab === 'requests' && isLead && (
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6">
                  {isTa ? 'புதிய கோரிக்கைகள் எதுவும் இல்லை.' : 'No pending join requests.'}
                </p>
              ) : (
                pendingRequests.map((req, rIdx) => {
                  const applicantId = req.farmerId?._id || req.farmerId;
                  const applicantName = req.farmerId?.name || (isTa ? 'விண்ணப்பதாரர்' : 'Applicant');

                  return (
                    <div
                      key={rIdx}
                      className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-stone-900 block">{applicantName}</span>
                        <span className="text-[11px] text-stone-500">
                          {new Date(req.requestedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDecision(applicantId, 'rejected')}
                          disabled={decideMutation.isPending}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                        >
                          {isTa ? 'நிராகரி' : 'Reject'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(applicantId, 'approved')}
                          disabled={decideMutation.isPending}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                        >
                          {isTa ? 'அங்கீகரி' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Cluster Schemes Tab */}
          {activeTab === 'schemes' && (
            <div className="space-y-3">
              {isLoadingSchemes ? (
                <div className="py-6 flex justify-center">
                  <Loader2 className="w-6 h-6 text-agri-700 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="p-3 bg-agri-50 rounded-xl border border-agri-200 text-xs text-agri-950">
                    <p>
                      <strong>{isTa ? 'குழு புள்ளிவிவரங்கள்:' : 'Cluster Statistics:'}</strong>{' '}
                      {cluster.members?.length || 0} {isTa ? 'உறுப்பினர்கள்' : 'members'},{' '}
                      {cluster.totalLandAcres || 0} {isTa ? 'ஏக்கர் நிலப்பரப்பு' : 'total acres'}.
                    </p>
                  </div>

                  <h4 className="text-xs font-bold text-stone-900 pt-1">
                    {isTa ? 'தகுதியுள்ள அரசுத் திட்டங்கள்' : 'Eligible Cluster Schemes'} ({eligibleSchemes.length})
                  </h4>

                  {eligibleSchemes.length === 0 ? (
                    <p className="text-xs text-stone-500 italic">
                      {isTa ? 'தகுதியுள்ள திட்டங்கள் எதுவும் இல்லை.' : 'No schemes match current cluster size.'}
                    </p>
                  ) : (
                    eligibleSchemes.map((s, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 text-xs space-y-1">
                        <span className="font-bold text-emerald-950 block">{s.name}</span>
                        <p className="text-stone-600">{s.benefitsSummary}</p>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 sm:p-6 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          {/* Pooled produce action for lead */}
          {isLead && cluster.combinedListings && onAddPooledProduce ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAddPooledProduce(cluster);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold shadow-xs min-h-touch cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isTa ? 'குழு கூட்டு விற்பனை சேர்க்க' : 'Add Pooled Produce'}</span>
            </button>
          ) : (
            <div />
          )}

          {/* Leave cluster trigger (for members) */}
          {isMember && (
            <button
              type="button"
              onClick={() => setShowLeaveDialog(true)}
              className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-red-600 p-2 cursor-pointer font-medium ml-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isTa ? 'குழுவிலிருந்து வெளியேறு' : 'Leave Cluster'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Leave Cluster Confirmation Dialog (Two-Step for Lead) */}
      {showLeaveDialog && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <h4 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{isTa ? 'குழுவிலிருந்து வெளியேற உறுதிப்படுத்தவும்' : 'Confirm Cluster Exit'}</span>
            </h4>

            {isLead && otherMembers.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-amber-950 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed">
                  <strong>{isTa ? 'தலைமைப் பொறுப்பு மாற்றம் தேவை:' : 'Leadership Transfer Required:'}</strong>{' '}
                  {isTa
                    ? 'நீங்கள் இக்குழுவின் தலைவராக உள்ளீர்கள். வெளியேறுவதற்கு முன் மற்றொரு உறுப்பினருக்கு தலைமைப் பொறுப்பை மாற்ற வேண்டும்.'
                    : 'You are the cluster lead. Please select a successor member to take over leadership before exiting.'}
                </p>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    {isTa ? 'புதிய தலைவரைத் தேர்ந்தெடுக்கவும்*' : 'Select New Cluster Lead*'}
                  </label>
                  <select
                    value={transferLeadTo}
                    onChange={(e) => setTransferLeadTo(e.target.value)}
                    required
                    className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white cursor-pointer"
                  >
                    <option value="">{isTa ? '-- உறுப்பினரைத் தேர்ந்தெடு --' : '-- Select Member --'}</option>
                    {otherMembers.map((m) => {
                      const id = m.farmerId?._id || m.farmerId;
                      const name = m.farmerId?.name || id;
                      return (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-600 leading-relaxed">
                {isTa
                  ? 'நிச்சயமாக இந்தக் குழுவிலிருந்து வெளியேற விரும்புகிறீர்களா?'
                  : 'Are you sure you want to leave this cluster?'}
              </p>
            )}

            {actionError && <p className="text-xs text-red-600">{actionError}</p>}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowLeaveDialog(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                {t('app.cancel')}
              </button>
              <button
                type="button"
                onClick={handleLeaveCluster}
                disabled={leaveMutation.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                {leaveMutation.isPending ? t('app.saving') : (isTa ? 'வெளியேறு' : 'Confirm Exit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
