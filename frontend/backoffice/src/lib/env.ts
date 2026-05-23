const {
  VITE_ENV,
  VITE_NAME,
  VITE_API_BASE_KUBITQ,
  VITE_API_BASE_URL,
  VITE_API_BASE_URL_V2,
  VITE_APP_ID,
  VITE_API_TIMEOUT,
  VITE_EMAIL_EDITOR_PROJECT_ID,
} = import.meta.env;

export const env = {
  env: VITE_ENV ?? "development",
  appName: VITE_NAME ?? "zeuspay",
  baseUrl: `${VITE_API_BASE_KUBITQ ?? ""}${VITE_API_BASE_URL ?? ""}`,
  baseUrlV2: `${VITE_API_BASE_KUBITQ ?? ""}${VITE_API_BASE_URL_V2 ?? ""}`,
  appId: VITE_APP_ID ?? "zeuspay",
  apiTimeout: Number(VITE_API_TIMEOUT ?? 500000),
  emailEditorProjectId: VITE_EMAIL_EDITOR_PROJECT_ID ?? "",
} as const;
