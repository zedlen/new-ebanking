import { Navigate, useParams } from 'react-router-dom'
import { paths } from '@/shared/constants/paths'

/** Legacy account-detail transfers URL → new transfers wizard. */
export function RedirectAccountTransfers() {
  const { accountId } = useParams<{ accountId: string }>()
  const target = accountId
    ? `${paths.transfers}?fromAccount=${encodeURIComponent(accountId)}`
    : paths.transfers
  return <Navigate to={target} replace />
}
