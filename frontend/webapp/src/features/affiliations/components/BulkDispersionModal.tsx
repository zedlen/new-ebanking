import { Button } from '@/shared/components/Button'

const TEMPLATE_URL = 'https://cdn.ebanking-service.net/transfer_template.xlsx'

interface BulkDispersionModalProps {
  onFileSelected: (file: File) => void
}

export function BulkDispersionModal({ onFileSelected }: BulkDispersionModalProps) {
  return (
    <section className="flex max-w-lg flex-col gap-4">
      <Button
        type="button"
        variant="secondary"
        onClick={() => window.open(TEMPLATE_URL, '_blank', 'noopener,noreferrer')}
      >
        Descargar plantilla
      </Button>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-10 text-center">
        <span className="text-sm font-medium">Selecciona archivo Excel (.xlsx)</span>
        <input
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onFileSelected(file)
          }}
        />
      </label>
    </section>
  )
}
