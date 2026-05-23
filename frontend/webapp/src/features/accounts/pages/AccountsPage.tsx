import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { accountsService } from '@/api/services/accountsService'
import { AccountsBalanceSummary } from '@/features/accounts/components/AccountsBalanceSummary'
import { PaymentMethodsModal } from '@/features/accounts/components/PaymentMethodsModal'
import { Button } from '@/shared/components/Button'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { Pagination } from '@/shared/components/Pagination'
import { AccountsBalanceSummarySkeleton } from '@/features/accounts/components/AccountsBalanceSummarySkeleton'
import { RefetchIndicator } from '@/shared/components/RefetchIndicator'
import { paths } from '@/shared/constants/paths'
import { useAccountsStore } from '@/shared/store/accountsStore'
import type { AccountInfo } from '@/shared/types/accounts'
import { formatCurrency, formatDate } from '@/shared/utils/format'
import type { Customer } from '@/shared/types/customer'
import { getCustomerDisplayName } from '@/shared/utils/customer'
import { customersService } from '@/api/services/customersService'

const PAGE_SIZE = 10

export function AccountsPage() {
  const navigate = useNavigate()
  const { customerId, clientId } = useParams<{
    customerId?: string
    clientId?: string
  }>()
  const setCurrentAccount = useAccountsStore((s) => s.setCurrentAccount)
  
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const [customer, setCustomer] = useState<Customer | null>()
  const [selectedAccount, setSelectedAccount] = useState<AccountInfo | null>(
    null,
  )
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(false)

  const ownerId = clientId ?? customerId

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['accounts', ownerId, offset, PAGE_SIZE],
    queryFn: () =>
      clientId
        ? accountsService.listByCustomer(clientId)
        : accountsService.list(offset, PAGE_SIZE),
  })

  const filteredAccounts = useMemo(() => {
    const accounts = data?.accounts ?? []
    const term = search.trim().toLowerCase()
    if (!term) return accounts

    return accounts.filter((account) => {
      const clabe = account.clabes?.[0]
      const haystack = [
        account.external_id,
        account.id,
        clabe?.clabe,
        clabe?.account_id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [data?.accounts, search])

  const goToDetails = (account: AccountInfo) => {    
    if (!account.type || !ownerId) return
    setCurrentAccount(account)
    const accountId = account.external_id || account.id
    navigate(paths.accountDetails(ownerId, accountId))
  }

  const handleExport = async () => {
    setExporting(true)
    setExportError(false)
    const ok = await accountsService.exportAccounts()
    if (!ok) setExportError(true)
    setExporting(false)
  }

  const columns: DataTableColumn<AccountInfo>[] = [
    {
      id: 'actions',
      header: '',
      className: 'w-28',
      cell: (row) =>
        row.type ? (
          <div className="flex gap-1">
            <button
              type="button"
              title="Ver detalle"
              className="rounded-full px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
              onClick={() => goToDetails(row)}
            >
              Abrir
            </button>
            <button
              type="button"
              title="Métodos de pago"
              className="rounded-full px-2 py-1 text-xs font-medium text-neutral hover:bg-surface-muted"
              onClick={() => setSelectedAccount(row)}
            >
              CLABE
            </button>
          </div>
        ) : null,
    },
    {
      id: 'internal',
      header: 'Cuenta ZeusPay',
      cell: (row) => row.clabes?.[0]?.account_id ?? '—',
    },
    {
      id: 'clabe',
      header: 'Cuenta CLABE',
      cell: (row) => (
        <span className="font-mono text-xs">{row.clabes?.[0]?.clabe ?? '—'}</span>
      ),
    },
    {
      id: 'created',
      header: 'Fecha alta',
      cell: (row) => formatDate(row.creation_date),
    },
    {
      id: 'amount',
      header: 'Saldo',
      cell: (row) => formatCurrency(row.amount, row.currency),
    },
  ]

  const loadCustomerData = async () => {
    if(!clientId) return
    const response = await customersService.getById(clientId)
    if(response) setCustomer(response)
  }

  useEffect(()=>{loadCustomerData()},[clientId])

  const title = clientId ? `Cuentas del cliente ${getCustomerDisplayName(customer)}` : 'Mis cuentas'

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        {clientId ? (
          <Link
            to={paths.clients}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Volver a mis clientes
          </Link>
        ) : null}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">{title}</h1>
          <RefetchIndicator active={isFetching && !isLoading} />
        </div>
        {isLoading ? (
          <AccountsBalanceSummarySkeleton />
        ) : data ? (
          <AccountsBalanceSummary summary={data} />
        ) : null}
      </header>

      <section className="space-y-4 rounded-lg border border-border bg-background p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Input
              label="Buscar"
              placeholder="CLABE, cuenta, ID…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => void refetch()}>
              Actualizar
            </Button>
            {!clientId && (
              <Button
                variant="secondary"
                disabled={exporting}
                onClick={() => void handleExport()}
              >
                {exporting ? 'Exportando…' : 'Exportar'}
              </Button>
            )}
          </div>
        </div>

        {exportError && (
          <p className="text-sm text-error" role="alert">
            No se pudo exportar el archivo. Intenta de nuevo.
          </p>
        )}

        <DataTable
          columns={columns}
          data={filteredAccounts}
          getRowKey={(row) => row.id}
          emptyMessage="No se encontraron cuentas"
          isLoading={isLoading}
        />
        {!isLoading && (
          <>
            {!clientId && data && data.totalAccounts > 0 && (
              <Pagination
                offset={offset}
                limit={PAGE_SIZE}
                total={data.totalAccounts}
                onChange={setOffset}
              />
            )}
          </>
        )}
      </section>

      <Modal
        open={selectedAccount !== null}
        title="Métodos de pago"
        onClose={() => setSelectedAccount(null)}
      >
        {selectedAccount && <PaymentMethodsModal account={selectedAccount} />}
      </Modal>
    </div>
  )
}
