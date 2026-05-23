import { useRef, useState } from 'react'
import { transfersService } from '@/api/services/transfersService'
import { OtpModal } from '@/features/transfers/components/OtpModal'
import { TransferAlert } from '@/features/transfers/components/TransferAlert'
import { Button } from '@/shared/components/Button'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { Modal } from '@/shared/components/Modal'
import type { AccountInfo } from '@/shared/types/accounts'
import type { BulkTransferPreviewRow } from '@/shared/types/transfers'
import { getAccountClabe, getSpeiAccountId } from '@/shared/utils/transferAccount'
import { formatCurrency } from '@/shared/utils/format'

const TEMPLATE_URL =
  'https://cdn.ebanking-service.net/speiout_template.xlsx'

const specColumns: DataTableColumn<{
  name: string
  dataType: string
  example: string
}>[] = [
  { id: 'name', header: 'Campo', cell: (row) => row.name },
  { id: 'type', header: 'Tipo', cell: (row) => row.dataType },
  { id: 'example', header: 'Ejemplo', cell: (row) => row.example },
]

const templateSpecs = [
  { name: 'Cuenta destino', dataType: 'Texto', example: '012180001234567890' },
  { name: 'Concepto', dataType: 'Texto', example: 'Transferencia propia' },
  { name: 'Monto', dataType: 'Decimal', example: '100.00' },
  { name: 'Nombre beneficiario', dataType: 'Texto', example: 'John Doe' },
  { name: 'RFC', dataType: 'Texto', example: 'XAXX010101000' },
  { name: 'EMAIL', dataType: 'Texto', example: 'prueba@gmail.com' },
  { name: 'Referencia', dataType: 'Numérico', example: '2025004' },
]

const previewColumns: DataTableColumn<BulkTransferPreviewRow>[] = [
  { id: 'line', header: 'Línea', cell: (row) => row.line },
  {
    id: 'account',
    header: 'Cuenta destino',
    cell: (row) => row.beneficiary_account,
  },
  { id: 'name', header: 'Beneficiario', cell: (row) => row.beneficiary_name },
  { id: 'concept', header: 'Concepto', cell: (row) => row.concept },
  {
    id: 'amount',
    header: 'Monto',
    cell: (row) => formatCurrency(row.amount),
  },
]

function bulkErrorMessage(
  code: number,
  detail?: { line?: number; field?: string; message?: string },
): string {
  if (code === 200) {
    return 'Las transacciones se guardaron. Revísalas en Pendientes para aprobarlas.'
  }
  if (code === 400) {
    return 'Verifica el formato del archivo; puede contener espacios en blanco.'
  }
  if (code === 403) {
    return 'El código OTP es incorrecto. Inténtalo de nuevo.'
  }
  if (detail?.message?.includes('parsing decimal')) {
    return 'El monto debe ser numérico con dos decimales separados por punto (ej. 1000.00).'
  }
  if (detail?.line && detail.field) {
    return `Error en la línea ${detail.line}, campo ${detail.field}: ${detail.message}`
  }
  return 'No se concretó la operación. Inténtalo de nuevo.'
}

interface BulkTransferModalProps {
  open: boolean
  sourceAccount: AccountInfo | null
  onClose: () => void
}

export function BulkTransferModal({
  open,
  sourceAccount,
  onClose,
}: BulkTransferModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewRows, setPreviewRows] = useState<BulkTransferPreviewRow[] | null>(
    null,
  )
  const [previewLoading, setPreviewLoading] = useState(false)
  const [otpOpen, setOtpOpen] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [alert, setAlert] = useState<{
    type: 'error' | 'success'
    title: string
    message?: string
  } | null>(null)

  const reset = () => {
    setFile(null)
    setPreviewRows(null)
    setPreviewLoading(false)
    setOtpOpen(false)
    setAlert(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleFile = async (next: File | null) => {
    setFile(next)
    setPreviewRows(null)
    setAlert(null)
    if (!next) return

    setPreviewLoading(true)
    try {
      const rows = await transfersService.previewBulkTransfer(next)
      setPreviewRows(rows)
    } catch {
      setAlert({
        type: 'error',
        title: 'Error al leer archivo',
        message: 'No se pudo procesar el archivo. Intenta de nuevo.',
      })
    } finally {
      setPreviewLoading(false)
    }
  }

  const submitBulk = async (otp: string) => {
    setOtpOpen(false)
    if (!file || !sourceAccount) return

    const payerClabe = getAccountClabe(sourceAccount)
    const accountId = getSpeiAccountId(sourceAccount)

    const formData = new FormData()
    formData.append('template', file)
    formData.append('payerAccount', payerClabe)
    formData.append('account_id', accountId)

    setSubmitLoading(true)
    const result = await transfersService.sendTransferMassive(formData, otp)
    setSubmitLoading(false)

    const detail = result.data as
      | { detail?: { line?: number; field?: string; message?: string } }
      | undefined

    if (result.code === 200) {
      handleClose()
    }

    setAlert({
      type: result.code === 200 ? 'success' : 'error',
      title: result.code === 200 ? 'Archivo procesado' : 'Error en la operación',
      message: bulkErrorMessage(result.code, detail?.detail),
    })
  }

  return (
    <>
      <Modal open={open} title="Transferencia masiva" onClose={handleClose}>
        <div className="space-y-6">
          {alert ? (
            <TransferAlert
              type={alert.type}
              title={alert.title}
              message={alert.message}
              onDismiss={() => setAlert(null)}
            />
          ) : null}

          {!sourceAccount ? (
            <p className="text-sm text-error" role="alert">
              Selecciona una cuenta origen en el paso 1 antes de cargar un archivo masivo.
            </p>
          ) : (
            <p className="text-sm text-neutral">
              Cuenta origen:{' '}
              <span className="font-medium text-foreground">
                {getAccountClabe(sourceAccount) || sourceAccount.id}
              </span>
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                window.open(TEMPLATE_URL, '_blank', 'noopener,noreferrer')
              }
            >
              Descargar plantilla
            </Button>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-muted/50 px-4 py-10 text-center sm:px-6">
            <span className="text-sm font-medium text-foreground">
              {previewLoading
                ? 'Leyendo archivo…'
                : 'Arrastra o selecciona tu archivo .xlsx'}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              disabled={previewLoading || submitLoading || !sourceAccount}
              onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
            />
          </label>

          {previewRows ? (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Vista previa ({previewRows.length} filas)
              </h3>
              <DataTable
                columns={previewColumns}
                data={previewRows}
                getRowKey={(row) => String(row.line)}
                skeletonRows={3}
              />
              <p className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setPreviewRows(null)
                    setFile(null)
                    if (inputRef.current) inputRef.current.value = ''
                  }}
                >
                  Cambiar archivo
                </Button>
                <Button
                  type="button"
                  disabled={!sourceAccount || submitLoading}
                  onClick={() => setOtpOpen(true)}
                >
                  Continuar
                </Button>
              </p>
            </section>
          ) : null}

          <details className="rounded-lg border border-border">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-foreground">
              Especificaciones de la plantilla
            </summary>
            <div className="border-t border-border p-4">
              <DataTable
                columns={specColumns}
                data={templateSpecs}
                getRowKey={(row) => row.name}
              />
            </div>
          </details>
        </div>
      </Modal>

      <OtpModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        loading={submitLoading}
        onSubmit={submitBulk}
      />
    </>
  )
}
