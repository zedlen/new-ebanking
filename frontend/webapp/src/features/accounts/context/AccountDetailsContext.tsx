import { useQuery } from '@tanstack/react-query'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { accountsService } from '@/api/services/accountsService'
import { customersService } from '@/api/services/customersService'
import type { AccountInfo } from '@/shared/types/accounts'
import type { Customer } from '@/shared/types/customer'
import { TAXPAYER_TYPE } from '@/shared/constants/banking'

interface AccountDetailsContextValue {
  customerId: string
  accountId: string
  account: AccountInfo | null
  customer: Customer | null
  isLoading: boolean
  refetchAccount: () => void
  customerDisplayName: string
  businessId: string
}

const AccountDetailsContext = createContext<AccountDetailsContextValue | null>(
  null,
)

function buildCustomerName(customer: Customer | null): string {
  if (!customer) return '—'
  if (customer.taxpayer_type_id === 2) {
    return customer.company_name || customer.contact_name || '—'
  }
  const fullName = [customer.name, customer.ap_paterno, customer.ap_materno]
    .filter(Boolean)
    .join(' ')
    .trim()
  return fullName || customer.company_name || customer.contact_name || '—'
}

function buildBusinessId(customer: Customer | null): string {
  if (!customer) return '—'
  if (customer.taxpayer_type_id === 2) {
    return customer.affiliation_code ?? customer.id ?? '—'
  }
  return customer.affiliation_code ?? customer.parent_id ?? customer.id ?? '—'
}

export function AccountDetailsProvider({ children }: { children: ReactNode }) {
  const { customerId = '', accountId = '' } = useParams<{
    customerId: string
    accountId: string
  }>()

  const accountQuery = useQuery({
    queryKey: ['account', accountId],
    queryFn: () => accountsService.getById(accountId),
    enabled: Boolean(accountId),
  })

  const customerQuery = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customersService.getById(customerId),
    enabled: Boolean(customerId),
  })

  const value = useMemo<AccountDetailsContextValue>(
    () => ({
      customerId,
      accountId,
      account: accountQuery.data ?? null,
      customer: customerQuery.data ?? null,
      isLoading: accountQuery.isLoading || customerQuery.isLoading,
      refetchAccount: () => void accountQuery.refetch(),
      customerDisplayName: buildCustomerName(customerQuery.data ?? null),
      businessId: buildBusinessId(customerQuery.data ?? null),
    }),
    [
      customerId,
      accountId,
      accountQuery.data,
      customerQuery.data,
      accountQuery.isLoading,
      customerQuery.isLoading,
      accountQuery.refetch,
    ],
  )

  return (
    <AccountDetailsContext.Provider value={value}>
      {children}
    </AccountDetailsContext.Provider>
  )
}

export function useAccountDetails() {
  const ctx = useContext(AccountDetailsContext)
  if (!ctx) {
    throw new Error('useAccountDetails must be used within AccountDetailsProvider')
  }
  return ctx
}

export function getTaxpayerLabel(taxpayerTypeId?: number) {
  return TAXPAYER_TYPE[taxpayerTypeId ?? 0] ?? '—'
}
