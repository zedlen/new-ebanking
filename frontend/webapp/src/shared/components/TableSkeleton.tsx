import { Skeleton } from '@/shared/components/Skeleton'

interface TableSkeletonProps {
  columns?: number
  rows?: number
  minWidthClass?: string
}

export function TableSkeleton({
  columns = 5,
  rows = 6,
  minWidthClass = 'min-w-[640px]',
}: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border" aria-busy="true">
      <table className={`${minWidthClass} w-full text-left text-sm`}>
        <thead className="border-b border-border bg-surface-muted">
          <tr>
            {Array.from({ length: columns }, (_, index) => (
              <th key={index} className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-0">
              {Array.from({ length: columns }, (_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <Skeleton
                    className={`h-4 ${colIndex === 0 ? 'w-20' : colIndex === columns - 1 ? 'w-28' : 'w-full max-w-[180px]'}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
