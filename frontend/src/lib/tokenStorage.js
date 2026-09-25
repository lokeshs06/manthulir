// Token Storage: in-memory for access token (security), localStorage for refresh token
const REFRESH_TOKEN_KEY = 'manthulir_refresh_token';

let inMemoryAccessToken = null;
const authListeners = new Set();

export const tokenStorage = {
  getAccessToken: () => inMemoryAccessToken,

  setAccessToken: (token) => {
    inMemoryAccessToken = token;
    tokenStorage.notifyListeners();
  },

  clearAccessToken: () => {
    inMemoryAccessToken = null;
    tokenStorage.notifyListeners();
  },

  getRefreshToken: () => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch {
      // ignore storage quota errors in private browsing
    }
  },

  clearRefreshToken: () => {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // ignore
    }
  },

  clearAll: () => {
    inMemoryAccessToken = null;
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // ignore
    }
    tokenStorage.notifyListeners();
  },

  subscribe: (listener) => {
    authListeners.add(listener);
    return () => authListeners.delete(listener);
  },

  notifyListeners: () => {
    for (const listener of authListeners) {
      listener(inMemoryAccessToken);
    }
  }
};
