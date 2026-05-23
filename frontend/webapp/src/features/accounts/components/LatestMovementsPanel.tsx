import { useQuery } from '@tanstack/react-query'
import { movementsService } from '@/api/services/movementsService'
import { useAccountDetails } from '@/features/accounts/context/AccountDetailsContext'
import { Badge } from '@/shared/components/Badge'
import { movementStatusTone } from '@/shared/utils/movementStatus'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { MOVEMENTS_TYPE, MOVEMENT_STATUS } from '@/shared/constants/banking'
import type { Movement } from '@/shared/types/movements'
import { formatCurrency, formatDate } from '@/shared/utils/format'

export function LatestMovementsPanel() {
  const { accountId, account } = useAccountDetails()

  const { data = [], isLoading } = useQuery({
    queryKey: ['movements-latest', accountId],
    queryFn: () => movementsService.getLatest(accountId),
    enabled: Boolean(accountId),
  })

  const columns: DataTableColumn<Movement>[] = [
    {
      id: 'tracking',
      header: 'Clave rastreo',
      cell: (row) => row.tracking_key || row.folio || '—',
    },
    {
      id: 'type',
      header: 'Medio pago',
      cell: (row) => MOVEMENTS_TYPE[row.type] ?? String(row.type),
    },
    {
      id: 'date',
      header: 'Fecha',
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

  return (
    <section className="mt-6">
      <h2 className="mb-4 text-lg font-semibold">Últimos movimientos</h2>
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(row) => row.id}
        emptyMessage="No hay movimientos recientes"
        isLoading={isLoading}
        skeletonRows={4}
      />
    </section>
  )
}
