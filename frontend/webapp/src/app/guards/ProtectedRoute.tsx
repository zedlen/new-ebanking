import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '@/shared/components/Spinner'
import { paths } from '@/shared/constants/paths'
import { useSessionStore, selectIsAuthenticated } from '@/shared/store/sessionStore'

export function ProtectedRoute() {
  const location = useLocation()
  const isHydrated = useSessionStore((s) => s.isHydrated)
  const isAuthenticated = useSessionStore(selectIsAuthenticated)

  if (!isHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.login} state={{ from: location }} replace />
  }

  return <Outlet />
}
