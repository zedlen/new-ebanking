import type { AccountInfo } from '@/shared/types/accounts'
import { getAccountLabel, getAccountClabe } from '@/shared/utils/transferAccount'
import { formatCurrency } from '@/shared/utils/format'
import { Button } from '@/shared/components/Button'
import { Spinner } from '@/shared/components/Spinner'
import { TableSkeleton } from '@/shared/components/TableSkeleton'

interface TransferSourceStepProps {
  accounts: AccountInfo[]
  isLoading: boolean
  selected: AccountInfo | null
  onSelect: (account: AccountInfo) => void
  onContinue: () => void
  autoSelected: boolean
}

export function TransferSourceStep({
  accounts,
  isLoading,
  selected,
  onSelect,
  onContinue,
  autoSelected,
}: TransferSourceStepProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Spinner label="Cargando cuentas…" />
        <TableSkeleton columns={3} rows={3} minWidthClass="min-w-0 w-full" />
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface-muted px-6 py-12 text-center text-neutral">
        No tienes cuentas disponibles para transferir.
      </p>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Cuenta origen</h2>
        <p className="mt-1 text-sm text-neutral">
          {autoSelected
            ? 'Se seleccionó tu única cuenta disponible.'
            : 'Elige la cuenta desde la que enviarás el dinero.'}
        </p>
      </div>

      {accounts.length === 1 && selected ? (
        <AccountCard account={selected} selected />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {accounts.map((account) => (
            <li key={account.id}>
              <button
                type="button"
                onClick={() => onSelect(account)}
                className={[
                  'w-full rounded-lg border p-4 text-left transition-colors',
                  selected?.id === account.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/40 hover:bg-surface-muted/50',
                ].join(' ')}
              >
                <AccountCard account={account} selected={selected?.id === account.id} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="flex justify-end">
        <Button type="button" disabled={!selected} onClick={onContinue}>
          Continuar
        </Button>
      </p>
    </section>
  )
}

function AccountCard({
  account,
  selected,
}: {
  account: AccountInfo
  selected?: boolean
}) {
  const clabe = getAccountClabe(account)
  return (
    <div>
      <p className="font-medium text-foreground">
        {account.alias || getAccountLabel(account)}
      </p>
      {clabe ? (
        <p className="mt-1 font-mono text-xs text-neutral">{clabe}</p>
      ) : null}
      <p className="mt-2 text-lg font-semibold text-foreground">
        {formatCurrency(account.amount, account.currency)}
      </p>
      {selected ? (
        <p className="mt-1 text-xs text-primary">Cuenta seleccionada</p>
      ) : null}
    </div>
  )
}
