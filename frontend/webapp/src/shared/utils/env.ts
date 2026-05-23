export const env = {
  env: import.meta.env.VITE_ENV ?? 'local',
  appName: import.meta.env.VITE_APP_NAME ?? 'zeuspay',
  apiBaseKubitq: import.meta.env.VITE_API_BASE_KUBITQ ?? 'http://localhost:3001',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  apiBaseUrlV2: import.meta.env.VITE_API_BASE_URL_V2 ?? '/api/v2',
  apiBaseUrlV3: import.meta.env.VITE_API_BASE_URL_V3 ?? '/api/v3',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 60_000),
} as const

export const apiBase = `${env.apiBaseKubitq}/api`
export const apiV1 = `${env.apiBaseKubitq}${env.apiBaseUrl}`
export const apiV2 = `${env.apiBaseKubitq}${env.apiBaseUrlV2}`
export const apiV3 = `${env.apiBaseKubitq}${env.apiBaseUrlV3}`
