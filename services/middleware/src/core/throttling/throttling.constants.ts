/** Default global API throttle (requests per ttl window). */
export const GLOBAL_THROTTLE_TTL_MS = 60_000;
export const GLOBAL_THROTTLE_LIMIT = 300;

/** Onboarding public POST throttle (applied per-controller). */
export const ONBOARDING_POST_THROTTLE_TTL_MS = 60_000;
export const ONBOARDING_POST_THROTTLE_LIMIT = 10;

/** Stricter limit for onboarding form submission. */
export const ONBOARDING_FORM_THROTTLE_TTL_MS = 60_000;
export const ONBOARDING_FORM_THROTTLE_LIMIT = 2;
