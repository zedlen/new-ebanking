import { Skeleton } from '@/shared/components/Skeleton'
import { TableSkeleton } from '@/shared/components/TableSkeleton'

export function CardsPageSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true">
      <div className="flex items-center justify-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-44 w-72 max-w-full rounded-2xl" />
        <Skeleton className="size-10 rounded-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
      <TableSkeleton columns={4} rows={4} />
    </div>
  )
}
