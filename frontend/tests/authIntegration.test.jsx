import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/queryClient';
import { AuthProvider } from '../src/context/AuthContext';
import App from '../src/App';
import { tokenStorage } from '../src/lib/tokenStorage';
import { authApi } from '../src/api/auth.api';

describe('Auth Integration Flow', () => {
  beforeEach(() => {
    tokenStorage.clearAll();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders landing page with Tamil title and links', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('மண் துளிர்')).toBeInTheDocument();
    expect(screen.getAllByText('உள்நுழை').length).toBeGreaterThan(0);
    expect(screen.getAllByText('பதிவு செய்').length).toBeGreaterThan(0);
  });

  it('allows logging in with phone & password and navigates to farmer dashboard', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue({
      success: true,
      data: {
        user: {
          _id: 'farmer-1',
          name: 'Muthu Selvam',
          phone: '9000000101',
          role: 'farmer',
          preferredLanguage: 'ta',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    });

    vi.spyOn(authApi, 'getMe').mockResolvedValue({
      success: true,
      data: {
        user: {
          _id: 'farmer-1',
          name: 'Muthu Selvam',
          phone: '9000000101',
          role: 'farmer',
          preferredLanguage: 'ta',
        },
        profile: {
          district: 'Madurai',
          landSizeAcres: 3,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Wait for login form to mount
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /கணக்கில் உள்நுழைக/i })).toBeInTheDocument();
    });

    // Enter phone and password
    const phoneInput = screen.getByLabelText(/தொலைபேசி எண்/i);
    const passwordInput = screen.getByLabelText(/கடவுச்சொல்/i);
    const submitBtn = screen.getByRole('button', { name: /உள்நுழைக/i });

    fireEvent.change(phoneInput, { target: { value: '9000000101' } });
    fireEvent.change(passwordInput, { target: { value: 'farmerPass123' } });
    fireEvent.click(submitBtn);

    // Should navigate to farmer dashboard
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /வணக்கம், Muthu Selvam!/i })).toBeInTheDocument();
    });

    expect(screen.getAllByText(/மாற்ற காலவரிசை/i).length).toBeGreaterThan(0);
    expect(tokenStorage.getAccessToken()).toBe('mock-access-token');
    expect(tokenStorage.getRefreshToken()).toBe('mock-refresh-token');
  });

  it('blocks unauthorized access to farmer route for unauthenticated guests', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/farmer']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Should redirect to /login and show login form
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /கணக்கில் உள்நுழைக/i })).toBeInTheDocument();
    });
  });
});
