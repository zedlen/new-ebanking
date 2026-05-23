import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PendingTransfersPanel } from '@/features/transfers/components/PendingTransfersPanel'
import { TrackingTransfersPanel } from '@/features/transfers/components/TrackingTransfersPanel'
import { paths } from '@/shared/constants/paths'

const TABS = [
  { id: 'pending' as const, label: 'Pendientes' },
  { id: 'tracking' as const, label: 'Seguimiento' },
]

export function BulkTransferHistoryPage() {
  const [tab, setTab] = useState<'pending' | 'tracking'>('pending')

  return (
    <section className="space-y-6">
      <header>
        <Link
          to={paths.transfers}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Volver a transferencias
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">
          Historial de cargas masivas
        </h1>
        <p className="mt-1 text-sm text-neutral">
          Revisa transferencias pendientes de aprobación y el seguimiento de operaciones.
        </p>
      </header>

      <nav className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={[
              'rounded-t-md px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === item.id
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral hover:text-foreground',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <section className="rounded-lg border border-border bg-background p-4 sm:p-6">
        {tab === 'pending' ? <PendingTransfersPanel /> : <TrackingTransfersPanel />}
      </section>
    </section>
  )
}
