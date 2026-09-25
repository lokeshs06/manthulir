import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../src/context/AuthContext';
import { PublicMarketplacePage } from '../src/pages/marketplace/PublicMarketplacePage';
import { ProduceInquiryModal } from '../src/features/inquiries/ProduceInquiryModal';
import { BuyerInquiriesPage } from '../src/pages/buyer/BuyerInquiriesPage';
import { BuyerProfilePage } from '../src/pages/buyer/BuyerProfilePage';
import { PublicFarmerProfilePage } from '../src/pages/farmer/PublicFarmerProfilePage';
import { KnowledgePage } from '../src/pages/knowledge/KnowledgePage';
import { ArticleDetailPage } from '../src/pages/knowledge/ArticleDetailPage';
import { produceApi } from '../src/api/produce.api';
import { inquiryApi } from '../src/api/inquiry.api';
import { buyerApi } from '../src/api/buyer.api';
import { farmerApi } from '../src/api/farmer.api';
import { verificationApi } from '../src/api/verification.api';
import { articleApi } from '../src/api/article.api';
import { authApi } from '../src/api/auth.api';
import { tokenStorage } from '../src/lib/tokenStorage';

import i18n from '../src/i18n';

let testQueryClient;

const AllTheProviders = ({ children }) => (
  <QueryClientProvider client={testQueryClient}>
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  </QueryClientProvider>
);

const renderWithProviders = (ui, options) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

const setupBuyerAuth = (userId = 'buyer-user-1') => {
  tokenStorage.setAccessToken('mock-buyer-access-token');
  tokenStorage.setRefreshToken('mock-buyer-refresh-token');

  vi.spyOn(authApi, 'refresh').mockResolvedValue({
    success: true,
    data: {
      user: {
        _id: userId,
        name: 'Kavitha Organic Mart',
        role: 'buyer',
        phone: '9876543210',
        preferredLanguage: 'ta',
      },
      accessToken: 'mock-buyer-access-token',
      refreshToken: 'mock-buyer-refresh-token-rot',
    },
  });

  vi.spyOn(authApi, 'getMe').mockResolvedValue({
    success: true,
    data: {
      user: {
        _id: userId,
        name: 'Kavitha Organic Mart',
        role: 'buyer',
        phone: '9876543210',
        preferredLanguage: 'ta',
      },
      profile: {
        _id: 'buyer-prof-1',
        buyerType: 'shop',
        organizationName: 'Kavitha Organic Mart',
        district: 'Madurai',
        interestedCrops: ['Traditional Paddy'],
      },
    },
  });
};

