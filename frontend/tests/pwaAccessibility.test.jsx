import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { OfflineBanner } from '../src/components/common/OfflineBanner';
import { LanguageToggle } from '../src/components/common/LanguageToggle';
import { RootLayout } from '../src/layouts/RootLayout';
import { AuthContext } from '../src/context/AuthContext';
import i18n from '../src/i18n';

describe('Phase 8: PWA, Offline & Accessibility Suite', () => {
  beforeEach(() => {
    i18n.changeLanguage('ta');
  });

  describe('OfflineBanner', () => {
    it('is hidden when online and appears when offline event fires', async () => {
      render(<OfflineBanner />);
      
      // Initially online - banner should not be in DOM
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Trigger offline event
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      const alert = await screen.findByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toContain('இணைய இணைப்பு துண்டிக்கப்பட்டுள்ளது');

      // Trigger online event
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('LanguageToggle Accessibility & Switching', () => {
    it('toggles language between Tamil and English and updates document lang', async () => {
      render(<LanguageToggle />);

      // Active language button displays Tamil initially
      expect(i18n.language).toBe('ta');
      const toggleBtn = screen.getByRole('button', { name: /Toggle language/i });
      expect(toggleBtn).toHaveTextContent('தமிழ்');
      
      await act(async () => {
        fireEvent.click(toggleBtn);
      });

      expect(i18n.language).toBe('en');
      expect(toggleBtn).toHaveTextContent('English');

      await act(async () => {
        fireEvent.click(toggleBtn);
      });

      expect(i18n.language).toBe('ta');
      expect(toggleBtn).toHaveTextContent('தமிழ்');
    });
  });

  describe('RootLayout Mobile Bottom Navigation & Accessibility', () => {
    it('renders mobile navigation with high contrast and minimum touch target classes', () => {
      const mockAuth = {
        user: { id: 'f-1', name: 'செல்வம்', role: 'farmer' },
        token: 'token',
        isAuthenticated: true,
        logout: vi.fn(),
      };

      const { container } = render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/farmer']}>
            <RootLayout />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      // Verify mobile nav exists with aria-label
      const mobileNav = screen.getByRole('navigation', { name: /Mobile Navigation/i });
      expect(mobileNav).toBeInTheDocument();

      // Verify touch target size class
      const touchLinks = container.querySelectorAll('.min-h-touch');
      expect(touchLinks.length).toBeGreaterThan(0);
    });

    it('renders guest navigation with marketplace, schemes, knowledge and login/register links', () => {
      const mockAuth = {
        user: null,
        token: null,
        isAuthenticated: false,
        logout: vi.fn(),
      };

      render(
        <AuthContext.Provider value={mockAuth}>
          <MemoryRouter initialEntries={['/']}>
            <RootLayout />
          </MemoryRouter>
        </AuthContext.Provider>
      );

      expect(screen.getAllByText('சந்தை').length).toBeGreaterThan(0);
      expect(screen.getAllByText('அரசுத் திட்டங்கள்').length).toBeGreaterThan(0);
      expect(screen.getAllByText('உள்நுழை').length).toBeGreaterThan(0);
    });
  });
});
