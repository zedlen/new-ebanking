export const APP_MODULES = [
  'ebanking',
  'mobile',
  'backoffice',
  'treasury',
] as const;

export type AppModule = (typeof APP_MODULES)[number];

export function isAppModule(value: string): value is AppModule {
  return (APP_MODULES as readonly string[]).includes(value);
}

export function resolveModuleFromUrl(url: string): AppModule | null {
  const match = url.match(/^\/api\/v1\/([^/]+)/);
  if (!match) return null;
  const segment = match[1];
  if (segment === 'auth' || segment === 'health') return null;
  return isAppModule(segment) ? segment : null;
}
