import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  PlusCircle,
  Search,
  MapPin,
  Compass,
  Filter,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
  useClustersList,
  useCreateCluster,
  useJoinCluster,
  useCreatePooledListing,
} from '../../hooks/useClusters';
import { ClusterCard } from '../../features/clusters/ClusterCard';
import { ClusterDetailModal } from '../../features/clusters/ClusterDetailModal';
import { ProduceFormModal } from '../../features/produce/ProduceFormModal';
import { TN_DISTRICTS, TN_DISTRICTS_TA, TAMIL_NADU_CROPS } from '../../config/constants';
import { getApiErrorMessage } from '../../lib/errorHandler';

export const FarmerClustersPage = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const { user } = useAuth();

  const [searchDistrict, setSearchDistrict] = useState('');
  const [searchCrop, setSearchCrop] = useState('');
  const [nearGeo, setNearGeo] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const [activeTab, setActiveTab] = useState('all'); // 'my' | 'all'
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [showCreateClusterModal, setShowCreateClusterModal] = useState(false);
  const [pooledListingCluster, setPooledListingCluster] = useState(null);

  // Form state for creating a cluster
  const [createClusterData, setCreateClusterData] = useState({
    name: '',
    district: TN_DISTRICTS[0],
    cropFocus: [],
    description: '',
    combinedListings: true,
  });
  const [createError, setCreateError] = useState(null);

  const filters = {
    district: searchDistrict || undefined,
    crop: searchCrop || undefined,
    near: nearGeo ? `${nearGeo.lat},${nearGeo.lng}` : undefined,
    radiusKm: nearGeo ? 50 : undefined,
  };

  const { data, isLoading, refetch } = useClustersList(filters);
  const createClusterMutation = useCreateCluster();
  const joinClusterMutation = useJoinCluster();
  const createPooledMutation = useCreatePooledListing();

  const clusters = data?.data || [];
  const currentFarmerId = user?.profile?._id || user?._id;

  const myClusters = clusters.filter((c) =>
    c.members?.some((m) => (m.farmerId?._id || m.farmerId) === currentFarmerId)
  );

  const displayedClusters = activeTab === 'my' ? myClusters : clusters;

  const handleNearMeToggle = () => {
    if (nearGeo) {
      setNearGeo(null);
      return;
    }

    if (!navigator.geolocation) {
      alert(isTa ? 'உங்கள் உலாவியில் ஜிபிஎஸ் வசதி இல்லை.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        console.error('Geo error', err);
        setIsLocating(false);
        alert(isTa ? 'இருப்பிடத்தை கண்டறிய முடியவில்லை.' : 'Could not retrieve GPS location.');
      }
    );
  };

  const handleCreateClusterSubmit = async (e) => {
    e.preventDefault();
    setCreateError(null);

    if (!createClusterData.name.trim()) {
      setCreateError(isTa ? 'குழு பெயர் தேவை.' : 'Cluster name is required.');
      return;
    }

    try {
      await createClusterMutation.mutateAsync({
        name: createClusterData.name.trim(),
        district: createClusterData.district,
        cropFocus: createClusterData.cropFocus,
        description: createClusterData.description.trim() || undefined,
        combinedListings: createClusterData.combinedListings,
      });
      setShowCreateClusterModal(false);
      setCreateClusterData({
        name: '',
        district: TN_DISTRICTS[0],
        cropFocus: [],
        description: '',
        combinedListings: true,
      });
    } catch (err) {
      setCreateError(getApiErrorMessage(err));
    }
  };

  const handleJoinCluster = async (clusterId) => {
    try {
      await joinClusterMutation.mutateAsync(clusterId);
    } catch (err) {
      alert(getApiErrorMessage(err));
    }
  };

  const handleCreatePooledProduceSubmit = async (produceFormData) => {
    if (!pooledListingCluster?._id) return;
    await createPooledMutation.mutateAsync({
      clusterId: pooledListingCluster._id,
      data: produceFormData,
    });
    setPooledListingCluster(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-agri-900 via-agri-800 to-agri-950 p-6 sm:p-8 text-white shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-700/60 border border-agri-600/60 text-xs font-semibold text-agri-200">
            <Users className="w-3.5 h-3.5 text-agri-300" />
            <span>{isTa ? 'விவசாயக் கூட்டுறவு' : 'Farmer Clusters'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            {isTa ? 'விவசாயக் குழுக்கள் & கூட்டு சந்தை' : 'Farmer Clusters & Collective Power'}
          </h1>
          <p className="text-xs sm:text-sm text-agri-100/90 leading-relaxed">
            {isTa
              ? 'அருகிலுள்ள இயற்கை விவசாயிகளுடன் இணைந்து குழு அமைத்து, அரசு மானியங்களைப் பெறுங்கள் மற்றும் விளைபொருட்களை மொத்தமாக விற்று அதிக லாபம் அடையுங்கள்.'
              : 'Form local natural farming clusters to unlock collective government subsidies and pool harvests for higher market bargaining power.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateClusterModal(true)}
          className="self-start sm:self-center inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-agri-500 hover:bg-agri-400 text-stone-950 text-xs sm:text-sm font-bold shadow-md transition-all min-h-touch cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isTa ? 'புதிய குழு தொடங்கு' : 'Create Cluster'}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-wrap items-center gap-3">
        {/* District Filter */}
        <div className="w-full sm:w-48">
          <select
            value={searchDistrict}
            onChange={(e) => setSearchDistrict(e.target.value)}
            className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white cursor-pointer"
          >
            <option value="">{isTa ? 'அனைத்து மாவட்டங்கள்' : 'All Districts'}</option>
            {TN_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {isTa ? (TN_DISTRICTS_TA[d] || d) : d}
              </option>
            ))}
          </select>
        </div>

        {/* Crop Filter */}
        <div className="w-full sm:w-48">
          <select
            value={searchCrop}
            onChange={(e) => setSearchCrop(e.target.value)}
            className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white cursor-pointer"
          >
            <option value="">{isTa ? 'அனைத்துப் பயிர்கள்' : 'All Crop Focus'}</option>
            {TAMIL_NADU_CROPS.map((c) => (
              <option key={c.id} value={c.id}>
                {isTa ? c.ta : c.en}
              </option>
            ))}
          </select>
        </div>

        {/* Near Me Geo Filter */}
        <button
          type="button"
          onClick={handleNearMeToggle}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer min-h-touch ${
            nearGeo
              ? 'bg-agri-100 text-agri-900 border-agri-300'
              : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
          }`}
        >
          <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>
            {nearGeo
              ? (isTa ? 'அருகில் 50 கி.மீ (நீக்கு)' : 'Near Me (Active)')
              : (isTa ? 'என் அருகில் உள்ளவை' : 'Near Me')}
          </span>
        </button>

        {/* Clear Filters */}
        {(searchDistrict || searchCrop || nearGeo) && (
          <button
            type="button"
            onClick={() => {
              setSearchDistrict('');
              setSearchCrop('');
              setNearGeo(null);
            }}
            className="text-xs text-stone-500 hover:text-stone-900 ml-auto font-medium cursor-pointer"
          >
            {t('app.clearFilter')}
          </button>
        )}
      </div>

      {/* Segmented Tabs Switcher */}
      <div className="flex rounded-2xl p-1 bg-stone-200/80 max-w-sm">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>{isTa ? 'அனைத்து குழுக்கள்' : 'Browse Clusters'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my')}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'my'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>{isTa ? 'என் குழுக்கள்' : 'My Clusters'} ({myClusters.length})</span>
        </button>
      </div>

      {/* Clusters Feed */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-stone-200">
          <Loader2 className="w-8 h-8 text-agri-700 animate-spin mb-2" />
          <p className="text-xs text-stone-500">{t('app.loading')}</p>
        </div>
      ) : displayedClusters.length === 0 ? (
        <div className="py-16 px-4 bg-white rounded-3xl border border-stone-200 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-900">
            {isTa ? 'குழுக்கள் எதுவும் கிடைக்கவில்லை' : 'No Clusters Found'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {isTa
              ? 'நீங்கள் புதிய விவசாயக் குழுவைத் தொடங்கி உங்கள் பகுதியில் இயற்கை விவசாயிகளை இணைக்கலாம்.'
              : 'Create a new cluster to connect organic farmers in your locality.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedClusters.map((cluster) => (
            <ClusterCard
              key={cluster._id}
              cluster={cluster}
              currentFarmerId={currentFarmerId}
              onViewDetails={(c) => setSelectedCluster(c)}
              onJoin={handleJoinCluster}
              isJoining={joinClusterMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Cluster Detail Modal */}
      {selectedCluster && (
        <ClusterDetailModal
          isOpen={Boolean(selectedCluster)}
          onClose={() => setSelectedCluster(null)}
          cluster={selectedCluster}
          currentFarmerId={currentFarmerId}
          onAddPooledProduce={(c) => setPooledListingCluster(c)}
        />
      )}

      {/* Pooled Produce Form Modal */}
      {pooledListingCluster && (
        <ProduceFormModal
          isOpen={Boolean(pooledListingCluster)}
          onClose={() => setPooledListingCluster(null)}
          isPooled={true}
          onSubmit={handleCreatePooledProduceSubmit}
          isSubmitting={createPooledMutation.isPending}
        />
      )}

      {/* Create Cluster Modal */}
      {showCreateClusterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-stone-200 my-8">
            <div className="p-5 sm:p-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-agri-100 flex items-center justify-center text-agri-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    {isTa ? 'புதிய விவசாயக் குழுவை உருவாக்கு' : 'Start a New Cluster'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {isTa ? 'நீங்கள் இக்குழுவின் தலைவராக இருப்பீர்கள்' : 'You will be designated as Cluster Lead'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateClusterModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClusterSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {isTa ? 'குழுவின் பெயர்*' : 'Cluster Name*'}
                </label>
                <input
                  type="text"
                  required
                  value={createClusterData.name}
                  onChange={(e) => setCreateClusterData({ ...createClusterData, name: e.target.value })}
                  placeholder={isTa ? 'எ.கா. வைகை இயற்கை விவசாயிகள் குழு' : 'e.g. Vaigai Natural Farmers Cluster'}
                  className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {isTa ? 'மாவட்டம்*' : 'District*'}
                </label>
                <select
                  value={createClusterData.district}
                  onChange={(e) => setCreateClusterData({ ...createClusterData, district: e.target.value })}
                  className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white cursor-pointer"
                >
                  {TN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {isTa ? (TN_DISTRICTS_TA[d] || d) : d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {isTa ? 'முக்கிய பயிர்கள் (Crop Focus)' : 'Primary Crop Focus'}
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {TAMIL_NADU_CROPS.map((crop) => {
                    const isSelected = createClusterData.cropFocus.includes(crop.id);
                    return (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setCreateClusterData({
                              ...createClusterData,
                              cropFocus: createClusterData.cropFocus.filter((c) => c !== crop.id),
                            });
                          } else {
                            setCreateClusterData({
                              ...createClusterData,
                              cropFocus: [...createClusterData.cropFocus, crop.id],
                            });
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-agri-700 text-white border-agri-700 font-bold'
                            : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {isTa ? crop.ta : crop.en}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {isTa ? 'குழு விளக்கம்' : 'Description & Vision'}
                </label>
                <textarea
                  rows="2"
                  value={createClusterData.description}
                  onChange={(e) => setCreateClusterData({ ...createClusterData, description: e.target.value })}
                  placeholder={isTa ? 'எங்கள் வட்டாரத்தில் பாரம்பரிய நெல் சாகுபடிக்கான குழு...' : 'Collective farming and marketing group...'}
                  className="w-full text-xs border border-stone-300 rounded-xl p-2.5 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                <input
                  id="combined-listings-toggle"
                  type="checkbox"
                  checked={createClusterData.combinedListings}
                  onChange={(e) => setCreateClusterData({ ...createClusterData, combinedListings: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-agri-600 rounded border-stone-300 focus:ring-agri-500 cursor-pointer"
                />
                <label htmlFor="combined-listings-toggle" className="text-xs text-stone-700 cursor-pointer select-none">
                  <span className="font-bold block text-stone-900 mb-0.5">
                    {isTa ? 'கூட்டு விளைபொருள் விற்பனையை அனுமதி (Combined Listings)' : 'Enable Combined Pooled Listings'}
                  </span>
                  {isTa
                    ? 'குழு உறுப்பினர்களின் விளைபொருட்களை ஒன்றாகத் திரட்டி மொத்தமாக சந்தையில் விற்க உதவும்.'
                    : 'Allows cluster lead to create pooled market listings aggregated from members.'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateClusterModal(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  {t('app.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createClusterMutation.isPending}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs"
                >
                  {createClusterMutation.isPending ? t('app.saving') : (isTa ? 'குழுவை உருவாக்கு' : 'Create Cluster')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
