import { Button } from '@/shared/components/Button'

interface PaginationProps {
  offset: number
  limit: number
  total: number
  onChange: (offset: number) => void
}

export function Pagination({ offset, limit, total, onChange }: PaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const canPrev = offset > 0
  const canNext = offset + limit < total

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <p className="text-sm text-neutral">
        Página {currentPage} de {totalPages} · {total} registros
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={!canPrev}
          onClick={() => onChange(Math.max(0, offset - limit))}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          disabled={!canNext}
          onClick={() => onChange(offset + limit)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
