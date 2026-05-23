import { useRef, useState } from 'react'
import { transfersService } from '@/api/services/transfersService'
import { useAccountDetails } from '@/features/accounts/context/AccountDetailsContext'
import { OtpModal } from '@/features/transfers/components/OtpModal'
import { TransferAlert } from '@/features/transfers/components/TransferAlert'
import { Button } from '@/shared/components/Button'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'

const TEMPLATE_URL =
  'https://cdn.ebanking-service.net/speiout_template.xlsx'

const specifications: {
  name: string
  dataType: string
  example: string
  description: string
}[] = [
  {
    name: 'Cuenta destino',
    dataType: 'Texto',
    example: '012180001234567890',
    description: 'CLABE o número de cuenta destino.',
  },
  {
    name: 'Concepto',
    dataType: 'Texto',
    example: 'Transferencia propia',
    description: 'Concepto de la dispersión.',
  },
  {
    name: 'Monto',
    dataType: 'Decimal',
    example: '100.00',
    description: 'Monto a dispersar (dos decimales, punto decimal).',
  },
  {
    name: 'Nombre beneficiario',
    dataType: 'Texto',
    example: 'John Doe',
    description: 'Nombre del beneficiario.',
  },
  {
    name: 'RFC',
    dataType: 'Texto',
    example: 'XAXX010101000',
    description: 'RFC del beneficiario.',
  },
  {
    name: 'EMAIL',
    dataType: 'Texto',
    example: 'prueba@gmail.com',
    description: 'Correo del beneficiario.',
  },
  {
    name: 'Referencia',
    dataType: 'Numérico',
    example: '2025004',
    description: 'Referencia numérica (máx. 7 dígitos).',
  },
]

const specColumns: DataTableColumn<(typeof specifications)[number]>[] = [
  { id: 'name', header: 'Campo', cell: (row) => row.name },
  { id: 'dataType', header: 'Tipo', cell: (row) => row.dataType },
  { id: 'example', header: 'Ejemplo', cell: (row) => row.example },
  { id: 'description', header: 'Descripción', cell: (row) => row.description },
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

export function BulkTransferPanel() {
  const { account } = useAccountDetails()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [otpOpen, setOtpOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{
    type: 'error' | 'success'
    title: string
    message?: string
  } | null>(null)

  const payerClabe = account?.clabes?.[0]?.clabe ?? ''
  const accountId = account?.id ?? ''

  const onFileChange = (next: File | null) => {
    setFile(next)
    if (next) setOtpOpen(true)
  }

  const submitBulk = async (otp: string) => {
    setOtpOpen(false)
    if (!file || !payerClabe) return

    const formData = new FormData()
    formData.append('template', file)
    formData.append('payerAccount', payerClabe)
    formData.append('account_id', accountId)

    setLoading(true)
    const result = await transfersService.sendTransferMassive(formData, otp)
    setLoading(false)
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''

    const detail = result.data as
      | { detail?: { line?: number; field?: string; message?: string } }
      | undefined

    setAlert({
      type: result.code === 200 ? 'success' : 'error',
      title: result.code === 200 ? 'Archivo procesado' : 'Error en la operación',
      message: bulkErrorMessage(result.code, detail?.detail),
    })
  }

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
            Transferencias masivas
          </h3>
          <p className="text-sm text-neutral">
            Sube la plantilla Excel (.xlsx) para registrar transferencias en lote.
          </p>
        </section>
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.open(TEMPLATE_URL, '_blank', 'noopener,noreferrer')}
        >
          Descargar plantilla
        </Button>
      </header>

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-muted/50 px-6 py-12 text-center">
        <span className="text-sm font-medium text-foreground">
          {loading ? 'Procesando archivo…' : 'Arrastra o selecciona tu archivo'}
        </span>
        <span className="mt-1 text-xs text-neutral">Formato .xlsx</span>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
          disabled={loading}
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
      </label>

      <section className="mt-8">
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          Especificaciones de la plantilla
        </h4>
        <DataTable
          columns={specColumns}
          data={specifications}
          getRowKey={(row) => row.name}
        />
      </section>

      <OtpModal
        open={otpOpen}
        onClose={() => {
          setOtpOpen(false)
          setFile(null)
          if (inputRef.current) inputRef.current.value = ''
        }}
        loading={loading}
        onSubmit={submitBulk}
      />
    </section>
  )
}
