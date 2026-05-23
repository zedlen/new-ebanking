import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { paths } from '@/shared/constants/paths'
import { useSessionStore } from '@/shared/store/sessionStore'

interface TaxpayerTypeGuardProps {
  /** Allowed `taxpayer_type_id` values (1 = física, 2 = moral). */
  allowedTypes: number[]
  children?: ReactNode
}

function getDefaultRedirect(customerId?: string) {
  return customerId ? paths.accounts(customerId) : paths.menu
}

export function TaxpayerTypeGuard({
  allowedTypes,
  children,
}: TaxpayerTypeGuardProps) {
  const profile = useSessionStore((s) => s.profile)
  const taxpayerTypeId = profile?.taxpayer_type_id

  if (taxpayerTypeId == null) {
    return <Navigate to={paths.login} replace />
  }

  if (!allowedTypes.includes(taxpayerTypeId)) {
    return <Navigate to={getDefaultRedirect(profile?.customer_id)} replace />
  }

  if (children) {
    return <>{children}</>
  }

  return <Outlet />
}
