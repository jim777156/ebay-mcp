import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import nock from 'nock';
import { EbayApiClient } from '@/api/client.js';
import { MediaApi } from '@/api/other/media.js';
import type { EbayConfig } from '@/types/ebay.js';
import { Effect } from 'effect';

const mockOAuthClient = {
  getAccessToken: vi.fn(),
  getOrRefreshAppAccessToken: vi.fn(),
  initialize: vi.fn(),
};

vi.mock('@/auth/oauth.js', () => ({
  EbayOAuthClient: vi.fn(function (this: unknown) {
    return mockOAuthClient;
  }),
}));

describe('Media response Location handling', () => {
  let client: EbayApiClient;
  let media: MediaApi;

  beforeEach(async () => {
    vi.clearAllMocks();
    nock.cleanAll();
    nock.disableNetConnect();

    const config: EbayConfig = {
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      environment: 'sandbox',
      redirectUri: 'https://localhost/callback',
    };

    mockOAuthClient.getAccessToken.mockReturnValue(Effect.succeed('mock_access_token'));
    mockOAuthClient.getOrRefreshAppAccessToken.mockReturnValue(Effect.succeed('mock_app_token'));
    mockOAuthClient.initialize.mockReturnValue(Effect.succeed(undefined));

    client = new EbayApiClient(config);
    await Effect.runPromise(client.initialize());
    media = new MediaApi(client);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('preserves body-only client semantics while exposing normalized response headers', async () => {
    let responseHeaders: Readonly<Record<string, string>> | undefined;

    nock('https://api.sandbox.ebay.com')
      .post('/commerce/media/v1_beta/test')
      .reply(200, { ok: true }, { Location: '/commerce/media/v1_beta/image/abc123' });

    const result = await client.post<{ ok: boolean }>(
      '/commerce/media/v1_beta/test',
      { value: 1 },
      {
        onResponseHeaders: (headers) => {
          responseHeaders = headers;
        },
      },
    );

    expect(result).toEqual({ ok: true });
    expect(responseHeaders?.location).toBe('/commerce/media/v1_beta/image/abc123');
  });

  it('returns the Location-derived image ID for base64 file upload', async () => {
    nock('https://api.sandbox.ebay.com')
      .post('/commerce/media/v1_beta/image/create_image_from_file')
      .reply(
        201,
        {
          imageUrl: 'https://i.ebayimg.com/images/g/test/s-l1600.jpg',
          expirationDate: '2027-09-08T00:00:00.000Z',
        },
        { Location: 'https://api.sandbox.ebay.com/commerce/media/v1_beta/image/image%2F123' },
      );

    const result = await Effect.runPromise(
      media.uploadImageBase64({
        image: Buffer.from('synthetic-image').toString('base64'),
        filename: 'sandbox-test.png',
        contentType: 'image/png',
      }),
    );

    expect(result.imageId).toBe('image/123');
    expect(result.location).toContain('/commerce/media/v1_beta/image/image%2F123');
    expect(result.imageUrl).toBe('https://i.ebayimg.com/images/g/test/s-l1600.jpg');
  });

  it('returns the Location-derived image ID for URL ingestion', async () => {
    nock('https://api.sandbox.ebay.com')
      .post('/commerce/media/v1_beta/image/create_image_from_url')
      .reply(
        201,
        { imageUrl: 'https://i.ebayimg.com/images/g/url-test/s-l1600.jpg' },
        { Location: '/commerce/media/v1_beta/image/url-image-456/' },
      );

    const result = await Effect.runPromise(
      media.createImageFromUrl({ imageUrl: 'https://example.com/test-image.jpg' }),
    );

    expect(result.imageId).toBe('url-image-456');
    expect(result.imageUrl).toBe('https://i.ebayimg.com/images/g/url-test/s-l1600.jpg');
  });

  it('fails explicitly when a successful create response has no Location header', async () => {
    nock('https://api.sandbox.ebay.com')
      .post('/commerce/media/v1_beta/image/create_image_from_url')
      .reply(201, { imageUrl: 'https://i.ebayimg.com/images/g/missing-location/s-l1600.jpg' });

    const result = await Effect.runPromise(
      Effect.either(media.createImageFromUrl({ imageUrl: 'https://example.com/test-image.jpg' })),
    );

    expect(result._tag).toBe('Left');
    if (result._tag === 'Left') {
      expect(result.left._tag).toBe('MediaResponseError');
      expect(result.left.message).toMatch(/Location header/);
    }
  });

  it('fails explicitly when Location does not identify a Media image resource', async () => {
    nock('https://api.sandbox.ebay.com')
      .post('/commerce/media/v1_beta/image/create_image_from_url')
      .reply(
        201,
        { imageUrl: 'https://i.ebayimg.com/images/g/bad-location/s-l1600.jpg' },
        { Location: '/commerce/media/v1_beta/not-image/bad' },
      );

    const result = await Effect.runPromise(
      Effect.either(media.createImageFromUrl({ imageUrl: 'https://example.com/test-image.jpg' })),
    );

    expect(result._tag).toBe('Left');
    if (result._tag === 'Left') {
      expect(result.left._tag).toBe('MediaResponseError');
    }
  });
});
