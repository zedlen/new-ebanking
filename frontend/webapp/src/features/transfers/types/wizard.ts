import type { AccountInfo } from '@/shared/types/accounts'
import type { TransferFavorite } from '@/shared/types/transfers'

export type TransferPaymentType = '1' | '2'

export interface TransferWizardDraft {
  sourceAccount: AccountInfo | null
  beneficiaryAccount: string
  paymentType: TransferPaymentType
  beneficiaryBank: string
  beneficiaryName: string
  beneficiaryEmail: string
  beneficiaryUid: string
  numericalReference: string
  amount: string
  concept: string
  saveAccount: boolean
  beneficiaryNickname: string
  lockedFavorite: TransferFavorite | null
}

export const emptyTransferDraft = (): TransferWizardDraft => ({
  sourceAccount: null,
  beneficiaryAccount: '',
  paymentType: '2',
  beneficiaryBank: '',
  beneficiaryName: '',
  beneficiaryEmail: '',
  beneficiaryUid: '',
  numericalReference: '',
  amount: '',
  concept: '',
  saveAccount: false,
  beneficiaryNickname: '',
  lockedFavorite: null,
})
