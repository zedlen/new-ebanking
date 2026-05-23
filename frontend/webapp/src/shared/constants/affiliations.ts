export const AFFILIATION_TAB = {
  LIST: 'list',
  PENDING: 'pending',
  TRACKING: 'tracking',
  REQUESTS: 'requests',
} as const

export type AffiliationTabId =
  (typeof AFFILIATION_TAB)[keyof typeof AFFILIATION_TAB]

export const AFFILIATION_TABS: { id: AffiliationTabId; label: string }[] = [
  { id: AFFILIATION_TAB.LIST, label: 'Afiliaciones' },
  { id: AFFILIATION_TAB.PENDING, label: 'Pendientes' },
  { id: AFFILIATION_TAB.TRACKING, label: 'Seguimiento' },
  { id: AFFILIATION_TAB.REQUESTS, label: 'Nuevas solicitudes' },
]
