import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { movementsService } from '@/api/services/movementsService'
import { useAccountDetails } from '@/features/accounts/context/AccountDetailsContext'
import { Badge } from '@/shared/components/Badge'
import { movementStatusTone } from '@/shared/utils/movementStatus'
import { Button } from '@/shared/components/Button'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { Input } from '@/shared/components/Input'
import { Pagination } from '@/shared/components/Pagination'
import { RefetchIndicator } from '@/shared/components/RefetchIndicator'
import { MonthlyReportDownload } from '@/features/movements/components/MonthlyReportDownload'
import { MOVEMENTS_TYPE, MOVEMENT_STATUS } from '@/shared/constants/banking'
import type { Movement } from '@/shared/types/movements'
import { buildMovementDateFilters } from '@/shared/utils/dates'
import { formatCurrency, formatDate } from '@/shared/utils/format'

const PAGE_SIZE = 6

export function AccountMovementsPage() {
  const { customerId, accountId, account } = useAccountDetails()
  const [page, setPage] = useState(1)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '',
    endDate: '',
  })
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState(false)

  const reportAccountId = account?.external_id ?? account?.id ?? accountId

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: [
      'movements-paged',
      accountId,
      page,
      appliedFilters.startDate,
      appliedFilters.endDate,
    ],
    queryFn: () =>
      movementsService.getPaged({
        accountId,
        limit: PAGE_SIZE,
        page,
        startDate: appliedFilters.startDate || undefined,
        endDate: appliedFilters.endDate || undefined,
      }),
    enabled: Boolean(accountId),
  })

  const openCep = async (movementId: string) => {
    const url = await movementsService.getCep(movementId)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const downloadBoucher = async (movementId: string) => {
    await movementsService.downloadBoucher(customerId, movementId)
  }

  const downloadReport = async () => {
    if (!account) return
    setDownloading(true)
    setDownloadError(false)
    const query = buildMovementDateFilters(
      appliedFilters.startDate || undefined,
      appliedFilters.endDate || undefined,
    ).replace(/^&/, '')
    const ok = await movementsService.downloadMovementsReport(
      reportAccountId,
      query,
    )
    if (!ok) setDownloadError(true)
    setDownloading(false)
  }

  const columns: DataTableColumn<Movement>[] = [
    {
      id: 'actions',
      header: '',
      className: 'w-28',
      cell: (row) => (
        <div className="flex gap-1">
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => void openCep(row.id)}
          >
            CEP
          </button>
          <button
            type="button"
            className="text-xs font-medium text-neutral hover:underline"
            onClick={() => void downloadBoucher(row.id)}
          >
            PDF
          </button>
        </div>
      ),
    },
    {
      id: 'tracking',
      header: 'Clave rastreo',
      cell: (row) => (
        <span className="break-all">{row.tracking_key || row.folio || '—'}</span>
      ),
    },
    {
      id: 'account',
      header: 'Cuenta',
      cell: (row) => row.account_id,
    },
    {
      id: 'type',
      header: 'Medio pago',
      cell: (row) => MOVEMENTS_TYPE[row.type] ?? String(row.type),
    },
    {
      id: 'date',
      header: 'Fecha operación',
      cell: (row) => formatDate(row.operation_date),
    },
    {
      id: 'concept',
      header: 'Concepto',
      cell: (row) => row.payment_purpose || '—',
    },
    {
      id: 'amount',
      header: 'Monto',
      cell: (row) => formatCurrency(row.amount, account?.currency),
    },
    {
      id: 'status',
      header: 'Estatus',
      cell: (row) => (
        <Badge
          label={MOVEMENT_STATUS[row.status] ?? row.status}
          tone={movementStatusTone(row.status)}
        />
      ),
    },
  ]

  const offset = (page - 1) * PAGE_SIZE

  return (
    <section className="mt-6 space-y-4">
      <MonthlyReportDownload accountId={reportAccountId} variant="card" />

      <article className="space-y-4 rounded-lg border border-border bg-surface-muted/40 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="text-lg font-semibold">Movimientos</h2>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => void refetch()}>
            Actualizar
          </Button>
          <Button
            variant="secondary"
            disabled={downloading}
            onClick={() => void downloadReport()}
          >
            {downloading ? 'Descargando…' : 'Exportar Excel'}
          </Button>
        </div>
      </div>

      {downloadError ? (
        <p className="text-sm text-error" role="alert">
          No se pudo descargar el reporte del período seleccionado.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3 lg:items-end">
        <Input
          label="Fecha inicio"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          label="Fecha fin"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Button
          onClick={() => {
            setPage(1)
            setAppliedFilters({ startDate, endDate })
          }}
        >
          Aplicar filtros
        </Button>
      </div>

      <RefetchIndicator active={isFetching && !isLoading} />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        getRowKey={(row) => row.id}
        emptyMessage="No tienes movimientos en la cuenta"
        isLoading={isLoading}
      />
      {!isLoading && (data?.total ?? 0) > 0 && (
        <Pagination
          offset={offset}
          limit={PAGE_SIZE}
          total={data?.total ?? 0}
          onChange={(newOffset) => setPage(newOffset / PAGE_SIZE + 1)}
        />
      )}
      </article>
    </section>
  )
}
