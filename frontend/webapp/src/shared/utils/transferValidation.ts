import { validateClabe } from '@/shared/utils/clabe'
import { normalizeAccountNumber } from '@/shared/utils/transferType'

export interface TransferDetailsDraft {
  paymentType: '1' | '2'
  beneficiaryAccount: string
  beneficiaryBank: string
  beneficiaryName: string
  beneficiaryEmail: string
  beneficiaryUid: string
  numericalReference: string
  concept: string
  amount: string
  saveAccount: boolean
  beneficiaryNickname: string
}

export const TRANSFER_CONCEPT_MAX_LENGTH = 42
export const TRANSFER_REFERENCE_MAX_LENGTH = 7
export const TRANSFER_ALIAS_MIN_LENGTH = 3

const CONCEPT_PATTERN = /^[A-Za-z\s]*$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Persona física (13) o moral (12): letras + fecha + homoclave. */
const MEXICAN_RFC_PATTERN = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/

export type TransferDetailsFieldErrors = Partial<
  Record<
    | 'beneficiaryAccount'
    | 'beneficiaryName'
    | 'beneficiaryEmail'
    | 'beneficiaryUid'
    | 'numericalReference'
    | 'concept'
    | 'amount'
    | 'beneficiaryNickname',
    string
  >
>

export function sanitizeConceptInput(value: string): string {
  return value
    .replace(/[^A-Za-z\s]/g, '')
    .slice(0, TRANSFER_CONCEPT_MAX_LENGTH)
}

export function sanitizeReferenceInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, TRANSFER_REFERENCE_MAX_LENGTH)
}

export function validateTransferEmail(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Ingresa un correo electrónico válido'
  }
  return null
}

export function validateTransferConcept(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Ingresa el concepto'
  if (trimmed.length > TRANSFER_CONCEPT_MAX_LENGTH) {
    return `Máximo ${TRANSFER_CONCEPT_MAX_LENGTH} caracteres`
  }
  if (!CONCEPT_PATTERN.test(trimmed)) {
    return 'Solo letras y espacios, sin caracteres especiales'
  }
  return null
}

export function validateTransferReference(
  value: string,
  required: boolean,
): string | null {
  const trimmed = value.trim()
  if (!trimmed) return required ? 'Ingresa la referencia' : null
  if (trimmed.length > TRANSFER_REFERENCE_MAX_LENGTH) {
    return `Máximo ${TRANSFER_REFERENCE_MAX_LENGTH} caracteres`
  }
  if (!/^\d+$/.test(trimmed)) return 'Solo números'
  return null
}

export function validateMexicanRfc(value: string): string | null {
  const trimmed = value.trim().toUpperCase()
  if (!trimmed) return null
  if (!MEXICAN_RFC_PATTERN.test(trimmed)) {
    return 'Ingresa un RFC mexicano válido'
  }
  return null
}

export function validateBeneficiaryAlias(
  value: string,
  saveAccount: boolean,
): string | null {
  if (!saveAccount) return null
  const trimmed = value.trim()
  if (trimmed.length < TRANSFER_ALIAS_MIN_LENGTH) {
    return `Mínimo ${TRANSFER_ALIAS_MIN_LENGTH} caracteres`
  }
  return null
}

export function validateTransferDestination(
  beneficiaryAccount: string,
  paymentType: '1' | '2',
  beneficiaryBank: string,
): string | null {
  const cleared = normalizeAccountNumber(beneficiaryAccount)
  if (!cleared) return 'Ingresa la cuenta beneficiaria'

  if (paymentType === '1') {
    const clabeError = validateClabe(cleared)
    if (clabeError) return clabeError
    if (!beneficiaryBank) {
      return 'No se pudo identificar la institución destinataria'
    }
  }

  return null
}

export function validateTransferDetails(
  draft: TransferDetailsDraft,
): TransferDetailsFieldErrors {
  const errors: TransferDetailsFieldErrors = {}
  const isSpei = draft.paymentType === '1'

  const accountError = isSpei
    ? validateTransferDestination(
        draft.beneficiaryAccount,
        draft.paymentType,
        draft.beneficiaryBank,
      )
    : normalizeAccountNumber(draft.beneficiaryAccount)
      ? null
      : 'Ingresa la cuenta beneficiaria'
  if (accountError) errors.beneficiaryAccount = accountError

  if (!draft.beneficiaryName.trim()) {
    errors.beneficiaryName = 'Ingresa el nombre del beneficiario'
  }

  const emailError = validateTransferEmail(draft.beneficiaryEmail)
  if (emailError) errors.beneficiaryEmail = emailError

  const conceptError = validateTransferConcept(draft.concept)
  if (conceptError) errors.concept = conceptError

  const referenceError = validateTransferReference(
    draft.numericalReference,
    isSpei,
  )
  if (referenceError) errors.numericalReference = referenceError

  const rfcError = validateMexicanRfc(draft.beneficiaryUid)
  if (isSpei && draft.beneficiaryUid.trim() && rfcError) {
    errors.beneficiaryUid = rfcError
  }

  const aliasError = validateBeneficiaryAlias(
    draft.beneficiaryNickname,
    draft.saveAccount,
  )
  if (aliasError) errors.beneficiaryNickname = aliasError

  const amount = Number(draft.amount)
  if (!draft.amount.trim() || Number.isNaN(amount) || amount <= 0) {
    errors.amount = 'Ingresa un importe válido'
  }

  return errors
}

export function hasTransferDetailsErrors(
  errors: TransferDetailsFieldErrors,
): boolean {
  return Object.keys(errors).length > 0
}
