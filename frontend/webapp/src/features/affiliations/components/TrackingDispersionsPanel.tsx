import { useEffect, useState } from 'react'
import { transfersService } from '@/api/services/transfersService'
import { Badge } from '@/shared/components/Badge'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { PENDING_STATUS, type PendingTransfer } from '@/shared/types/transfers'
import { formatCurrency } from '@/shared/utils/format'

export function TrackingDispersionsPanel() {
  const [rows, setRows] = useState<PendingTransfer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [success, error] = await Promise.all([
        transfersService.getPendingDispersions(PENDING_STATUS.SUCCESS),
        transfersService.getPendingDispersions(PENDING_STATUS.ERROR),
      ])
      setRows([
        ...success.map((item) => ({ ...item, status: 'Éxito' })),
        ...error.map((item) => ({ ...item, status: 'Error' })),
      ])
      setLoading(false)
    }
    void load()
  }, [])

  const columns: DataTableColumn<PendingTransfer>[] = [
    { id: 'id', header: 'Folio', cell: (row) => row.id },
    {
      id: 'status',
      header: 'Estatus',
      cell: (row) => (
        <Badge
          label={row.status ?? '—'}
          tone={row.status === 'Éxito' ? 'success' : 'error'}
        />
      ),
    },
    { id: 'payment_method', header: 'Medio pago', cell: (row) => row.payment_method ?? '—' },
    { id: 'amount', header: 'Monto', cell: (row) => formatCurrency(row.amount) },
    {
      id: 'comision',
      header: 'Comisión',
      cell: (row) => formatCurrency(row.comision),
    },
    {
      id: 'total',
      header: 'Monto total',
      cell: (row) => formatCurrency(row.total_amount),
    },
    { id: 'concept', header: 'Concepto', cell: (row) => row.concept },
    {
      id: 'beneficiary_account',
      header: 'Cuenta beneficiario',
      cell: (row) => row.beneficiary_account,
    },
  ]

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-foreground">
          Seguimiento de dispersiones
        </h2>
        <p className="text-sm text-neutral">
          Dispersiones procesadas con éxito o con error.
        </p>
      </header>

      <DataTable
        columns={columns}
        data={rows}
        getRowKey={(row) => `${row.status}-${row.id}`}
        emptyMessage="No hay dispersiones en seguimiento"
        isLoading={loading}
      />
    </section>
  )
}
