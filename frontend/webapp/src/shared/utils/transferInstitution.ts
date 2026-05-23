import { APP_BRAND } from '@/shared/constants/banking'
import type { Bank } from '@/shared/types/transfers'

export function getBeneficiaryInstitutionLabel(
  paymentType: '1' | '2',
  beneficiaryBank: string,
  banks: Bank[],
): string {
  if (paymentType === '2') return APP_BRAND.displayName
  const match = banks.find((bank) => bank.legalCode === beneficiaryBank)
  return match?.name ?? ''
}
