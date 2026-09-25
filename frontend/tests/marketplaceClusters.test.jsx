import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/queryClient';
import { AuthProvider } from '../src/context/AuthContext';
import { ProduceCard } from '../src/features/produce/ProduceCard';
import { ProduceFormModal } from '../src/features/produce/ProduceFormModal';
import { InquiryCard } from '../src/features/inquiries/InquiryCard';
import { ClusterCard } from '../src/features/clusters/ClusterCard';
import { ClusterDetailModal } from '../src/features/clusters/ClusterDetailModal';
import { FarmerProducePage } from '../src/pages/farmer/FarmerProducePage';
import { FarmerClustersPage } from '../src/pages/farmer/FarmerClustersPage';
import { produceApi } from '../src/api/produce.api';
import { inquiryApi } from '../src/api/inquiry.api';
import { clusterApi } from '../src/api/cluster.api';
import { authApi } from '../src/api/auth.api';
import { tokenStorage } from '../src/lib/tokenStorage';

const AllTheProviders = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  </QueryClientProvider>
);

const renderWithProviders = (ui, options) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

const setupFarmerAuth = (userId = 'farmer-user-1') => {
  tokenStorage.setAccessToken('mock-access-token');
  tokenStorage.setRefreshToken('mock-refresh-token');

  vi.spyOn(authApi, 'refresh').mockResolvedValue({
    success: true,
    data: {
      user: {
        _id: userId,
        name: 'Muthu Selvam',
        role: 'farmer',
        preferredLanguage: 'ta',
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token-rot',
    },
  });

  vi.spyOn(authApi, 'getMe').mockResolvedValue({
    success: true,
    data: {
      user: {
        _id: userId,
        name: 'Muthu Selvam',
        role: 'farmer',
        preferredLanguage: 'ta',
      },
      profile: {
        _id: 'farmer-prof-1',
        district: 'Madurai',
        trustBadge: 'bronze',
      },
    },
  });
};

describe('Phase 5: Marketplace & Clusters', () => {
  beforeEach(() => {
    tokenStorage.clearAll();
    localStorage.clear();
    queryClient.clear();
    vi.restoreAllMocks();
  });

  describe('ProduceCard & ProduceFormModal', () => {
    const sampleProduce = {
      _id: 'prod-1',
      cropName: 'Traditional Red Rice',
      cropNameTa: 'மாப்பிள்ளை சம்பா அரிசி',
      quantity: 500,
      unit: 'kg',
      pricePerUnit: 75,
      district: 'Madurai',
      badgeLevel: 'bronze',
      certificationStatus: 'peer-verified',
      description: 'Grown with organic Jeevamrutham only',
      images: ['https://example.com/rice.jpg'],
      farmerId: 'farmer-prof-1',
    };

    it('renders produce card with price, unit, badge and owner actions', () => {
      const onEdit = vi.fn();
      const onDeactivate = vi.fn();

      renderWithProviders(
        <ProduceCard
          produce={sampleProduce}
          isOwner={true}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
        />
      );

      expect(screen.getByText(/மாப்பிள்ளை சம்பா அரிசி/i)).toBeInTheDocument();
      expect(screen.getByText(/500/i)).toBeInTheDocument();
      expect(screen.getByText(/₹75/i)).toBeInTheDocument();
      expect(screen.getByText(/Madurai/i)).toBeInTheDocument();
      expect(screen.getByText(/சக சரிபார்ப்பு/i)).toBeInTheDocument();
      expect(screen.getByText(/வெண்கல பேட்ஜ்/i)).toBeInTheDocument();

      // Owner buttons
      const editBtn = screen.getByRole('button', { name: /திருத்து/i });
      fireEvent.click(editBtn);
      expect(onEdit).toHaveBeenCalledWith(sampleProduce);
    });

    it('ProduceFormModal shows server-computed badge notice and excludes manual badge input', () => {
      renderWithProviders(
        <ProduceFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      // Notice explaining server computation
      expect(screen.getByText(/நம்பகத்தன்மை பேட்ஜ், சான்றிதழ் நிலை மற்றும் மாற்ற மாதம் ஆகியவை உங்கள் சரிபார்ப்பு பதிவுகளின் அடிப்படையில் தானாக கணக்கிடப்படும்/i)).toBeInTheDocument();

      // Form should NOT have an input for badgeLevel
      expect(screen.queryByLabelText(/badgeLevel/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/certificationStatus/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/transitionMonth/i)).not.toBeInTheDocument();
    });
  });

  describe('InquiryCard & Phone Number Reveal Protection', () => {
    it('accepting inquiry warns farmer about contact phone disclosure before confirming', async () => {
      setupFarmerAuth();

      const patchSpy = vi.spyOn(inquiryApi, 'updateInquiryStatus').mockResolvedValue({
        success: true,
        data: { _id: 'inq-1', status: 'accepted' },
      });

      const sampleInquiry = {
        _id: 'inq-1',
        produceId: { cropName: 'Organic Paddy' },
        buyerId: { name: 'Kavitha Organic Mart' },
        message: 'Looking for 200kg bulk purchase.',
        requestedQuantity: 200,
        status: 'open',
        createdAt: new Date().toISOString(),
      };

      renderWithProviders(<InquiryCard inquiry={sampleInquiry} isFarmerView={true} />);

      expect(screen.getByText(/Kavitha Organic Mart/i)).toBeInTheDocument();
      expect(screen.getAllByText(/200/i).length).toBeGreaterThanOrEqual(1);

      // Click Accept button
      const acceptBtn = screen.getByRole('button', { name: /ஏற்றுக்கொள்/i });
      fireEvent.click(acceptBtn);

      // Dialog opens warning about phone reveal
      expect(screen.getByText(/விசாரணை ஏற்பு & தொலைபேசி எண் பகிர்தல்/i)).toBeInTheDocument();
      expect(screen.getByText(/இந்த விசாரணையை ஏற்றுக்கொள்வது உங்கள் பதிவுசெய்யப்பட்ட தொலைபேசி எண்ணை வாங்குபவருக்கு வெளிப்படுத்தும்/i)).toBeInTheDocument();

      // Confirm accept inside dialog
      const confirmBtn = screen.getByRole('button', { name: /ஏற்று எண் பகிரவும்/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(patchSpy).toHaveBeenCalledWith('inq-1', {
          status: 'accepted',
          farmerResponse: undefined,
        });
      });
    });
  });

  describe('Clusters & Lead Controls', () => {
    const sampleCluster = {
      _id: 'cluster-101',
      name: 'Vaigai Organic Farmers Cluster',
      district: 'Madurai',
      cropFocus: ['Paddy', 'Turmeric'],
      description: 'Collective natural farming and direct sales',
      memberCount: 3,
      totalLandAcres: 25,
      combinedListings: true,
      members: [
        { farmerId: { _id: 'farmer-prof-1', name: 'Muthu Selvam' }, role: 'lead', joinedAt: new Date().toISOString() },
        { farmerId: { _id: 'farmer-prof-2', name: 'Rajan K' }, role: 'member', joinedAt: new Date().toISOString() },
        { farmerId: { _id: 'farmer-prof-3', name: 'Devi S' }, role: 'member', joinedAt: new Date().toISOString() },
      ],
      joinRequests: [
        { farmerId: { _id: 'farmer-prof-4', name: 'Senthil Kumar' }, requestedAt: new Date().toISOString(), status: 'pending' },
      ],
    };

    it('renders cluster card with member count and lead badge', () => {
      renderWithProviders(
        <ClusterCard
          cluster={sampleCluster}
          currentFarmerId="farmer-prof-1"
          onViewDetails={vi.fn()}
        />
      );

      expect(screen.getByText(/Vaigai Organic Farmers Cluster/i)).toBeInTheDocument();
      expect(screen.getByText(/தலைவர்/i)).toBeInTheDocument();
      expect(screen.getByText(/25/i)).toBeInTheDocument();
    });

    it('ClusterDetailModal allows lead to approve/reject join requests and requires successor when leaving', async () => {
      const decideSpy = vi.spyOn(clusterApi, 'decideJoinRequest').mockResolvedValue({
        success: true,
        data: { _id: 'cluster-101' },
      });

      const leaveSpy = vi.spyOn(clusterApi, 'leaveCluster').mockResolvedValue({
        success: true,
        data: { left: true },
      });

      renderWithProviders(
        <ClusterDetailModal
          isOpen={true}
          onClose={vi.fn()}
          cluster={sampleCluster}
          currentFarmerId="farmer-prof-1"
        />
      );

      // Lead sees Join Requests tab with badge count
      const requestsTab = screen.getByRole('button', { name: /சேர்க்கை கோரிக்கைகள்/i });
      fireEvent.click(requestsTab);

      expect(screen.getByText(/Senthil Kumar/i)).toBeInTheDocument();

      // Approve applicant
      const approveBtn = screen.getByRole('button', { name: /அங்கீகரி/i });
      fireEvent.click(approveBtn);

      await waitFor(() => {
        expect(decideSpy).toHaveBeenCalledWith('cluster-101', 'farmer-prof-4', { status: 'approved' });
      });

      // Two-step leave cluster workflow
      const leaveTrigger = screen.getByRole('button', { name: /குழுவிலிருந்து வெளியேறு/i });
      fireEvent.click(leaveTrigger);

      // Warning that lead must transfer leadership
      expect(screen.getByText(/தலைமைப் பொறுப்பு மாற்றம் தேவை/i)).toBeInTheDocument();

      // Select new lead
      const successorSelect = screen.getByRole('combobox');
      fireEvent.change(successorSelect, { target: { value: 'farmer-prof-2' } });

      const confirmLeaveBtn = screen.getByRole('button', { name: /^வெளியேறு$/i });
      fireEvent.click(confirmLeaveBtn);

      await waitFor(() => {
        expect(leaveSpy).toHaveBeenCalledWith('cluster-101', { transferLeadTo: 'farmer-prof-2' });
      });
    });
  });

  describe('FarmerProducePage & FarmerClustersPage', () => {
    it('FarmerProducePage renders listings and switches to inquiries tab', async () => {
      setupFarmerAuth();

      vi.spyOn(produceApi, 'getProduce').mockResolvedValue({
        success: true,
        data: [
          {
            _id: 'prod-my-1',
            cropName: 'Organic Millets',
            quantity: 200,
            unit: 'kg',
            pricePerUnit: 50,
            district: 'Madurai',
            farmerId: 'farmer-prof-1',
            images: [],
          },
        ],
        meta: { pagination: { total: 1, totalPages: 1 } },
      });

      vi.spyOn(inquiryApi, 'getReceivedInquiries').mockResolvedValue({
        success: true,
        data: [],
        meta: { pagination: { total: 0, totalPages: 1 } },
      });

      renderWithProviders(<FarmerProducePage />);

      await waitFor(() => {
        expect(screen.getByText(/Organic Millets/i)).toBeInTheDocument();
      });

      // Switch to Inquiries tab
      const inqTab = screen.getByRole('button', { name: /வந்த விசாரணைகள்/i });
      fireEvent.click(inqTab);

      expect(screen.getByText(/விசாரணைகள் எதுவும் இல்லை/i)).toBeInTheDocument();
    });

    it('FarmerClustersPage allows browsing clusters and filtering', async () => {
      setupFarmerAuth();

      vi.spyOn(clusterApi, 'getClusters').mockResolvedValue({
        success: true,
        data: [
          {
            _id: 'cl-1',
            name: 'Thanjavur Paddy Farmers',
            district: 'Thanjavur',
            cropFocus: ['Paddy'],
            memberCount: 5,
            totalLandAcres: 40,
            members: [],
          },
        ],
        meta: { pagination: { total: 1, totalPages: 1 } },
      });

      renderWithProviders(<FarmerClustersPage />);

      await waitFor(() => {
        expect(screen.getByText(/Thanjavur Paddy Farmers/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/40/i)).toBeInTheDocument();
    });
  });
});
