import { Skeleton } from '@/shared/components/Skeleton'
import { TableSkeleton } from '@/shared/components/TableSkeleton'

export function AccountDetailsHeaderSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-2 border-b border-border pb-1">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
      <div className="grid gap-4 border-b border-border py-4 lg:grid-cols-2">
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-full max-w-xs lg:ml-auto" />
      </div>
      <TableSkeleton columns={3} rows={3} minWidthClass="min-w-0 w-full" />
    </div>
  )
}
