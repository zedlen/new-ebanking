import {
  SESSION_CUSTOMER_KEY,
  SESSION_PROFILE_KEY,
  SESSION_TOKEN_KEY,
} from "@/lib/constants";
import type { AuthSession, UserProfile } from "@/types/auth";

export function getAccessToken(): string | null {
  return sessionStorage.getItem(SESSION_TOKEN_KEY);
}

export function readStoredSession(): AuthSession | null {
  const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
  const customerId = sessionStorage.getItem(SESSION_CUSTOMER_KEY);
  const profileRaw = sessionStorage.getItem(SESSION_PROFILE_KEY);

  if (!token || !customerId || !profileRaw) return null;

  try {
    const profile = JSON.parse(profileRaw) as UserProfile;
    return { token, profile };
  } catch {
    return null;
  }
}

export function persistSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_TOKEN_KEY, session.token);
  sessionStorage.setItem(SESSION_CUSTOMER_KEY, session.profile.customer_id);
  sessionStorage.setItem(SESSION_PROFILE_KEY, JSON.stringify(session.profile));
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_CUSTOMER_KEY);
  sessionStorage.removeItem(SESSION_PROFILE_KEY);
}
