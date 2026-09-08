import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { resolveCredentialEnvPath } from '@/config/credentialFile.js';

describe('resolveCredentialEnvPath', () => {
  const moduleUrl = pathToFileURL(join(process.cwd(), 'src', 'config', 'credentialFile.ts'));
  const packageRoot = join(dirname(fileURLToPath(moduleUrl)), '../..');

  it('keeps the historical package-root .env default', () => {
    expect(resolveCredentialEnvPath(moduleUrl, undefined)).toBe(join(packageRoot, '.env'));
  });

  it('resolves relative overrides from the package root', () => {
    expect(resolveCredentialEnvPath(moduleUrl, '.env.production')).toBe(
      resolve(packageRoot, '.env.production'),
    );
  });

  it('preserves absolute overrides', () => {
    const absolutePath = resolve(packageRoot, 'secrets', 'ebay-production.env');
    expect(isAbsolute(absolutePath)).toBe(true);
    expect(resolveCredentialEnvPath(moduleUrl, absolutePath)).toBe(absolutePath);
  });
});
