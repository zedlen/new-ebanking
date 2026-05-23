import type { ReactNode } from 'react'
import { TableSkeleton } from '@/shared/components/TableSkeleton'

export interface DataTableColumn<T> {
  id: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  emptyMessage?: string
  getRowKey: (row: T) => string
  isLoading?: boolean
  skeletonRows?: number
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No hay registros',
  getRowKey,
  isLoading = false,
  skeletonRows = 6,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <TableSkeleton
        columns={columns.length}
        rows={skeletonRows}
        minWidthClass="min-w-[640px]"
      />
    )
  }

  if (data.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-surface-muted px-4 py-12 text-center text-neutral sm:px-6">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border -mx-px">
      <table className="min-w-[640px] w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                className={`px-3 py-3 font-semibold text-neutral sm:px-4 ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-border last:border-0 hover:bg-surface-muted/60"
            >
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={`px-3 py-3 sm:px-4 ${column.className ?? ''}`}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
