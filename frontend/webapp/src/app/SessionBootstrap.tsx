import { useEffect } from 'react'
import { authService } from '@/api/services/authService'
import { useSessionStore } from '@/shared/store/sessionStore'

/** Restores session from HttpOnly cookie via `GET /auth/me` on app load. */
export function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const setSession = useSessionStore((s) => s.setSession)
  const clearSession = useSessionStore((s) => s.clearSession)
  const setHydrated = useSessionStore((s) => s.setHydrated)

  useEffect(() => {
    let cancelled = false

    const hydrate = async () => {
      const profile = await authService.getCurrentUser()
      if (cancelled) return

      if (profile) {
        setSession({ profile })
      } else {
        clearSession()
      }
      setHydrated(true)
    }

    void hydrate()

    return () => {
      cancelled = true
    }
  }, [setSession, clearSession, setHydrated])

  return <>{children}</>
}
