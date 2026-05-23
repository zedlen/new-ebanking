import { create } from "zustand";
import {
  clearSession,
  persistSession,
  readStoredSession,
} from "@/features/auth/session";
import type { AuthSession } from "@/types/auth";

interface AuthState {
  session: AuthSession | null;
  hydrated: boolean;
  setSession: (session: AuthSession) => void;
  clear: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  hydrated: false,
  setSession: (session) => {
    persistSession(session);
    set({ session, hydrated: true });
  },
  clear: () => {
    clearSession();
    set({ session: null, hydrated: true });
  },
  hydrate: () => {
    const stored = readStoredSession();
    set({ session: stored, hydrated: true });
  },
}));

export function useIsAuthenticated(): boolean {
  return useAuthStore((s) => Boolean(s.session?.token));
}
