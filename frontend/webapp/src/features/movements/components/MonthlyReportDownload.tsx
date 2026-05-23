import { useState } from 'react'
import { movementsService } from '@/api/services/movementsService'
import { Button } from '@/shared/components/Button'
import { Select } from '@/shared/components/Select'
import { getLastThreeMonths } from '@/shared/utils/dates'

interface MonthlyReportDownloadProps {
  /** Account id sent to the API (`external_id` preferred). */
  accountId: string
  variant?: 'inline' | 'card'
}

export function MonthlyReportDownload({
  accountId,
  variant = 'inline',
}: MonthlyReportDownloadProps) {
  const monthOptions = getLastThreeMonths()
  const [reportMonth, setReportMonth] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleDownload = async () => {
    if (!reportMonth || !accountId) return
    const option = monthOptions.find((m) => m.key === reportMonth)
    if (!option) return

    setLoading(true)
    setError(false)
    setSuccess(false)

    const ok = await movementsService.downloadMonthlyReport(
      accountId,
      option.key,
      option.label,
    )

    if (ok) {
      setSuccess(true)
    } else {
      setError(true)
    }
    setLoading(false)
  }

  const controls = (
    <>
      <Select
        label={variant === 'card' ? 'Mes del reporte' : 'Estado de movimientos'}
        value={reportMonth}
        options={monthOptions.map((m) => ({ value: m.key, label: m.label }))}
        onChange={(value) => {
          setReportMonth(value)
          setError(false)
          setSuccess(false)
        }}
        placeholder="Selecciona un mes"
      />
      <Button
        disabled={!reportMonth || loading || !accountId}
        onClick={() => void handleDownload()}
      >
        {loading ? 'Generando…' : 'Descargar PDF'}
      </Button>
    </>
  )

  if (variant === 'card') {
    return (
      <article className="rounded-lg border border-border bg-background p-5">
        <h3 className="text-base font-semibold text-foreground">
          Estado de movimientos mensual
        </h3>
        <p className="mt-1 text-sm text-neutral">
          Consulta y descarga el PDF de movimientos de los últimos tres meses.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          {controls}
        </div>
        {error ? (
          <p className="mt-3 text-sm text-error" role="alert">
            No se pudo generar el reporte mensual. Intenta de nuevo.
          </p>
        ) : null}
        {success ? (
          <p className="mt-3 text-sm text-success" role="status">
            Reporte descargado correctamente.
          </p>
        ) : null}
      </article>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">{controls}</div>
      {error ? (
        <p className="text-sm text-error" role="alert">
          No se pudo generar el reporte mensual.
        </p>
      ) : null}
    </div>
  )
}
