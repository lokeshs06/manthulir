import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/queryClient';
import { AuthProvider } from '../src/context/AuthContext';
import { PestDetectionPage } from '../src/pages/farmer/PestDetectionPage';
import { PestPhotoUploader } from '../src/features/pest/PestPhotoUploader';
import { PestResultCard } from '../src/features/pest/PestResultCard';
import { PestHistoryList } from '../src/features/pest/PestHistoryList';
import { pestApi } from '../src/api/pest.api';
import { authApi } from '../src/api/auth.api';
import { tokenStorage } from '../src/lib/tokenStorage';

import * as compressorModule from '../src/lib/imageCompressor';

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
    },
  });
};

describe('Phase 4: Pest Detection', () => {
  beforeEach(() => {
    tokenStorage.clearAll();
    localStorage.clear();
    queryClient.clear();
    vi.restoreAllMocks();

    window.URL.createObjectURL = vi.fn(() => 'blob:mock-preview-url');
    window.URL.revokeObjectURL = vi.fn();
    vi.spyOn(compressorModule, 'compressImage').mockImplementation(async (f) => f);
  });

  describe('PestPhotoUploader', () => {
    it('renders camera/upload buttons and training consent checkbox', () => {
      renderWithProviders(<PestPhotoUploader onScanComplete={vi.fn()} />);

      expect(screen.getByText(/AI பூச்சி & நோய் கண்டறிதல்/i)).toBeInTheDocument();
      expect(screen.getByText(/கேமரா மூலம் படம் எடு/i)).toBeInTheDocument();
      expect(screen.getByText(/படத்தைப் பதிவேற்று/i)).toBeInTheDocument();

      const consentCheckbox = screen.getByRole('checkbox');
      expect(consentCheckbox).toBeChecked();
    });

    it('handles image selection and triggers detect mutation on submit', async () => {
      const onScanComplete = vi.fn();
      const mockDetect = vi.spyOn(pestApi, 'detectPest').mockResolvedValue({
        success: true,
        data: {
          detection: {
            _id: 'det-1',
            resultType: 'confident',
            topLabel: 'rice_yellow_stem_borer',
            topConfidence: 0.94,
          },
          remedies: [
            {
              _id: 'rem-1',
              pestName: 'Yellow Stem Borer',
              pestNameTa: 'மஞ்சள் தண்டு துளைப்பான்',
              problemType: 'insect',
              severity: 'high',
              organicTreatments: [
                {
                  method: 'Pheromone traps',
                  methodTa: 'பெரோமோன் பொறிகள்',
                  ingredients: ['Pheromone lures'],
                  preparationSteps: ['Install 8-10 traps per acre'],
                },
              ],
            },
          ],
        },
      });

      renderWithProviders(<PestPhotoUploader onScanComplete={onScanComplete} />);

      // Create a mock image file
      const file = new File(['mock-image-content'], 'crop_leaf.jpg', { type: 'image/jpeg' });
      const input = document.getElementById('gallery-input');

      fireEvent.change(input, { target: { files: [file] } });

      // After selection, the submit button appears
      const submitBtn = await screen.findByRole('button', { name: /பூச்சி \/ நோயைக் கண்டறி/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockDetect).toHaveBeenCalled();
        expect(onScanComplete).toHaveBeenCalled();
      });
    });
  });

  describe('PestResultCard Three Distinct States', () => {
    it('renders confident match with organic remedies only', () => {
      const scanData = {
        detection: {
          _id: 'det-101',
          resultType: 'confident',
          topLabel: 'rice_yellow_stem_borer',
          topConfidence: 0.92,
        },
        remedies: [
          {
            _id: 'rem-101',
            pestName: 'Yellow Stem Borer',
            scientificName: 'Scirpophaga incertulas',
            problemType: 'insect',
            severity: 'high',
            symptoms: 'Dead hearts in vegetative stage',
            reviewedByExpert: false,
            organicTreatments: [
              {
                method: 'Pheromone traps',
                ingredients: ['Funnel traps', 'Lures'],
                preparationSteps: ['Install traps at crop canopy height'],
                applicationFrequency: 'Continuous monitoring',
                precautions: 'Check lures every 2 weeks',
              },
            ],
            preventiveMeasures: ['Synchronize planting across cluster'],
          },
        ],
      };

      renderWithProviders(<PestResultCard scanData={scanData} />);

      // Confident badge
      expect(screen.getByText(/உறுதியான கண்டறிதல்/i)).toBeInTheDocument();
      expect(screen.getByText(/92%/i)).toBeInTheDocument();

      // Remedy & organic treatments
      expect(screen.getAllByText(/Yellow Stem Borer/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Scirpophaga incertulas/i)).toBeInTheDocument();
      expect(screen.getByText(/100% இயற்கை முறைகள் மட்டும்/i)).toBeInTheDocument();
      expect(screen.getByText(/Pheromone traps/i)).toBeInTheDocument();
      expect(screen.getByText(/Dead hearts in vegetative stage/i)).toBeInTheDocument();

      // Unverified expert notice
      expect(screen.getByText(/வேளாண் வல்லுநரால் இறுதி சரிபார்ப்பு/i)).toBeInTheDocument();
    });

    it('renders uncertain result with predictions and KVK extension officer guidance', () => {
      const uncertainData = {
        detection: {
          _id: 'det-102',
          resultType: 'uncertain',
          predictions: [
            { label: 'brown_planthopper', confidence: 0.55 },
            { label: 'rice_leaf_folder', confidence: 0.32 },
          ],
        },
        message: 'For a confident diagnosis, contact your nearest KVK.',
        remedies: [],
      };

      renderWithProviders(<PestResultCard scanData={uncertainData} />);

      // Inconclusive alert
      expect(screen.getByText(/உறுதியற்ற கண்டறிதல்/i)).toBeInTheDocument();
      expect(screen.getByText(/உறுதியான முடிவு கண்டறியப்படவில்லை/i)).toBeInTheDocument();

      // KVK guidance box
      expect(screen.getByText(/KVK \/ வேளாண் விரிவாக்க அலுவலர் வழிகாட்டல்/i)).toBeInTheDocument();
      expect(screen.getByText(/contact your nearest KVK/i)).toBeInTheDocument();

      // Top candidate matches
      expect(screen.getByText(/brown planthopper/i)).toBeInTheDocument();
      expect(screen.getByText(/55%/i)).toBeInTheDocument();
      expect(screen.getByText(/rice leaf folder/i)).toBeInTheDocument();
      expect(screen.getByText(/32%/i)).toBeInTheDocument();
    });

    it('renders service-unavailable friendly message and retry affordance', () => {
      const unavailableData = {
        detection: {
          resultType: 'service-unavailable',
          predictions: [],
        },
      };

      const onRetry = vi.fn();
      renderWithProviders(<PestResultCard scanData={unavailableData} onRetry={onRetry} />);

      expect(screen.getByText(/சேவை தற்காலிகமாக கிடைக்கவில்லை/i)).toBeInTheDocument();
      expect(screen.getByText(/கிருஷி விஞ்ஞான் கேந்திரா \(KVK\) அல்லது வேளாண் விரிவாக்க அலுவலரிடம் காண்பிக்கவும்/i)).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /மீண்டும் பகுப்பாய்வு செய்/i });
      fireEvent.click(retryBtn);
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('Farmer Accuracy Feedback Flow', () => {
    it('submits accuracy feedback with optional note', async () => {
      setupFarmerAuth();

      const feedbackSpy = vi.spyOn(pestApi, 'submitFeedback').mockResolvedValue({
        success: true,
        data: { _id: 'det-201', farmerFeedback: 'correct' },
      });

      const scanData = {
        detection: {
          _id: 'det-201',
          resultType: 'confident',
          topLabel: 'stem_borer',
          topConfidence: 0.9,
          farmerFeedback: null,
        },
        remedies: [],
      };

      renderWithProviders(<PestResultCard scanData={scanData} />);

      expect(screen.getByText(/இந்த கண்டறிதல் உங்கள் கள நிலவரத்திற்கு சரியானதா\?/i)).toBeInTheDocument();

      const correctBtn = screen.getByRole('button', { name: /சரியானது/i });
      fireEvent.click(correctBtn);

      await waitFor(() => {
        expect(feedbackSpy).toHaveBeenCalledWith('det-201', {
          farmerFeedback: 'correct',
          feedbackNote: undefined,
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/உங்கள் கருத்துக்கு நன்றி!/i)).toBeInTheDocument();
      });
    });
  });

  describe('Pest History Feed', () => {
    it('renders paginated past scans and displays details on click', async () => {
      vi.spyOn(pestApi, 'getMyDetections').mockResolvedValue({
        success: true,
        data: [
          {
            _id: 'det-past-1',
            resultType: 'confident',
            topLabel: 'rice_blast',
            topConfidence: 0.88,
            createdAt: new Date().toISOString(),
            farmerFeedback: 'correct',
            imageUrl: 'https://example.com/blast.jpg',
            remedyIds: [],
          },
        ],
        meta: { pagination: { total: 1, totalPages: 1 } },
      });

      renderWithProviders(<PestHistoryList />);

      await waitFor(() => {
        expect(screen.getByText(/rice blast/i)).toBeInTheDocument();
        expect(screen.getByText(/88%/i)).toBeInTheDocument();
      });

      // Click the history item to view details
      const historyCard = screen.getByText(/rice blast/i);
      fireEvent.click(historyCard);

      expect(screen.getByText(/வரலாற்றுப் பட்டியலுக்குத் திரும்பு/i)).toBeInTheDocument();
    });
  });

  describe('Farmer Pest Detection Page', () => {
    it('switches between New Scan and History tabs and shows quote', () => {
      renderWithProviders(<PestDetectionPage />);

      expect(screen.getByText(/இயற்கை பூச்சி & நோய் பாதுகாப்பு/i)).toBeInTheDocument();
      expect(screen.getByText(/பூச்சிகள் எதிரிகள் அல்ல/i)).toBeInTheDocument();

      const historyTab = screen.getByRole('button', { name: /முந்தைய கண்டறிதல்கள்/i });
      fireEvent.click(historyTab);

      expect(screen.getByRole('button', { name: /முந்தைய கண்டறிதல்கள்/i })).toHaveClass('bg-white');
    });
  });
});
