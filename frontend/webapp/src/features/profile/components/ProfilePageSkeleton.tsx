import { Skeleton } from '@/shared/components/Skeleton'

export function ProfilePageSkeleton() {
  return (
    <section className="grid gap-6 lg:grid-cols-2" aria-busy="true">
      <article className="rounded-lg border border-border p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-4">
          <Skeleton className="size-14 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-full max-w-sm" />
          ))}
        </div>
      </article>
      <article className="rounded-lg border border-border p-4 sm:p-6">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </article>
    </section>
  )
}
