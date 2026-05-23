import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { PaymentMethodsModal } from '@/features/accounts/components/PaymentMethodsModal'
import { MonthlyReportDownload } from '@/features/movements/components/MonthlyReportDownload'
import {
  AccountDetailsProvider,
  useAccountDetails,
} from '@/features/accounts/context/AccountDetailsContext'
import { Button } from '@/shared/components/Button'
import { Modal } from '@/shared/components/Modal'
import { AccountDetailsHeaderSkeleton } from '@/features/accounts/components/AccountDetailsHeaderSkeleton'
import { Tabs } from '@/shared/components/Tabs'
import { ACCOUNT_TYPE } from '@/shared/constants/banking'
import { paths } from '@/shared/constants/paths'
import { formatCurrency } from '@/shared/utils/format'

function AccountDetailsLayoutInner() {
  const location = useLocation()
  const {
    customerId,
    accountId,
    account,
    customer,
    isLoading,
    refetchAccount,
    customerDisplayName,
    businessId,
  } = useAccountDetails()

  const [clabeOpen, setClabeOpen] = useState(false)

  const isOverview = location.pathname === paths.accountDetails(customerId, accountId)
  const reportAccountId = account?.external_id ?? account?.id ?? accountId
  if (isLoading || !account) {
    return <AccountDetailsHeaderSkeleton />
  }

  const balanceLabel =
    account.type === 1 ? 'Monto global' : 'Monto disponible'

  return (
    <div className="space-y-0">
      <div className="mb-6">
        <Link
          to={paths.accounts(customerId)}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Volver a cuentas
        </Link>
        <h1 className="mt-2 text-xl font-semibold sm:text-2xl">Detalle de cuenta</h1>
      </div>

      <Tabs
        items={[
          {
            label: 'Resumen',
            to: paths.accountDetails(customerId, accountId),
          },
          {
            label: 'Movimientos',
            to: paths.accountMovements(customerId, accountId),
          },
        ]}
      />

      <div className="mt-6 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-2xl font-semibold text-foreground sm:text-3xl">
            {formatCurrency(account.amount, account.currency)}
          </p>
          <p className="text-sm text-neutral">{balanceLabel}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Button variant="ghost" onClick={() => refetchAccount()}>
            Actualizar saldo
          </Button>
          <Button variant="secondary" onClick={() => setClabeOpen(true)}>
            Cuenta CLABE
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <MonthlyReportDownload accountId={reportAccountId} variant="inline" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-b border-border py-4 text-sm lg:grid-cols-2">
        <p>
          <span className="text-neutral">Titular: </span>
          <span className="font-medium">{customerDisplayName}</span>
        </p>
        <p className="lg:text-right">
          <span className="text-neutral">ID empresa: </span>
          <span className="font-medium">{businessId}</span>
        </p>
      </div>

      {isOverview && (
        <div className="grid gap-6 border-b border-border py-6 lg:grid-cols-2">
          <dl className="space-y-3 text-sm">
            <DetailRow label="Alias" value={customerDisplayName} />
            <DetailRow
              label="Tipo de cuenta"
              value={ACCOUNT_TYPE[account.type] ?? '—'}
            />
            <DetailRow
              label="Cuenta CLABE"
              value={account.clabes?.[0]?.clabe ?? '—'}
            />
          </dl>
          <dl className="space-y-3 text-sm">
            <DetailRow
              label="Cuenta ZeusPay"
              value={account.clabes?.[0]?.account_id ?? '—'}
            />
            <DetailRow
              label="Tipo persona"
              value={
                customer?.taxpayer_type_id === 2 ? 'Moral' : 'Física'
              }
            />
          </dl>
        </div>
      )}

      <Outlet />

      <Modal
        open={clabeOpen}
        title="Métodos de pago"
        onClose={() => setClabeOpen(false)}
      >
        <PaymentMethodsModal account={account} />
      </Modal>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
      <dt className="text-neutral">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}

export function AccountDetailsLayout() {
  return (
    <AccountDetailsProvider>
      <AccountDetailsLayoutInner />
    </AccountDetailsProvider>
  )
}
