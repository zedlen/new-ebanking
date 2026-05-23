import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BulkTransferModal } from '@/features/transfers/components/BulkTransferModal'
import { TransferWizard } from '@/features/transfers/components/wizard/TransferWizard'
import { useUserAccounts } from '@/features/transfers/hooks/useUserAccounts'
import { Button } from '@/shared/components/Button'
import { paths } from '@/shared/constants/paths'
import type { AccountInfo } from '@/shared/types/accounts'

export function TransfersPage() {
  const [bulkOpen, setBulkOpen] = useState(false)
  const [sourceAccount, setSourceAccount] = useState<AccountInfo | null>(null)
  const accountsQuery = useUserAccounts()

  useEffect(() => {
    const accounts = accountsQuery.data ?? []
    if (accounts.length === 1 && !sourceAccount) {
      setSourceAccount(accounts[0])
    }
  }, [accountsQuery.data, sourceAccount])

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            Transferencias
          </h1>
          <p className="mt-1 text-sm text-neutral">
            Envía dinero a otras cuentas por SPEI o traspaso interno.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => setBulkOpen(true)}>
            Transferencia masiva
          </Button>
          <Link to={paths.transfersBulkHistory}>
            <Button type="button" variant="ghost">
              Historial de cargas
            </Button>
          </Link>
        </div>
      </header>

      <TransferWizard onSourceAccountChange={setSourceAccount} />

      <BulkTransferModal
        open={bulkOpen}
        sourceAccount={sourceAccount}
        onClose={() => setBulkOpen(false)}
      />
    </section>
  )
}
