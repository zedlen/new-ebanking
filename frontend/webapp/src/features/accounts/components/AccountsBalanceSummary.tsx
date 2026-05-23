import type { AccountsListResponse } from '@/shared/types/accounts'
import { formatCurrency } from '@/shared/utils/format'

interface AccountsBalanceSummaryProps {
  summary: AccountsListResponse
}

export function AccountsBalanceSummary({ summary }: AccountsBalanceSummaryProps) {
  const currency = summary.currency || 'MXN'
  const hasNested = summary.totalNestedAccounts > 0

  if (!hasNested) {
    return (
      <div className="rounded-lg border border-border bg-surface-muted px-6 py-4">
        <p className="text-xl font-semibold text-foreground sm:text-2xl">
          {formatCurrency(summary.accountsBalance, currency)}
        </p>
        <p className="mt-1 text-sm text-neutral">Monto disponible</p>
      </div>
    )
  }

  const totalBalance = summary.accountsBalance + summary.nestedAccountsBalance

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
      <BalanceCard
        amount={formatCurrency(totalBalance, currency)}
        label="Balance acumulado"
      />
      <BalanceCard
        amount={formatCurrency(summary.accountsBalance, currency)}
        label={`Cuentas · ${summary.totalAccounts}`}
      />
      <BalanceCard
        amount={formatCurrency(summary.nestedAccountsBalance, currency)}
        label={`Subcuentas · ${summary.totalNestedAccounts}`}
      />
    </div>
  )
}

function BalanceCard({ amount, label }: { amount: string; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted px-6 py-4 lg:border-l lg:first:border-l-0">
      <p className="text-xl font-semibold text-foreground sm:text-2xl">{amount}</p>
      <p className="mt-1 text-sm text-neutral">{label}</p>
    </div>
  )
}
