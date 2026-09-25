import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../src/context/AuthContext';
import { AdminDashboardPage } from '../src/pages/admin/AdminDashboardPage';
import { AdminStatsSection } from '../src/features/admin/AdminStatsSection';
import { AdminFlaggedLogsSection } from '../src/features/admin/AdminFlaggedLogsSection';
import { AdminCertificationsSection } from '../src/features/admin/AdminCertificationsSection';
import { AdminSchemesSection } from '../src/features/admin/AdminSchemesSection';
import { AdminPestFeedbackSection } from '../src/features/admin/AdminPestFeedbackSection';
import { AdminArticlesSection } from '../src/features/admin/AdminArticlesSection';
import { adminApi } from '../src/api/admin.api';
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

const setupAdminAuth = (userId = 'admin-user-1') => {
  tokenStorage.setAccessToken('mock-admin-access-token');
  tokenStorage.setRefreshToken('mock-admin-refresh-token');

  vi.spyOn(authApi, 'refresh').mockResolvedValue({
    success: true,
    data: {
      user: {
        _id: userId,
        name: 'Dr. Selvanathan (TNAU / Admin)',
        role: 'admin',
        preferredLanguage: 'ta',
      },
      accessToken: 'mock-admin-access-token',
      refreshToken: 'mock-admin-refresh-token-rot',
    },
  });

  vi.spyOn(authApi, 'getMe').mockResolvedValue({
    success: true,
    data: {
      user: {
        _id: userId,
        name: 'Dr. Selvanathan (TNAU / Admin)',
        role: 'admin',
        preferredLanguage: 'ta',
      },
      profile: null,
    },
  });
};

