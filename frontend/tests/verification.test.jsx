import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/queryClient';
import { AuthProvider } from '../src/context/AuthContext';
import { FarmerVerificationPage } from '../src/pages/farmer/FarmerVerificationPage';
import { LogCard } from '../src/features/verification/LogCard';
import { verificationApi } from '../src/api/verification.api';
import { farmerApi } from '../src/api/farmer.api';
import { authApi } from '../src/api/auth.api';
import { tokenStorage } from '../src/lib/tokenStorage';
import { compressImage } from '../src/lib/imageCompressor';

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

const setupFarmerAuth = () => {
  tokenStorage.setAccessToken('mock-access-token');
  tokenStorage.setRefreshToken('mock-refresh-token');

  vi.spyOn(authApi, 'refresh').mockResolvedValue({
    success: true,
    data: {
      user: {
        _id: 'farmer-1',
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
        _id: 'farmer-1',
        name: 'Muthu Selvam',
        role: 'farmer',
        preferredLanguage: 'ta',
      },
      profile: {
        district: 'Madurai',
        trustBadge: 'bronze',
        certification: { reviewStatus: 'none' },
      },
    },
  });
};

describe('Phase 3: Trust & Verification', () => {
  beforeEach(() => {
    tokenStorage.clearAll();
    localStorage.clear();
    queryClient.clear();
    vi.restoreAllMocks();
  });

  describe('Image Compression Utility', () => {
    it('handles non-image files safely without failing', async () => {
      const textFile = new File(['sample content'], 'test.pdf', { type: 'application/pdf' });
      const result = await compressImage(textFile);
      expect(result.name).toBe('test.pdf');
    });
  });

  describe('Peer Verification & Flagging Logic on LogCard', () => {
    it('shows Peer Verify button when viewer shares cluster and log is fresh (<=30 days old)', async () => {
      const freshLog = {
        _id: 'log-101',
        entryType: 'panchagavya-application',
        description: 'Applied fresh panchagavya',
        capturedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days old
        peerVerifications: [],
        isFlagged: false,
      };

      renderWithProviders(
        <LogCard log={freshLog} viewerSharesCluster={true} isOwnLog={false} />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /சக சரிபார்ப்பு செய்க/i })).toBeInTheDocument();
      });
    });

    it('does NOT show Peer Verify button on own log or log older than 30 days', async () => {
      const oldLog = {
        _id: 'log-102',
        entryType: 'compost-application',
        capturedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days old
        peerVerifications: [],
        isFlagged: false,
      };

      const { rerender } = renderWithProviders(
        <LogCard log={oldLog} viewerSharesCluster={true} isOwnLog={false} />
      );
      expect(screen.queryByRole('button', { name: /சக சரிபார்ப்பு செய்க/i })).not.toBeInTheDocument();

      // Own log should not show peer verify button even if fresh
      rerender(
        <LogCard log={{ ...oldLog, capturedAt: new Date().toISOString() }} viewerSharesCluster={true} isOwnLog={true} />
      );
      expect(screen.queryByRole('button', { name: /சக சரிபார்ப்பு செய்க/i })).not.toBeInTheDocument();
    });

    it('allows flagging suspicious logs with prompt', async () => {
      setupFarmerAuth();

      const logToFlag = {
        _id: 'log-103',
        entryType: 'panchagavya-application',
        description: 'Suspicious chemical bottle in photo',
        capturedAt: new Date().toISOString(),
        peerVerifications: [],
        isFlagged: false,
      };

      const flagSpy = vi.spyOn(verificationApi, 'flagLog').mockResolvedValue({
        success: true,
        data: { _id: 'log-103', isFlagged: true },
      });

      renderWithProviders(
        <LogCard log={logToFlag} viewerSharesCluster={false} isOwnLog={false} />
      );

      const flagBtn = await screen.findByRole('button', { name: /கொடியிடு/i });
      fireEvent.click(flagBtn);

      // Flag dialog should appear
      expect(screen.getByText(/சந்தேகத்திற்குரியதாகக் கொடியிடு/i)).toBeInTheDocument();

      const reasonInput = screen.getByPlaceholderText(/கொடியிடுவதற்கான காரணம்.../i);
      fireEvent.change(reasonInput, { target: { value: 'Used chemical pesticide' } });

      const submitFlagBtns = screen.getAllByRole('button', { name: /கொடியிடு/i });
      fireEvent.click(submitFlagBtns[submitFlagBtns.length - 1]);

      await waitFor(() => {
        expect(flagSpy).toHaveBeenCalledWith('log-103', 'Used chemical pesticide');
      });
    });
  });

  describe('Farmer Verification Page Feed & Actions', () => {
    it('renders logs feed with badge criteria summary and modals', async () => {
      setupFarmerAuth();

      vi.spyOn(farmerApi, 'getProfile').mockResolvedValue({
        success: true,
        data: {
          district: 'Madurai',
          trustBadge: 'bronze',
          certification: { reviewStatus: 'none' },
        },
      });

      vi.spyOn(verificationApi, 'getMyLogs').mockResolvedValue({
        success: true,
        data: [
          {
            _id: 'log-1',
            entryType: 'panchagavya-application',
            description: 'Applied 200L Jeevamrutham in paddy field',
            capturedAt: new Date().toISOString(),
            media: [{ url: 'https://example.com/paddy.jpg', publicId: 'p1' }],
            peerVerifications: [{ verifierId: 'v1', verifiedAt: new Date().toISOString() }],
            isFlagged: false,
          },
        ],
        meta: { pagination: { total: 1, totalPages: 1 } },
      });

      renderWithProviders(<FarmerVerificationPage />);

      // Verify Header & Badge
      await waitFor(() => {
        expect(screen.getByText(/சரிபார்ப்பு பதிவுகள்/i)).toBeInTheDocument();
        expect(screen.getByText(/வெண்கல பேட்ஜ்/i)).toBeInTheDocument();
      });

      // Verify log card
      await waitFor(() => {
        expect(screen.getByText(/Applied 200L Jeevamrutham in paddy field/i)).toBeInTheDocument();
        expect(screen.getByText(/1 சக சரிபார்ப்புகள்/i)).toBeInTheDocument();
      });

      // Open Add Log modal
      const addLogBtn = screen.getByRole('button', { name: /பதிவு சேர்க்க/i });
      fireEvent.click(addLogBtn);

      expect(screen.getByText(/சரிபார்ப்பு பதிவு சேர்த்தல்/i)).toBeInTheDocument();
      expect(screen.getByText(/செயல்பாட்டு வகை/i)).toBeInTheDocument();
    });
  });
});
