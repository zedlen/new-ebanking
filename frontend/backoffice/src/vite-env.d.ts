/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: string;
  readonly VITE_NAME: string;
  readonly VITE_API_BASE_KUBITQ: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_BASE_URL_V2: string;
  readonly VITE_APP_ID: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_EMAIL_EDITOR_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.css" {}
