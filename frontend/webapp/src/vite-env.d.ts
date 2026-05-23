/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: string
  readonly VITE_APP_NAME: string
  readonly VITE_API_BASE_KUBITQ: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_BASE_URL_V2: string
  readonly VITE_API_BASE_URL_V3: string
  readonly VITE_API_TIMEOUT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
