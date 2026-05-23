import { useState } from 'react'
import { AffiliationRequestsPanel } from '@/features/affiliations/components/AffiliationRequestsPanel'
import { AffiliationsListPanel } from '@/features/affiliations/components/AffiliationsListPanel'
import { PendingDispersionsPanel } from '@/features/affiliations/components/PendingDispersionsPanel'
import { TrackingDispersionsPanel } from '@/features/affiliations/components/TrackingDispersionsPanel'
import {
  AFFILIATION_TAB,
  AFFILIATION_TABS,
  type AffiliationTabId,
} from '@/shared/constants/affiliations'

export function AffiliationsPage() {
  const [activeTab, setActiveTab] = useState<AffiliationTabId>(
    AFFILIATION_TAB.LIST,
  )

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Afiliaciones</h1>
        <p className="text-sm text-neutral">
          Administra afiliados, dispersiones y solicitudes de alta.
        </p>
      </header>

      <nav className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface-muted/40 p-2">
        {AFFILIATION_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-neutral hover:bg-background',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="rounded-lg border border-border bg-background p-6">
        {activeTab === AFFILIATION_TAB.LIST ? <AffiliationsListPanel /> : null}
        {activeTab === AFFILIATION_TAB.PENDING ? <PendingDispersionsPanel /> : null}
        {activeTab === AFFILIATION_TAB.TRACKING ? (
          <TrackingDispersionsPanel />
        ) : null}
        {activeTab === AFFILIATION_TAB.REQUESTS ? (
          <AffiliationRequestsPanel />
        ) : null}
      </section>
    </section>
  )
}
