import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  PlusCircle,
  MessageSquare,
  Sparkles,
  Inbox,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  useProduceList,
  useCreateProduce,
  useUpdateProduce,
  useDeleteProduce,
} from '../../hooks/useProduce';
import { useReceivedInquiries } from '../../hooks/useInquiries';
import { ProduceCard } from '../../features/produce/ProduceCard';
import { ProduceFormModal } from '../../features/produce/ProduceFormModal';
import { InquiryCard } from '../../features/inquiries/InquiryCard';

export const FarmerProducePage = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState('produce'); // 'produce' | 'inquiries'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduce, setEditingProduce] = useState(null);

  const {
    data: produceData,
    isLoading: isLoadingProduce,
    refetch: refetchProduce,
  } = useProduceList();

  const {
    data: inquiriesData,
    isLoading: isLoadingInquiries,
    refetch: refetchInquiries,
  } = useReceivedInquiries();

  const createMutation = useCreateProduce();
  const updateMutation = useUpdateProduce();
  const deleteMutation = useDeleteProduce();

  const allProduce = produceData?.data || [];
  // Filter produce owned by current farmer
  const farmerProfileId = profile?._id || user?.profile?._id || user?._id;
  const myProduce = allProduce.filter(
    (p) =>
      !farmerProfileId ||
      p.farmerId === farmerProfileId ||
      p.farmerId?._id === farmerProfileId ||
      p.farmerId === user?._id ||
      p.farmerId?.userId === user?._id
  );

  const inquiries = inquiriesData?.data || [];
  const openInquiriesCount = inquiries.filter((i) => i.status === 'open').length;

  const handleCreateOrUpdate = async (formData) => {
    if (editingProduce) {
      await updateMutation.mutateAsync({ id: editingProduce._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setEditingProduce(null);
  };

  const handleDeactivate = async (id) => {
    if (window.confirm(isTa ? 'இந்த விளைபொருளை செயலிழக்கச் செய்யவா?' : 'Deactivate this produce listing?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-agri-900 via-agri-800 to-agri-950 p-6 sm:p-8 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-700/60 border border-agri-600/60 text-xs font-semibold text-agri-200">
            <ShoppingBag className="w-3.5 h-3.5 text-agri-300" />
            <span>{isTa ? 'நேரடி இயற்கை சந்தை' : 'Direct Organic Marketplace'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            {isTa ? 'என் விளைபொருட்கள் & விசாரணைகள்' : 'My Produce & Inquiries'}
          </h1>
          <p className="text-xs sm:text-sm text-agri-100/90 leading-relaxed">
            {isTa
              ? 'இரசாயனமற்ற உங்கள் இயற்கை விளைபொருட்களை நியாயமான விலையில் நேரடியாக வாங்குபவர்களிடம் விற்பனை செய்யுங்கள்.'
              : 'Directly connect with conscious buyers and sell your verified organic produce at fair market prices.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduce(null);
            setShowAddModal(true);
          }}
          className="self-start sm:self-center inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-agri-500 hover:bg-agri-400 text-stone-950 text-xs sm:text-sm font-bold shadow-md transition-all min-h-touch cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isTa ? 'விளைபொருள் சேர்க்க' : 'Add Produce'}</span>
        </button>
      </div>

      {/* Segmented Tabs Switcher */}
      <div className="flex rounded-2xl p-1 bg-stone-200/80 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('produce')}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'produce'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isTa ? 'என் விளைபொருட்கள்' : 'My Listings'} ({myProduce.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inquiries')}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'inquiries'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{isTa ? 'வந்த விசாரணைகள்' : 'Inquiries'}</span>
          {openInquiriesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {openInquiriesCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Produce Listings */}
      {activeTab === 'produce' && (
        <div className="space-y-4">
          {isLoadingProduce ? (
            <div className="py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-stone-200">
              <Loader2 className="w-8 h-8 text-agri-700 animate-spin mb-2" />
              <p className="text-xs text-stone-500">{t('app.loading')}</p>
            </div>
          ) : myProduce.length === 0 ? (
            <div className="py-16 px-4 bg-white rounded-3xl border border-stone-200 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-stone-900 mb-1">
                  {isTa ? 'விளைபொருட்கள் எதுவும் சேர்க்கப்படவில்லை' : 'No Produce Listed Yet'}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed mb-4">
                  {isTa
                    ? 'உங்கள் அறுவடைக்குத் தயாராக உள்ள இயற்கை விளைபொருட்களைச் சேர்த்து வாங்குபவர்களிடம் நேரடி விற்பனை தொடங்குங்கள்.'
                    : 'List your natural harvest to connect with verified organic buyers across Tamil Nadu.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduce(null);
                    setShowAddModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isTa ? 'முதல் விளைபொருளைச் சேர்க்க' : 'Add First Produce'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myProduce.map((p) => (
                <ProduceCard
                  key={p._id}
                  produce={p}
                  isOwner={true}
                  onEdit={(item) => {
                    setEditingProduce(item);
                    setShowAddModal(true);
                  }}
                  onDeactivate={handleDeactivate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Received Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {isLoadingInquiries ? (
            <div className="py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-stone-200">
              <Loader2 className="w-8 h-8 text-agri-700 animate-spin mb-2" />
              <p className="text-xs text-stone-500">{t('app.loading')}</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="py-16 px-4 bg-white rounded-3xl border border-stone-200 text-center space-y-3 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-stone-900">
                {isTa ? 'விசாரணைகள் எதுவும் இல்லை' : 'No Inquiries Received Yet'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {isTa
                  ? 'வாங்குபவர்கள் உங்கள் விளைபொருட்கள் குறித்து அனுப்பும் விசாரணைகள் இங்கே காட்டப்படும்.'
                  : 'Buyer inquiries on your listings will appear here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <InquiryCard key={inq._id} inquiry={inq} isFarmerView={true} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Produce Modal */}
      <ProduceFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduce(null);
        }}
        initialData={editingProduce}
        onSubmit={handleCreateOrUpdate}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
