import { Skeleton } from '@/shared/components/Skeleton'

export function AccountsBalanceSummarySkeleton() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-8" aria-busy="true">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex-1 rounded-lg border border-border bg-surface-muted px-4 py-4 sm:px-6"
        >
          <Skeleton className="mb-2 h-8 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  )
}
