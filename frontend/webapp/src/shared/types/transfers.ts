export interface Bank {
  code: string
  legalCode: string
  name: string
  isActive?: boolean
}

export interface TransferFavorite {
  customer_id: string
  account_id: string
  account_type: string
  account_alias: string
  beneficiary_name: string
  beneficiary_email: string
}

export interface SpeiTransferRequest {
  concept: string
  beneficiary_account: string
  beneficiary_bank: string
  beneficiary_name: string
  beneficiary_uid: string
  beneficiary_account_type: number
  beneficiary_email?: string
  payer_account: string
  amount: number
  numerical_reference: number
  save_beneficiary_account: boolean
  alias_beneficiary_account?: string
  account_id: string
}

export interface InternalTransferRequest {
  payer_account: string
  beneficiary_account: string
  amount: number
  concept: string
  save_beneficiary_account: boolean
  alias_beneficiary_account?: string
}

export interface ApiResult {
  code: number
  message?: string
  data?: unknown
}

export interface PendingTransfer {
  id: string
  alias_beneficiary_account?: string
  amount: number
  beneficiary_account: string
  beneficiary_name: string
  concept: string
  numerical_reference?: number
  payer_account?: string
  status?: string
  payment_method?: string
  comision?: number
  total_amount?: number
}

export const PENDING_STATUS = {
  PENDING: '1',
  SUCCESS: '2',
  ERROR: '3',
} as const

export interface BulkTransferPreviewRow {
  line: number
  beneficiary_account: string
  concept: string
  amount: number
  beneficiary_name: string
  beneficiary_uid?: string
  beneficiary_email?: string
  numerical_reference?: number
}
