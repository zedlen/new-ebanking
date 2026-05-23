const DEFAULT_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';

/**
 * SEC-04: never allow wildcard CORS methods in production.
 */
export function resolveAllowedCorsMethods(
  nodeEnv: string | undefined,
  configured: string | undefined,
): string {
  const env = nodeEnv ?? 'development';
  const value = (configured ?? DEFAULT_METHODS).trim();

  if (env === 'production' && (value === '*' || value === '')) {
    return DEFAULT_METHODS;
  }

  return value || DEFAULT_METHODS;
}
