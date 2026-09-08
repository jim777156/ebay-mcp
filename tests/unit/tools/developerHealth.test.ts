import type { EbaySellerApi } from '@/api/index.js';
import { developerEntries } from '@/tools/categories/developer.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

const healthEntry = developerEntries.find((entry) => entry.definition.name === 'ebay_ops_health');

if (!healthEntry) {
  throw new Error('ebay_ops_health tool is not registered');
}

describe('ebay_ops_health', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reports production authentication and safety posture without exposing secrets', async () => {
    vi.stubEnv('EBAY_READ_ONLY', 'true');
    vi.stubEnv('EBAY_STAGE_ONLY', 'true');
    vi.stubEnv('EBAY_ENABLE_LIVE_LISTINGS', 'false');

    const api = {
      getConfig: () => ({
        environment: 'production',
        marketplaceId: 'EBAY_GB',
        contentLanguage: 'en-GB',
        clientId: 'client-id-secret-value',
        clientSecret: 'client-secret-value',
        refreshToken: 'refresh-token-secret-value',
      }),
      getTokenInfo: () => ({
        hasUserToken: true,
        hasAppAccessToken: true,
      }),
      isAuthenticated: () => true,
      hasUserTokens: () => true,
    } as unknown as EbaySellerApi;

    const result = (await healthEntry.handler(api, {})) as Record<string, unknown>;

    expect(result).toMatchObject({
      status: 'healthy',
      environment: 'production',
      marketplaceId: 'EBAY_GB',
      contentLanguage: 'en-GB',
      authenticated: true,
      userTokensLoaded: true,
      userAccessTokenValid: true,
      appAccessTokenValid: true,
      refreshTokenConfigured: true,
      clientCredentialsConfigured: true,
      readOnly: true,
      stageOnly: true,
      liveListingsEnabled: false,
      safeReadOnlyPosture: true,
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('client-id-secret-value');
    expect(serialized).not.toContain('client-secret-value');
    expect(serialized).not.toContain('refresh-token-secret-value');
  });

  it('reports degraded when durable user auth is not healthy', async () => {
    vi.stubEnv('EBAY_READ_ONLY', 'true');
    vi.stubEnv('EBAY_STAGE_ONLY', 'true');
    vi.stubEnv('EBAY_ENABLE_LIVE_LISTINGS', 'false');

    const api = {
      getConfig: () => ({
        environment: 'production',
        marketplaceId: 'EBAY_GB',
        contentLanguage: 'en-GB',
        clientId: 'configured',
        clientSecret: 'configured',
        refreshToken: '',
      }),
      getTokenInfo: () => ({
        hasUserToken: false,
        hasAppAccessToken: true,
      }),
      isAuthenticated: () => true,
      hasUserTokens: () => false,
    } as unknown as EbaySellerApi;

    const result = (await healthEntry.handler(api, {})) as Record<string, unknown>;

    expect(result.status).toBe('degraded');
    expect(result.refreshTokenConfigured).toBe(false);
    expect(result.userAccessTokenValid).toBe(false);
    expect(result.safeReadOnlyPosture).toBe(true);
  });
});
