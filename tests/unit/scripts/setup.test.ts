import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('setup refresh-token verification', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not request a broader scope during refresh verification', () => {
    const setupSource = readFileSync(resolve('src/scripts/setup.ts'), 'utf8');
    const start = setupSource.indexOf('async function verifyRefreshToken');
    const end = setupSource.indexOf('const accessToken = tokenResponse.data.access_token;', start);
    const verificationSource = setupSource.slice(start, end);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    expect(verificationSource).toContain("grant_type: 'refresh_token'");
    expect(verificationSource).toContain('refresh_token: refreshToken');
    expect(verificationSource).not.toContain('scope:');
    expect(verificationSource).not.toContain('sell.inventory');
  });
});
