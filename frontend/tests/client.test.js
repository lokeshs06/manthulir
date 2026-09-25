import { describe, it, expect, beforeEach } from 'vitest';
import { apiClient } from '../src/api/client';
import { tokenStorage } from '../src/lib/tokenStorage';
import i18n from '../src/i18n';

describe('apiClient request interceptor', () => {
  beforeEach(() => {
    tokenStorage.clearAll();
  });

  it('attaches Bearer token when access token is present', async () => {
    tokenStorage.setAccessToken('valid-bearer-token');

    // Run interceptor directly
    const config = { headers: {}, params: {} };
    const handler = apiClient.interceptors.request.handlers[0].fulfilled;
    const modified = await handler(config);

    expect(modified.headers.Authorization).toBe('Bearer valid-bearer-token');
  });

  it('attaches Accept-Language header matching i18n language', async () => {
    await i18n.changeLanguage('ta');

    const config = { headers: {}, params: {} };
    const handler = apiClient.interceptors.request.handlers[0].fulfilled;
    const modified = await handler(config);

    expect(modified.headers['Accept-Language']).toBe('ta');
    expect(modified.params.lang).toBe('ta');
  });
});
