import { useCallback, useEffect, useState } from 'react'
import { transfersService } from '@/api/services/transfersService'
import { OtpModal } from '@/features/transfers/components/OtpModal'
import { TransferAlert } from '@/features/transfers/components/TransferAlert'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { PENDING_STATUS, type PendingTransfer } from '@/shared/types/transfers'
import { formatCurrency } from '@/shared/utils/format'

function statusTone(status?: string): 'warning' | 'success' | 'error' | 'neutral' {
  const normalized = (status ?? '').toLowerCase()
  if (normalized.includes('error') || normalized.includes('rechaz')) return 'error'
  if (normalized.includes('éxito') || normalized.includes('exito')) return 'success'
  return 'warning'
}

interface PendingTransfersPanelProps {
  currency?: string
}

export function PendingTransfersPanel({ currency = 'MXN' }: PendingTransfersPanelProps) {
  const [rows, setRows] = useState<PendingTransfer[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [otpOpen, setOtpOpen] = useState(false)
  const [approveIds, setApproveIds] = useState<string[]>([])
  const [alert, setAlert] = useState<{
    type: 'error' | 'success'
    title: string
    message?: string
  } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await transfersService.getPendingTransfers(PENDING_STATUS.PENDING)
    setRows(
      data.map((item) => ({
        ...item,
        status: item.status ?? 'Pendiente',
        payment_method: item.payment_method ?? 'SPEI',
      })),
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id),
    )
  }

  const openApprove = (ids: string[]) => {
    setApproveIds(ids)
    setOtpOpen(true)
  }

  const approve = async (otp: string) => {
    setOtpOpen(false)
    const ids = approveIds.length ? approveIds : selectedIds
    if (!ids.length) return

    const result = await transfersService.approvePendingTransfers(ids, otp)
    if (result.code === 200) {
      setAlert({
        type: 'success',
        title:
          ids.length === 1
            ? 'Transacción procesada con éxito'
            : 'Transacciones procesadas con éxito',
      })
      setSelectedIds([])
      setApproveIds([])
      void load()
      return
    }

    setAlert({
      type: 'error',
      title: 'Error en la operación',
      message:
        'No se concretó la operación. Verifica el código e inténtalo de nuevo.',
    })
  }

  const columns: DataTableColumn<PendingTransfer>[] = [
    {
      id: 'select',
      header: '',
      className: 'w-10',
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={(event) => toggleRow(row.id, event.target.checked)}
          aria-label={`Seleccionar ${row.id}`}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: (row) => (
        <Button
          type="button"
          variant="ghost"
          onClick={() => openApprove([row.id])}
        >
          Aprobar
        </Button>
      ),
    },
    { id: 'id', header: 'Folio', cell: (row) => row.id },
    {
      id: 'status',
      header: 'Estatus',
      cell: (row) => (
        <Badge label={row.status ?? 'Pendiente'} tone={statusTone(row.status)} />
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
      {alert ? (
        <TransferAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onDismiss={() => setAlert(null)}
        />
      ) : null}

      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <section>
          <h3 className="text-base font-semibold text-foreground">
            Transferencias pendientes
          </h3>
          <p className="text-sm text-neutral">
            Selecciona transferencias para aprobarlas con OTP.
          </p>
        </section>
        <Button
          type="button"
          disabled={!selectedIds.length}
          onClick={() => openApprove(selectedIds)}
        >
          {selectedIds.length
            ? `Aprobar (${selectedIds.length})`
            : 'Aprobar seleccionadas'}
        </Button>
      </header>

      <DataTable
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        emptyMessage="No tienes transferencias pendientes"
        isLoading={loading}
      />

      <OtpModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onSubmit={approve}
      />
    </section>
  )
}