describe('Phase 7: Admin Dashboard & Console', () => {
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

  describe('AdminStatsSection', () => {
    it('renders platform overview stats and transition breakdown', async () => {
      setupAdminAuth();

      vi.spyOn(adminApi, 'getStats').mockResolvedValue({
        success: true,
        data: {
          totalFarmers: 120,
          activeListings: 45,
          activeClusters: 8,
          pendingCertifications: 4,
          flaggedLogs: 2,
          farmersByStatus: {
            transitioning: 85,
            certified: 25,
            chemical: 10,
          },
          farmersByDistrict: [
            { district: 'Madurai', count: 40 },
            { district: 'Thanjavur', count: 35 },
          ],
        },
      });

      renderWithProviders(<AdminStatsSection />);

      await waitFor(() => {
        expect(screen.getByText('120')).toBeInTheDocument();
      });

      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText(/Madurai/i)).toBeInTheDocument();
      expect(screen.getByText(/40 விவசாயிகள்/i)).toBeInTheDocument();
    });
  });

  describe('AdminFlaggedLogsSection', () => {
    const mockFlagged = [
      {
        _id: 'flag-log-1',
        entryType: 'bio-pest-control',
        description: 'Sprayed neem seed kernel extract',
        capturedAt: new Date().toISOString(),
        flagReason: 'GPS location does not match farm perimeter',
        farmerId: { name: 'Murugan P', district: 'Erode' },
        images: ['https://example.com/neem.jpg'],
      },
    ];

    it('displays flagged logs and allows resolving with a resolution note', async () => {
      setupAdminAuth();

      vi.spyOn(adminApi, 'getFlaggedLogs').mockResolvedValue({
        success: true,
        data: mockFlagged,
      });

      const resolveSpy = vi.spyOn(adminApi, 'resolveFlaggedLog').mockResolvedValue({
        success: true,
        data: { resolved: true },
      });

      renderWithProviders(<AdminFlaggedLogsSection />);

      await waitFor(() => {
        expect(screen.getByText(/Murugan P/i)).toBeInTheDocument();
      });

      expect(
        screen.getByText(/GPS location does not match farm perimeter/i)
      ).toBeInTheDocument();

      // Open resolve modal
      const reviewBtn = screen.getByRole('button', { name: /மறுஆய்வு & முடிவு/i });
      fireEvent.click(reviewBtn);

      expect(screen.getByText(/கொடி மறுஆய்வு & தீர்வு/i)).toBeInTheDocument();

      // Enter resolution note
      const noteInput = screen.getByLabelText(/நிர்வாகியின் தீர்வு குறிப்பு/i);
      fireEvent.change(noteInput, {
        target: { value: 'Verified with cluster lead - farmer leased adjoining field' },
      });

      // Submit resolution
      const submitBtn = screen.getByRole('button', { name: /கொடியை நீக்குக/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(resolveSpy).toHaveBeenCalledWith(
          'flag-log-1',
          'Verified with cluster lead - farmer leased adjoining field'
        );
      });
    });
  });

  describe('AdminCertificationsSection', () => {
    const mockPendingCerts = [
      {
        _id: 'farmer-cert-1',
        name: 'Kavitha Devi',
        district: 'Dindigul',
        transitionMonth: 24,
        logCount: 30,
        certification: {
          agency: 'PGS-India Regional Council',
          certificateNumber: 'PGS-TN-2024-9842',
          expiryDate: '2028-12-31T00:00:00.000Z',
          documentUrl: 'https://example.com/cert.pdf',
        },
      },
    ];

    it('allows admin to approve farmer certification promoting status to certified', async () => {
      setupAdminAuth();

      vi.spyOn(adminApi, 'getPendingCertifications').mockResolvedValue({
        success: true,
        data: mockPendingCerts,
      });

      const reviewSpy = vi.spyOn(adminApi, 'reviewCertification').mockResolvedValue({
        success: true,
        data: { reviewed: true },
      });

      renderWithProviders(<AdminCertificationsSection />);

      await waitFor(() => {
        expect(screen.getByText('Kavitha Devi')).toBeInTheDocument();
      });

      expect(screen.getByText(/PGS-TN-2024-9842/i)).toBeInTheDocument();

      // Click Approve button
      const approveBtn = screen.getByRole('button', { name: /அங்கீகரி/i });
      fireEvent.click(approveBtn);

      expect(screen.getByText(/சான்றிதழ் அனுமதித்தல்/i)).toBeInTheDocument();

      // Confirm approval
      const confirmApproveBtn = screen.getByRole('button', { name: /உறுதிசெய்து அனுமதி/i });
      fireEvent.click(confirmApproveBtn);

      await waitFor(() => {
        expect(reviewSpy).toHaveBeenCalledWith('farmer-cert-1', {
          status: 'approved',
          reviewNote: '',
        });
      });
    });
  });

  describe('AdminSchemesSection', () => {
    const mockUnverified = [
      {
        _id: 'sch-outdated-1',
        name: 'TN Paramparagat Krishi Vikas Yojana',
        nameTa: 'பாரம்பரிய வேளாண் வளர்ச்சித் திட்டம்',
        level: 'central',
        department: 'Department of Agriculture and Farmers Welfare',
        lastVerifiedAt: '2025-01-10T00:00:00.000Z',
        officialUrl: 'https://pgsindia-ncof.gov.in',
      },
    ];

    it('lists unverified schemes and allows marking as verified today', async () => {
      setupAdminAuth();

      vi.spyOn(adminApi, 'getUnverifiedSchemes').mockResolvedValue({
        success: true,
        data: mockUnverified,
      });

      const verifySpy = vi.spyOn(adminApi, 'verifyScheme').mockResolvedValue({
        success: true,
        data: { verified: true },
      });

      renderWithProviders(<AdminSchemesSection />);

      await waitFor(() => {
        expect(screen.getByText(/பாரம்பரிய வேளாண் வளர்ச்சித் திட்டம்/i)).toBeInTheDocument();
      });

      // Click Mark Verified Today
      const verifyBtn = screen.getByRole('button', { name: /இன்று சரிபார்க்கப்பட்டது என குறி/i });
      fireEvent.click(verifyBtn);

      await waitFor(() => {
        expect(verifySpy).toHaveBeenCalledWith('sch-outdated-1');
      });
    });
  });

  describe('AdminPestFeedbackSection', () => {
    it('displays pest model feedback submitted by farmers', async () => {
      setupAdminAuth();

      vi.spyOn(adminApi, 'getPestFeedback').mockResolvedValue({
        success: true,
        data: [
          {
            _id: 'pest-fb-1',
            prediction: {
              primaryLabel: 'Fall Armyworm',
              confidence: 0.88,
            },
            feedbackNote: 'Actually stem borer in young paddy shoot',
            imageUrl: 'https://example.com/paddy-damage.jpg',
            farmerId: { name: 'Thangavel K' },
            createdAt: new Date().toISOString(),
          },
        ],
      });

      renderWithProviders(<AdminPestFeedbackSection />);

      await waitFor(() => {
        expect(screen.getByText(/Fall Armyworm/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/88.0%/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Actually stem borer in young paddy shoot/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Thangavel K/i)).toBeInTheDocument();
    });
  });

  describe('AdminDashboardPage Tab Navigation', () => {
    it('renders admin console and allows switching between sections', async () => {
      setupAdminAuth();

      vi.spyOn(adminApi, 'getStats').mockResolvedValue({
        success: true,
        data: { totalFarmers: 50, activeListings: 10 },
      });

      vi.spyOn(adminApi, 'getFlaggedLogs').mockResolvedValue({
        success: true,
        data: [],
      });

      renderWithProviders(<AdminDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/நிர்வாகக் குழு கட்டுப்பாட்டகம்/i)).toBeInTheDocument();
      });

      // Switch to Flagged Logs Tab
      const flaggedTab = screen.getByRole('button', { name: /கொடியிடப்பட்ட பதிவுகள்/i });
      fireEvent.click(flaggedTab);

      await waitFor(() => {
        expect(screen.getByText(/கொடியிடப்பட்ட சரிபார்ப்பு பதிவுகள்/i)).toBeInTheDocument();
      });
    });
  });
});
