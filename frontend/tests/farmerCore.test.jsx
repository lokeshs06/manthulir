import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/queryClient';
import { AuthProvider } from '../src/context/AuthContext';
import { FarmerProfilePage } from '../src/pages/farmer/FarmerProfilePage';
import { FarmerTimelinePage } from '../src/pages/farmer/FarmerTimelinePage';
import { SchemesPage } from '../src/pages/schemes/SchemesPage';
import { UnverifiedNotice } from '../src/components/common/UnverifiedNotice';
import { BadgeTile } from '../src/components/common/BadgeTile';
import { farmerApi } from '../src/api/farmer.api';
import { schemesApi } from '../src/api/schemes.api';
import { authApi } from '../src/api/auth.api';
import { tokenStorage } from '../src/lib/tokenStorage';

const renderWithProviders = (ui) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>{ui}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
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
        landSizeAcres: 3,
        cropTypes: ['paddy', 'turmeric'],
        transitionStatus: 'in-progress',
      },
    },
  });
};

describe('Phase 2: Farmer Core', () => {
  beforeEach(() => {
    tokenStorage.clearAll();
    localStorage.clear();
    queryClient.clear();
    vi.restoreAllMocks();
  });

  describe('UnverifiedNotice & BadgeTile', () => {
    it('renders placeholder warning notice when scheme is unverified', () => {
      render(<UnverifiedNotice verified={false} />);
      expect(
        screen.getByText(/அரசு தளம் மூலம் இன்னும் சரிபார்க்கப்படவில்லை/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/மானிய தொகைகள் தற்காலிகமானவை/i)
      ).toBeInTheDocument();
    });

    it('renders verified tag when scheme is verified', () => {
      render(<UnverifiedNotice verified={true} />);
      expect(screen.getByText(/சரிபார்க்கப்பட்டது/i)).toBeInTheDocument();
    });

    it('renders BadgeTile tiers correctly with accessible labels', () => {
      const { rerender } = render(<BadgeTile level="bronze" />);
      expect(screen.getByText(/வெண்கல பேட்ஜ்/i)).toBeInTheDocument();

      rerender(<BadgeTile level="silver" />);
      expect(screen.getByText(/வெள்ளி பேட்ஜ்/i)).toBeInTheDocument();

      rerender(<BadgeTile level="gold" />);
      expect(screen.getByText(/தங்க பேட்ஜ்/i)).toBeInTheDocument();
    });
  });

  describe('Farmer Profile Page', () => {
    it('renders profile with district picker and allows saving', async () => {
      setupFarmerAuth();

      vi.spyOn(farmerApi, 'getProfile').mockResolvedValue({
        success: true,
        data: {
          district: 'Madurai',
          village: 'Thiruparankundram',
          landSizeAcres: 3,
          cropTypes: ['paddy', 'turmeric'],
          transitionStatus: 'in-progress',
          farmerCategory: 'small',
        },
      });

      const updateSpy = vi.spyOn(farmerApi, 'updateProfile').mockResolvedValue({
        success: true,
        data: {
          district: 'Coimbatore',
          village: 'Sulur',
          landSizeAcres: 4,
          cropTypes: ['paddy', 'turmeric', 'cotton'],
          transitionStatus: 'in-progress',
          farmerCategory: 'small',
        },
      });

      renderWithProviders(<FarmerProfilePage />);

      // Wait for profile fields to populate
      await waitFor(() => {
        expect(screen.getByDisplayValue('Thiruparankundram')).toBeInTheDocument();
      });

      const districtSelect = screen.getByLabelText(/மாவட்டம்/i);
      expect(districtSelect.value).toBe('Madurai');

      // Change district to Coimbatore
      fireEvent.change(districtSelect, { target: { value: 'Coimbatore' } });

      // Save
      const saveBtn = screen.getByRole('button', { name: /சேமி/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledWith(
          expect.objectContaining({ district: 'Coimbatore' })
        );
      });
    });
  });

  describe('Farmer Timeline Page', () => {
    it('renders 5 milestones (0, 6, 12, 24, 36 months) with linked schemes', async () => {
      setupFarmerAuth();

      vi.spyOn(farmerApi, 'getProfile').mockResolvedValue({
        success: true,
        data: {
          district: 'Madurai',
          transitionStatus: 'in-progress',
        },
      });

      vi.spyOn(farmerApi, 'getTimeline').mockResolvedValue({
        success: true,
        data: [
          {
            monthMark: 0,
            dueDate: '2026-01-01T00:00:00.000Z',
            status: 'completed',
            guidanceKey: 'milestone-0',
            linkedSchemes: [
              {
                scheme: {
                  _id: 'scheme-1',
                  name: 'National Mission on Natural Farming',
                  nameTa: 'தேசிய இயற்கை வேளாண் இயக்கம்',
                  level: 'central',
                  verified: false,
                },
                isSaved: false,
                isApplied: false,
              },
            ],
          },
          {
            monthMark: 6,
            dueDate: '2026-07-01T00:00:00.000Z',
            status: 'active',
            guidanceKey: 'milestone-6',
            linkedSchemes: [],
          },
          { monthMark: 12, status: 'upcoming', linkedSchemes: [] },
          { monthMark: 24, status: 'upcoming', linkedSchemes: [] },
          { monthMark: 36, status: 'upcoming', linkedSchemes: [] },
        ],
      });

      renderWithProviders(<FarmerTimelinePage />);

      await waitFor(() => {
        expect(screen.getByText('மாதம் 0')).toBeInTheDocument();
        expect(screen.getByText('மாதம் 6')).toBeInTheDocument();
        expect(screen.getByText('மாதம் 12')).toBeInTheDocument();
        expect(screen.getByText('மாதம் 24')).toBeInTheDocument();
        expect(screen.getByText('மாதம் 36')).toBeInTheDocument();
      });

      // Linked scheme should appear under Month 0
      expect(screen.getByText(/தேசிய இயற்கை வேளாண் இயக்கம்/i)).toBeInTheDocument();
    });
  });

  describe('Schemes Page & Matcher', () => {
    it('renders scheme list and allows switching to smart matcher', async () => {
      setupFarmerAuth();

      vi.spyOn(schemesApi, 'getSchemes').mockResolvedValue({
        success: true,
        data: [
          {
            _id: 'scheme-101',
            name: 'Tamil Nadu Organic Farming Policy Support',
            nameTa: 'தமிழ்நாடு இயற்கை வேளாண் ஆதரவுத் திட்டம்',
            level: 'state',
            verified: false,
            description: 'Support scheme for organic inputs and bio-fertilizers',
            benefits: [{ type: 'subsidy', amount: 'PLACEHOLDER' }],
          },
        ],
        meta: { pagination: { total: 1, totalPages: 1 } },
      });

      vi.spyOn(schemesApi, 'matchSchemes').mockResolvedValue({
        success: true,
        data: {
          eligible: [
            {
              scheme: {
                _id: 'scheme-101',
                name: 'Tamil Nadu Organic Farming Policy Support',
                nameTa: 'தமிழ்நாடு இயற்கை வேளாண் ஆதரவுத் திட்டம்',
                level: 'state',
                verified: false,
              },
              matchedReasons: ['Open to all districts', 'Covered under small farmer category'],
            },
          ],
          nearMatches: [
            {
              scheme: {
                _id: 'scheme-102',
                name: 'Cluster Organic Support Scheme',
                nameTa: 'குழு இயற்கை வேளாண் திட்டம்',
                level: 'state',
                verified: false,
              },
              unmetCriteria: ['Requires a cluster with at least 20 members'],
            },
          ],
        },
      });

      renderWithProviders(<SchemesPage />);

      // Verify scheme in browse list
      await waitFor(() => {
        expect(screen.getByText(/தமிழ்நாடு இயற்கை வேளாண் ஆதரவுத் திட்டம்/i)).toBeInTheDocument();
      });

      // Switch to Matcher tab
      const matcherTabBtn = screen.getByRole('button', { name: /சுயவிவர திட்டம் பொருத்துதல்/i });
      fireEvent.click(matcherTabBtn);

      // Verify eligible reasons checklist
      await waitFor(() => {
        expect(screen.getByText(/பொருத்தமான காரணங்கள்:/i)).toBeInTheDocument();
        expect(screen.getByText(/Open to all districts/i)).toBeInTheDocument();
      });

      // Switch to Near Matches sub-tab
      const nearMatchesBtn = screen.getByRole('button', { name: /அருகிலுள்ள பொருத்தங்கள்/i });
      fireEvent.click(nearMatchesBtn);

      // Verify unmet criteria checklist
      await waitFor(() => {
        expect(screen.getByText(/பூர்த்தி செய்ய வேண்டியவை:/i)).toBeInTheDocument();
        expect(screen.getByText(/Requires a cluster with at least 20 members/i)).toBeInTheDocument();
      });
    });
  });
});
