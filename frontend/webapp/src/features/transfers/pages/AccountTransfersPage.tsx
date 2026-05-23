import { useState } from 'react'
import { BulkTransferPanel } from '@/features/transfers/components/BulkTransferPanel'
import { FavoritesPanel } from '@/features/transfers/components/FavoritesPanel'
import { PendingTransfersPanel } from '@/features/transfers/components/PendingTransfersPanel'
import { ThirdPartyTransferForm } from '@/features/transfers/components/ThirdPartyTransferForm'
import { TrackingTransfersPanel } from '@/features/transfers/components/TrackingTransfersPanel'
import {
  TRANSFER_TAB,
  TRANSFER_TABS,
  type TransferTabId,
} from '@/shared/constants/banking'

export function AccountTransfersPage() {
  const [activeTab, setActiveTab] = useState<TransferTabId>(
    TRANSFER_TAB.TRANSFER,
  )

  return (
    <section className="mt-6 rounded-lg border border-border bg-surface-muted/40">
      <nav className="flex flex-wrap gap-1 border-b border-border p-2">
        {TRANSFER_TABS.map((tab) => (
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

      <section className="p-6">
        {activeTab === TRANSFER_TAB.TRANSFER ? <ThirdPartyTransferForm /> : null}
        {activeTab === TRANSFER_TAB.BULK ? <BulkTransferPanel /> : null}
        {activeTab === TRANSFER_TAB.PENDING ? <PendingTransfersPanel /> : null}
        {activeTab === TRANSFER_TAB.TRACKING ? (
          <TrackingTransfersPanel />
        ) : null}
        {activeTab === TRANSFER_TAB.FAVS ? (
          <FavoritesPanel onUseFavorite={() => setActiveTab(TRANSFER_TAB.TRANSFER)} />
        ) : null}
      </section>
    </section>
  )
}
