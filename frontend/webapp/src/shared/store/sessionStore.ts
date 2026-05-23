import { create } from 'zustand'
import type { UserProfile } from '@/shared/types/user'

interface SessionState {
  profile: UserProfile | null
  /** Bearer token from login — memory only, sent until cookie session is used. */
  token: string
  /** AES key envelope from login — kept in memory for card payload decrypt. */
  encryptionKey: string
  /** RSA private key (base64) — memory only, never persisted. */
  privateKey: string
  isHydrated: boolean
  setSession: (payload: {
    profile: UserProfile
    token?: string
    encryptionKey?: string
    privateKey?: string
  }) => void
  updateProfile: (profile: UserProfile) => void
  clearSession: () => void
  setHydrated: (value: boolean) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  profile: null,
  token: '',
  encryptionKey: '',
  privateKey: '',
  isHydrated: false,
  setSession: ({ profile, token = '', encryptionKey = '', privateKey = '' }) =>
    set({ profile, token, encryptionKey, privateKey }),
  updateProfile: (profile) => set({ profile }),
  clearSession: () =>
    set({ profile: null, token: '', encryptionKey: '', privateKey: '' }),
  setHydrated: (isHydrated) => set({ isHydrated }),
}))

export const selectIsAuthenticated = (state: SessionState) =>
  Boolean(state.profile?.customer_id)
