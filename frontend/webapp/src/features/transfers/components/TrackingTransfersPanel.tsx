import { useEffect, useState } from 'react'
import { transfersService } from '@/api/services/transfersService'
import { Badge } from '@/shared/components/Badge'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { PENDING_STATUS, type PendingTransfer } from '@/shared/types/transfers'
import { formatCurrency } from '@/shared/utils/format'

interface TrackingTransfersPanelProps {
  currency?: string
}

export function TrackingTransfersPanel({ currency = 'MXN' }: TrackingTransfersPanelProps) {
  const [rows, setRows] = useState<PendingTransfer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [success, error] = await Promise.all([
        transfersService.getPendingTransfers(PENDING_STATUS.SUCCESS),
        transfersService.getPendingTransfers(PENDING_STATUS.ERROR),
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
    {
      id: 'payment_method',
      header: 'Medio pago',
      cell: (row) => row.payment_method ?? 'SPEI',
    },
    {
      id: 'amount',
      header: 'Monto',
      cell: (row) => formatCurrency(row.amount, currency),
    },
    {
      id: 'comision',
      header: 'Comisión',
      cell: (row) => formatCurrency(row.comision, currency),
    },
    {
      id: 'total',
      header: 'Monto total',
      cell: (row) => formatCurrency(row.total_amount, currency),
    },
    { id: 'concept', header: 'Concepto', cell: (row) => row.concept },
    {
      id: 'beneficiary_account',
      header: 'Cuenta beneficiario',
      cell: (row) => row.beneficiary_account,
    },
  ]

  return (
    <section>
      <header className="mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Seguimiento de transferencias
        </h3>
        <p className="text-sm text-neutral">
          Transferencias procesadas con éxito o con error.
        </p>
      </header>

      <DataTable
        columns={columns}
        data={rows}
        getRowKey={(row) => `${row.status}-${row.id}`}
        emptyMessage="No hay transferencias en seguimiento"
        isLoading={loading}
      />
    </section>
  )
}
