import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { tokenStorage } from '../lib/tokenStorage';
import { queryClient } from '../lib/queryClient';
import i18n from '../i18n';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data with current token
  const loadUser = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile || null);
        if (res.data.user?.preferredLanguage && res.data.user.preferredLanguage !== i18n.language) {
          i18n.changeLanguage(res.data.user.preferredLanguage);
        }
        return res.data.user;
      }
    } catch {
      setUser(null);
      setProfile(null);
      tokenStorage.clearAll();
    }
    return null;
  }, []);

  // On App Boot: Silent Refresh if refresh token exists in localStorage
  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const res = await authApi.refresh(refreshToken);
          if (res.success && res.data) {
            tokenStorage.setAccessToken(res.data.accessToken);
            tokenStorage.setRefreshToken(res.data.refreshToken);
            setUser(res.data.user);
            await loadUser();
          }
        } catch {
          // Token expired or invalid
          tokenStorage.clearAll();
          setUser(null);
          setProfile(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [loadUser]);

  // Login handler
  const login = async ({ phone, password }) => {
    const res = await authApi.login({ phone, password });
    if (res.success && res.data) {
      const { user: loggedInUser, accessToken, refreshToken } = res.data;
      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);
      setUser(loggedInUser);
      if (loggedInUser.preferredLanguage) {
        i18n.changeLanguage(loggedInUser.preferredLanguage);
      }
      await loadUser();
      return loggedInUser;
    }
    throw new Error('Login failed');
  };

  // Register handler
  const register = async ({ name, phone, password, role, preferredLanguage }) => {
    const res = await authApi.register({
      name,
      phone,
      password,
      role,
      preferredLanguage: preferredLanguage || i18n.language,
    });
    if (res.success && res.data) {
      const { user: registeredUser, accessToken, refreshToken } = res.data;
      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);
      setUser(registeredUser);
      if (preferredLanguage) {
        i18n.changeLanguage(preferredLanguage);
      }
      await loadUser();
      return registeredUser;
    }
    throw new Error('Registration failed');
  };

  // Logout handler
  const logout = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } finally {
      tokenStorage.clearAll();
      setUser(null);
      setProfile(null);
      queryClient.clear();
    }
  };

  const value = {
    user,
    profile,
    setProfile,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
