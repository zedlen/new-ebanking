export const CARD_TYPE = {
  VIRTUAL: 'VIRTUAL',
  PHYSICAL: 'PHYSICAL',
} as const

export type CardType = (typeof CARD_TYPE)[keyof typeof CARD_TYPE]

export const CARD_STATUS = {
  NORMAL: 'NORMAL',
  BLOCKED: 'BLOCKED',
  CANCELLED: 'CANCELLED',
} as const

export type CardStatus = (typeof CARD_STATUS)[keyof typeof CARD_STATUS]

export const CARD_TYPE_LABEL: Record<CardType, string> = {
  VIRTUAL: 'Virtual',
  PHYSICAL: 'Física',
}

export const CARD_STATUS_LABEL: Record<CardStatus, string> = {
  NORMAL: 'Activa',
  BLOCKED: 'Bloqueada',
  CANCELLED: 'Cancelada',
}

export const CARD_STATUS_ACTION: Record<CardStatus, string> = {
  NORMAL: 'Bloquear',
  BLOCKED: 'Desbloquear',
  CANCELLED: 'Cancelada',
}

export interface Card {
  id: string
  type: CardType
  active_function?: string
  masked_pan: string
  cardholder_name?: string
  product_type?: string
  account_id: string
  status?: CardStatus
  status_reason?: string
  brand?: string
  issuing_country?: string
  creation_date?: string
  update_date?: string
  external_id?: string
}

export interface CardChangeStatus {
  status: string
  statusReason: string | null
}

export interface LinkCardRequest {
  accountId: string
  pan?: string
}

export interface CardSensitiveData {
  pan?: string
  cvv?: string
  pin?: string
  expiration_date?: string
  cardholder_name?: string
  masked_pan?: string
  id?: string
}

export interface EncryptedPayload {
  message?: string
  iv?: string
}

export interface SelectOption {
  value: string
  label: string
}

export const BLOCK_REASONS_VIRTUAL: SelectOption[] = [
  { value: 'OWNER_REQUEST', label: 'Bloqueo por solicitud del propietario' },
  { value: 'SUSPICION_OF_FRAUD', label: 'Bloqueo por sospecha de fraude' },
  { value: 'TEMPORARILY', label: 'Bloqueo temporal' },
  { value: 'INACTIVITY', label: 'Bloqueo por inactividad' },
  { value: 'OTHER', label: 'Otro' },
]

export const BLOCK_REASONS_PHYSICAL: SelectOption[] = [
  { value: 'LOST', label: 'Bloqueo por extravío' },
  { value: 'SUSPICION_OF_FRAUD', label: 'Bloqueo por sospecha de fraude' },
  { value: 'OWNER_REQUEST', label: 'Bloqueo por solicitud del propietario' },
  { value: 'TEMPORARILY', label: 'Bloqueo temporal' },
  { value: 'INACTIVITY', label: 'Bloqueo por inactividad' },
  { value: 'OTHER', label: 'Otro' },
]

export const CANCEL_REASONS_VIRTUAL: SelectOption[] = [
  { value: 'THEFT', label: 'Cancelar por robo' },
  { value: 'OWNER_REQUEST', label: 'Cancelar por solicitud del propietario' },
  { value: 'TERMINATED_CONTRACT', label: 'Cancelar por término de contrato' },
  { value: 'SUSPICION_OF_FRAUD', label: 'Cancelar por sospecha de fraude' },
  { value: 'INACTIVITY', label: 'Cancelar por inactividad' },
  { value: 'OTHER', label: 'Otro' },
]

export const CANCEL_REASONS_PHYSICAL: SelectOption[] = [
  { value: 'LOST', label: 'Cancelar por extravío' },
  { value: 'THEFT', label: 'Cancelar por robo' },
  { value: 'OWNER_REQUEST', label: 'Cancelar por solicitud del propietario' },
  { value: 'TERMINATED_CONTRACT', label: 'Cancelar por término de contrato' },
  { value: 'MISPLACED_CARD', label: 'Tarjeta no recibida' },
  { value: 'SUSPICION_OF_FRAUD', label: 'Cancelar por sospecha de fraude' },
  { value: 'INACTIVITY', label: 'Cancelar por inactividad' },
  { value: 'OTHER', label: 'Otro' },
]
