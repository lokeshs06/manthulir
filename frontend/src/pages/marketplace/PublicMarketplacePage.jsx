import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  Filter,
  Search,
  MapPin,
  ShieldCheck,
  Users,
  Send,
  X,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { useProduceList } from '../../hooks/useProduce';
import { TAMIL_NADU_DISTRICTS } from '../../config/constants';
import { BadgeTile } from '../../components/common/BadgeTile';
import { ProduceInquiryModal } from '../../features/inquiries/ProduceInquiryModal';
import { Link } from 'react-router-dom';

export const PublicMarketplacePage = () => {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [badgeLevel, setBadgeLevel] = useState('');
  const [certificationStatus, setCertificationStatus] = useState('');
  const [clusterOnly, setClusterOnly] = useState(false);
  const [selectedProduceForInquiry, setSelectedProduceForInquiry] = useState(null);
  const [inquirySuccessToast, setInquirySuccessToast] = useState(false);

  const filters = React.useMemo(() => {
    const f = {};
    if (searchQuery) f.crop = searchQuery;
    if (district) f.district = district;
    if (badgeLevel) f.badgeLevel = badgeLevel;
    if (certificationStatus) f.certificationStatus = certificationStatus;
    if (clusterOnly) f.clusterOnly = 'true';
    return f;
  }, [searchQuery, district, badgeLevel, certificationStatus, clusterOnly]);

  // Fetch produce with filters
  const { data, isLoading, isError, refetch } = useProduceList(filters);

  const produceList = data?.data || [];

  const handleClearFilters = () => {
    setSearchQuery('');
    setDistrict('');
    setBadgeLevel('');
    setCertificationStatus('');
    setClusterOnly(false);
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(district) ||
    Boolean(badgeLevel) ||
    Boolean(certificationStatus) ||
    clusterOnly;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-agri-700" />
            <span>{isTa ? 'இயற்கை விளைபொருள் சந்தை' : 'Organic Produce Marketplace'}</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {isTa
              ? 'தமிழ்நாடு முழுவதும் சரிபார்க்கப்பட்ட இயற்கை விவசாயிகளிடம் இருந்து நேரடியாக கொள்முதல் செய்யுங்கள்'
              : 'Direct farm-gate sourcing from verified natural & organic farmers across Tamil Nadu'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Crop Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={isTa ? 'பயிர் பெயர் தேடுக...' : 'Search crop name...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600"
            />
          </div>

          {/* District Picker */}
          <div>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              aria-label={isTa ? 'மாவட்டம்' : 'District'}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600 cursor-pointer"
            >
              <option value="">{isTa ? 'அனைத்து மாவட்டங்கள்' : 'All Districts'}</option>
              {TAMIL_NADU_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Trust Badge Filter */}
          <div>
            <select
              value={badgeLevel}
              onChange={(e) => setBadgeLevel(e.target.value)}
              aria-label={isTa ? 'நம்பகத்தன்மை பேட்ஜ்' : 'Trust Badge'}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600 cursor-pointer"
            >
              <option value="">{isTa ? 'அனைத்து பேட்ஜ்களும்' : 'All Trust Badges'}</option>
              <option value="bronze">{isTa ? 'வெண்கல பேட்ஜ் (6+ மாதம்)' : 'Bronze (6+ mos)'}</option>
              <option value="silver">{isTa ? 'வெள்ளி பேட்ஜ் (12+ மாதம்)' : 'Silver (12+ mos)'}</option>
              <option value="gold">{isTa ? 'தங்க பேட்ஜ் (24+ மாதம்)' : 'Gold (24+ mos)'}</option>
            </select>
          </div>

          {/* Certification Status Filter */}
          <div>
            <select
              value={certificationStatus}
              onChange={(e) => setCertificationStatus(e.target.value)}
              aria-label={isTa ? 'சான்றிதழ் நிலை' : 'Certification Status'}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-agri-600 cursor-pointer"
            >
              <option value="">{isTa ? 'அனைத்து சான்றிதழ் நிலைகளும்' : 'All Certifications'}</option>
              <option value="certified">{isTa ? 'அங்கீகரிக்கப்பட்ட இயற்கை (Certified)' : 'Certified Organic'}</option>
              <option value="peer-verified">{isTa ? 'சக சரிபார்ப்பு (Peer Verified)' : 'Peer Verified'}</option>
              <option value="self-reported">{isTa ? 'சுய அறிவிப்பு (Self Reported)' : 'Self Reported'}</option>
            </select>
          </div>
        </div>

        {/* Second row: Cluster toggle and clear filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
          <label className="inline-flex items-center gap-2 font-semibold text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={clusterOnly}
              onChange={(e) => setClusterOnly(e.target.checked)}
              className="w-4 h-4 rounded text-agri-700 focus:ring-agri-600 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-stone-500" />
              <span>{isTa ? 'குழு கூட்டு விற்பனை மட்டும்' : 'Cluster / Pooled Produce Only'}</span>
            </span>
          </label>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('app.clearFilter')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Inquiry Sent Toast */}
      {inquirySuccessToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
          <span>
            {isTa
              ? 'உங்கள் விசாரணை விவசாயிக்கு வெற்றிகரமாக அனுப்பப்பட்டது! விவசாயி ஏற்றதும் தொலைபேசி எண் பகிரப்படும்.'
              : 'Inquiry sent successfully! Farmer phone will appear under Sent Inquiries once accepted.'}
          </span>
          <button
            type="button"
            onClick={() => setInquirySuccessToast(false)}
            className="p-1 text-emerald-800 hover:text-emerald-950 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Produce Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-stone-500 text-sm">{t('app.loading')}</div>
      ) : isError ? (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <span>{t('app.error')}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="font-bold underline cursor-pointer"
          >
            {t('app.retry')}
          </button>
        </div>
      ) : produceList.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
          <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">
            {isTa ? 'பொருத்தமான விளைபொருட்கள் கிடைக்கவில்லை' : 'No produce listings found'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {isTa
              ? 'வடிகட்டிகளை மாற்றி அல்லது நீக்கி மீண்டும் தேடவும்.'
              : 'Try relaxing your search terms or filters to discover more farmer listings.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 text-xs font-bold text-agri-800 bg-agri-100 hover:bg-agri-200 rounded-xl"
            >
              {t('app.clearFilter')}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {produceList.map((item) => {
            const cropTitle = isTa ? item.cropNameTa || item.cropName : item.cropName;
            const farmerId = item.farmerId?._id || item.farmerId;
            const farmerName = item.farmerId?.name || (isTa ? 'இயற்கை விவசாயி' : 'Organic Farmer');
            const isPooled = Boolean(item.clusterId);

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Photo or Crop Placeholder */}
                  <div className="h-40 rounded-2xl bg-stone-100 overflow-hidden relative border border-stone-200/60 flex items-center justify-center">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={cropTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-stone-400 gap-1">
                        <ShoppingBag className="w-8 h-8 text-stone-300" />
                        <span className="text-[11px] font-medium">{cropTitle}</span>
                      </div>
                    )}

                    {/* Trust Badge Overlay */}
                    <div className="absolute top-2.5 right-2.5">
                      <BadgeTile level={item.badgeLevel || 'bronze'} size="sm" showLabel={false} />
                    </div>

                    {/* Pooled Tag */}
                    {isPooled && (
                      <div className="absolute top-2.5 left-2.5 bg-agri-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                        <Users className="w-3 h-3" />
                        <span>{isTa ? 'குழு விற்பனை' : 'Pooled'}</span>
                      </div>
                    )}
                  </div>

                  {/* Title and Farmer */}
                  <div>
                    <h3 className="font-bold text-stone-900 text-base leading-snug">{cropTitle}</h3>
                    <div className="flex items-center justify-between text-xs text-stone-500 mt-1">
                      <span className="font-medium text-stone-700">{farmerName}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{item.district}</span>
                      </span>
                    </div>
                  </div>

                  {/* Certification status & Description */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {item.certificationStatus === 'certified'
                          ? isTa ? 'அங்கீகரிக்கப்பட்ட இயற்கை' : 'Certified Organic'
                          : item.certificationStatus === 'peer-verified'
                          ? isTa ? 'சக சரிபார்ப்பு' : 'Peer Verified'
                          : isTa ? 'சுய அறிவிப்பு' : 'Self Reported'}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-stone-600 line-clamp-2 text-xs leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Price & Quantity */}
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-stone-500 block">
                        {isTa ? 'விலை' : 'Price'}
                      </span>
                      <span className="text-base font-black text-agri-900">
                        ₹{item.pricePerUnit}{' '}
                        <span className="text-xs font-normal text-stone-500">/ {item.unit}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-stone-500 block">
                        {isTa ? 'இருப்பு' : 'Available'}
                      </span>
                      <span className="font-bold text-stone-800">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  {farmerId && (
                    <Link
                      to={`/farmers/${farmerId}/public`}
                      className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1 p-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-agri-700" />
                      <span>{isTa ? 'நம்பகத்தன்மை' : 'Trust Trail'}</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedProduceForInquiry(item)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-agri-700 hover:bg-agri-800 text-white text-xs font-bold shadow-xs cursor-pointer min-h-touch ml-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTa ? 'விசாரணை அனுப்பு' : 'Send Inquiry'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inquiry Modal */}
      {selectedProduceForInquiry && (
        <ProduceInquiryModal
          isOpen={Boolean(selectedProduceForInquiry)}
          produce={selectedProduceForInquiry}
          onClose={() => setSelectedProduceForInquiry(null)}
          onSuccess={() => {
            setInquirySuccessToast(true);
            setTimeout(() => setInquirySuccessToast(false), 5000);
          }}
        />
      )}
    </div>
  );
};
