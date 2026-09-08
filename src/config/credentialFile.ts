import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

/**
 * Resolve the credential environment file from an installed source or build module URL.
 *
 * `EBAY_CREDENTIAL_ENV_PATH` may select a dedicated credential file for a deployment
 * (for example `.env.production`). Relative overrides resolve from the package root,
 * not the caller's working directory, so scheduled tasks and MCP hosts behave
 * consistently. When no override is supplied the historical package-root `.env`
 * remains the default.
 *
 * @param moduleUrl - URL of a module in `src/config` or `build/config`.
 * @param overridePath - Optional path override, primarily for deterministic tests.
 * @returns Absolute path to the credential environment file.
 *
 * @example
 * ```ts
 * resolveCredentialEnvPath(import.meta.url);
 * resolveCredentialEnvPath(import.meta.url, '.env.production');
 * ```
 */
export const resolveCredentialEnvPath = (
  moduleUrl: string | URL,
  overridePath: string | undefined = process.env.EBAY_CREDENTIAL_ENV_PATH,
): string => {
  const packageRoot = join(dirname(fileURLToPath(moduleUrl)), '../..');
  const requestedPath = overridePath?.trim();

  if (!requestedPath) {
    return join(packageRoot, '.env');
  }

  return isAbsolute(requestedPath) ? requestedPath : resolve(packageRoot, requestedPath);
};

/** Credential file used for both runtime reads and token writes. */
export const CREDENTIAL_ENV_PATH = resolveCredentialEnvPath(import.meta.url);
