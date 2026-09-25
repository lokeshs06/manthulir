import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tokenStorage } from '../src/lib/tokenStorage';

describe('tokenStorage', () => {
  beforeEach(() => {
    tokenStorage.clearAll();
    localStorage.clear();
  });

  it('keeps access token in memory only', () => {
    expect(tokenStorage.getAccessToken()).toBeNull();
    tokenStorage.setAccessToken('mem-access-token-123');
    expect(tokenStorage.getAccessToken()).toBe('mem-access-token-123');
    expect(localStorage.getItem('manthulir_access_token')).toBeNull();
  });

  it('persists refresh token in localStorage', () => {
    expect(tokenStorage.getRefreshToken()).toBeNull();
    tokenStorage.setRefreshToken('refresh-token-xyz');
    expect(tokenStorage.getRefreshToken()).toBe('refresh-token-xyz');
    expect(localStorage.getItem('manthulir_refresh_token')).toBe('refresh-token-xyz');
  });

  it('clears all tokens cleanly', () => {
    tokenStorage.setAccessToken('tok-1');
    tokenStorage.setRefreshToken('tok-2');
    tokenStorage.clearAll();

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(localStorage.getItem('manthulir_refresh_token')).toBeNull();
  });

  it('notifies subscribers when token changes', () => {
    const listener = vi.fn();
    const unsubscribe = tokenStorage.subscribe(listener);

    tokenStorage.setAccessToken('test-token');
    expect(listener).toHaveBeenCalledWith('test-token');

    unsubscribe();
    tokenStorage.setAccessToken('new-token');
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