describe('Phase 6: Buyer & Public Views', () => {
  beforeEach(async () => {
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    tokenStorage.clearAll();
    localStorage.clear();
    await i18n.changeLanguage('ta');
    vi.restoreAllMocks();
  });

  describe('Public Marketplace & Inquiry Modal', () => {
    const mockProduceList = [
      {
        _id: 'prod-101',
        cropName: 'Traditional Karuppu Kavuni Rice',
        cropNameTa: 'கருப்பு கவுனி அரிசி',
        quantity: 300,
        unit: 'kg',
        pricePerUnit: 120,
        district: 'Madurai',
        badgeLevel: 'silver',
        certificationStatus: 'peer-verified',
        farmerId: { _id: 'farmer-101', name: 'Muthu Selvam' },
      },
    ];

    it('renders produce cards with crop name, price, badge and opens inquiry modal', async () => {
      vi.spyOn(produceApi, 'getProduce').mockResolvedValue({
        success: true,
        data: mockProduceList,
        meta: { pagination: { total: 1, totalPages: 1 } },
      });

      renderWithProviders(<PublicMarketplacePage />);

      await waitFor(() => {
        expect(produceApi.getProduce).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(
          screen.getAllByText(/(Traditional Karuppu Kavuni Rice|கருப்பு கவுனி அரிசி)/i).length
        ).toBeGreaterThanOrEqual(1);
      });

      expect(screen.getByText(/₹120/i)).toBeInTheDocument();
      expect(screen.getByText(/300 kg/i)).toBeInTheDocument();
      expect(screen.getByText(/Muthu Selvam/i)).toBeInTheDocument();

      // Click Send Inquiry button
      const inquiryBtn = screen.getByRole('button', { name: /விசாரணை அனுப்பு/i });
      fireEvent.click(inquiryBtn);

      // Inquiry modal opens
      expect(await screen.findByText(/விவசாயிக்கு நேரடி வர்த்தக விசாரணை/i)).toBeInTheDocument();
    });

    it('ProduceInquiryModal warns about contact phone privacy before sending', async () => {
      setupBuyerAuth();

      const createSpy = vi.spyOn(produceApi, 'createInquiry').mockResolvedValue({
        success: true,
        data: { _id: 'inq-new-1' },
      });

      renderWithProviders(
        <ProduceInquiryModal
          isOpen={true}
          produce={mockProduceList[0]}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      );

      // Wait for auth resolution and privacy banner
      expect(await screen.findByText(/தொடர்பு எண் பாதுகாப்பு:/i)).toBeInTheDocument();

      // Enter message
      const msgInput = screen.getByLabelText(/விசாரணைச் செய்தி/i);
      fireEvent.change(msgInput, { target: { value: 'Need 50kg for trial' } });

      // Submit inquiry
      const submitBtn = screen.getByRole('button', { name: /விசாரணை அனுப்பு/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalledWith('prod-101', {
          requestedQuantity: 100,
          message: 'Need 50kg for trial',
        });
      });
    });
  });

  describe('BuyerInquiriesPage & Contact Phone Number Privacy Gate', () => {
    it('reveals farmer phone ONLY when inquiry is accepted, concealing it when pending/declined', async () => {
      setupBuyerAuth();

      const sampleInquiries = [
        {
          _id: 'inq-accepted',
          status: 'accepted',
          requestedQuantity: 100,
          produceId: { cropName: 'Organic Millets', cropNameTa: 'இயற்கை தினை' },
          farmerId: { name: 'Muthu Selvam' },
          farmerPhone: '9876543210',
          farmerResponse: 'Available for immediate dispatch.',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'inq-pending',
          status: 'open',
          requestedQuantity: 50,
          produceId: { cropName: 'Country Jaggery', cropNameTa: 'நாட்டு சர்க்கரை' },
          farmerId: { name: 'Rajan K' },
          farmerPhone: '9123456789', // Should NOT be shown!
          createdAt: new Date().toISOString(),
        },
      ];

      vi.spyOn(inquiryApi, 'getSentInquiries').mockResolvedValue({
        success: true,
        data: sampleInquiries,
      });

      renderWithProviders(<BuyerInquiriesPage />);

      await waitFor(() => {
        expect(screen.getByText(/இயற்கை தினை/i)).toBeInTheDocument();
        expect(screen.getByText(/நாட்டு சர்க்கரை/i)).toBeInTheDocument();
      });

      // Accepted inquiry reveals phone number
      expect(screen.getByText(/9876543210/i)).toBeInTheDocument();
      expect(screen.getByText(/Available for immediate dispatch./i)).toBeInTheDocument();

      // Pending inquiry conceals phone number and displays privacy shield
      expect(screen.queryByText(/9123456789/i)).not.toBeInTheDocument();
      expect(
        screen.getByText(/விவசாயி இந்த விசாரணையை ஏற்ற பின்னரே தொடர்பு எண் பகிரப்படும்./i)
      ).toBeInTheDocument();
    });
  });

  describe('BuyerProfilePage', () => {
    it('loads buyer profile and saves changes with district and crop preferences', async () => {
      setupBuyerAuth();

      vi.spyOn(buyerApi, 'getMyProfile').mockResolvedValue({
        success: true,
        data: {
          buyerType: 'shop',
          organizationName: 'Arokya Organic Store',
          district: 'Madurai',
          interestedCrops: ['Traditional Paddy'],
        },
      });

      const updateSpy = vi.spyOn(buyerApi, 'updateMyProfile').mockResolvedValue({
        success: true,
        data: { updated: true },
      });

      renderWithProviders(<BuyerProfilePage />);

      await waitFor(() => {
        expect(screen.getByLabelText(/வணிகப் பெயர்/i)).toHaveValue('Arokya Organic Store');
      });

      const nameInput = screen.getByLabelText(/வணிகப் பெயர்/i);

      // Change organization name
      fireEvent.change(nameInput, { target: { value: 'Arokya Natural Organics' } });

      // Save
      const saveBtn = screen.getByRole('button', { name: /சேமி/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            organizationName: 'Arokya Natural Organics',
            district: 'Madurai',
          })
        );
      });
    });
  });

  describe('PublicFarmerProfilePage & Verification Trail', () => {
    it('displays public trust summary and verification logs without exposing phone number', async () => {
      vi.spyOn(farmerApi, 'getPublicProfile').mockResolvedValue({
        success: true,
        data: {
          _id: 'farmer-101',
          name: 'Sundaram P',
          district: 'Thanjavur',
          transitionMonth: 18,
          badgeLevel: 'silver',
          logCount: 12,
          clusterCount: 1,
        },
      });

      vi.spyOn(verificationApi, 'getFarmerLogs').mockResolvedValue({
        success: true,
        data: [
          {
            _id: 'log-1',
            entryType: 'jeevamrutham',
            description: 'Applied 200L Jeevamrutham to paddy field',
            capturedAt: new Date().toISOString(),
            images: [],
            verifiedBy: [{ farmerId: 'farmer-2', verifiedAt: new Date().toISOString() }],
          },
        ],
      });

      render(
        <QueryClientProvider client={testQueryClient}>
          <MemoryRouter initialEntries={['/farmers/farmer-101/public']}>
            <AuthProvider>
              <Routes>
                <Route path="/farmers/:id/public" element={<PublicFarmerProfilePage />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Sundaram P')).toBeInTheDocument();
      });

      expect(screen.getByText(/Thanjavur/i)).toBeInTheDocument();
      expect(screen.getByText(/18/i)).toBeInTheDocument();
      expect(screen.getByText(/வெள்ளி பேட்ஜ்/i)).toBeInTheDocument();

      // Privacy shield banner
      expect(screen.getByText(/தனிநபர் தகவல் & தொடர்பு எண் பாதுகாப்பு/i)).toBeInTheDocument();

      // Verification trail log entry
      expect(screen.getByText(/Applied 200L Jeevamrutham to paddy field/i)).toBeInTheDocument();
    });
  });

  describe('Knowledge Base & Article Detail', () => {
    const sampleArticle = {
      _id: 'art-1',
      slug: 'jeevamrutham-preparation-guide',
      title: 'How to Prepare Jeevamrutham',
      titleTa: 'ஜீவாமிர்தம் தயாரிக்கும் எளிய முறை',
      category: 'practice',
      summary: 'A step by step guide to preparing microbial-rich Jeevamrutham',
      summaryTa: 'நாட்டு மாட்டு சாணம், சிறுநீர் கொண்டு நுண்ணுயிர் பெருக்கும் முறை',
      content: '# Jeevamrutham\n\nTake 10kg cow dung and 10L cow urine.',
      contentTa: '# ஜீவாமிர்தம்\n\n10 கிலோ நாட்டு மாட்டு சாணம் மற்றும் 10 லிட்டர் கோமியம் எடுக்கவும்.',
      readTimeMinutes: 4,
      author: 'Manthulir Team',
      createdAt: new Date().toISOString(),
    };

    it('renders articles in KnowledgePage', async () => {
      vi.spyOn(articleApi, 'getArticles').mockResolvedValue({
        success: true,
        data: [sampleArticle],
      });

      renderWithProviders(<KnowledgePage />);

      await waitFor(() => {
        expect(screen.getByText(/ஜீவாமிர்தம் தயாரிக்கும் எளிய முறை/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/4 நிமிடம்/i)).toBeInTheDocument();
    });

    it('renders ArticleDetailPage with bilingual markdown', async () => {
      vi.spyOn(articleApi, 'getArticleBySlug').mockResolvedValue({
        success: true,
        data: sampleArticle,
      });

      render(
        <QueryClientProvider client={testQueryClient}>
          <MemoryRouter initialEntries={['/knowledge/jeevamrutham-preparation-guide']}>
            <AuthProvider>
              <Routes>
                <Route path="/knowledge/:slug" element={<ArticleDetailPage />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/ஜீவாமிர்தம் தயாரிக்கும் எளிய முறை/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/10 கிலோ நாட்டு மாட்டு சாணம்/i)).toBeInTheDocument();
    });
  });
});
