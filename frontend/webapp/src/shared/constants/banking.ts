export const APP_BRAND = {
  displayName: 'ZeusPay',
  transferName: 'ZeusPay',
} as const

export const DEFAULT_BENEFICIARY_RFC = 'XAXX010101000'

export const ACCOUNT_TYPE: Record<number, string> = {
  0: '—',
  1: 'Cuenta',
  2: 'Subcuenta',
}

export const TAXPAYER_TYPE_ID = {
  PHYSICAL: 1,
  LEGAL: 2,
} as const

export const TAXPAYER_TYPE: Record<number, string> = {
  0: '—',
  [TAXPAYER_TYPE_ID.PHYSICAL]: 'Física',
  [TAXPAYER_TYPE_ID.LEGAL]: 'Moral',
}

export const MOVEMENTS_TYPE: Record<number, string> = {
  1: 'SPEI',
  2: 'SPEI',
  3: 'Traspaso',
  4: 'Compra',
  5: 'Retiro',
  6: 'Comisión',
  7: 'Comisión por operación',
}

export const MOVEMENT_STATUS: Record<string, string> = {
  applied: 'Liquidada',
  stoped: 'Detenido/Holdeado',
  created: 'Creado',
  pending: 'Pendiente de envío',
  in_transit: 'Enviada',
  sent: 'En proceso',
  scattered: 'Liquidada',
  canceled: 'Cancelada',
  returned: 'Devuelto',
}

export const TRANSFER_TAB = {
  TRANSFER: 'transfer',
  BULK: 'bulk',
  PENDING: 'pending',
  TRACKING: 'tracking',
  FAVS: 'favs',
} as const

export type TransferTabId = (typeof TRANSFER_TAB)[keyof typeof TRANSFER_TAB]

export const TRANSFER_TABS: { id: TransferTabId; label: string }[] = [
  { id: TRANSFER_TAB.TRANSFER, label: 'Transferencia' },
  { id: TRANSFER_TAB.BULK, label: 'Transferencias masivas' },
  { id: TRANSFER_TAB.PENDING, label: 'Pendientes' },
  { id: TRANSFER_TAB.TRACKING, label: 'Seguimiento' },
  { id: TRANSFER_TAB.FAVS, label: 'Favoritos' },
]
