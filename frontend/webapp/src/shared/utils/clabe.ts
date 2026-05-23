/** Weights for CLABE check digit (positions 1–17). Pattern repeats 3, 7, 1. */
const CLABE_WEIGHTS = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7] as const

export const CLABE_LENGTH = 18

export function normalizeClabe(value: string): string {
  return value.replace(/\D/g, '')
}

export function sanitizeClabeInput(value: string): string {
  return normalizeClabe(value).slice(0, CLABE_LENGTH)
}

/**
 * Validates a Mexican CLABE using the official control-digit algorithm (mod 10).
 * @see https://en.wikipedia.org/wiki/CLABE
 */
export function isValidClabe(value: string): boolean {
  const clabe = normalizeClabe(value)
  if (clabe.length !== CLABE_LENGTH) return false

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += Number(clabe[i]) * CLABE_WEIGHTS[i]
  }

  const expectedCheck = (10 - (sum % 10)) % 10
  return expectedCheck === Number(clabe[17])
}

export function validateClabe(value: string): string | null {
  const clabe = normalizeClabe(value)

  if (clabe.length === 0) {
    return 'Ingresa la cuenta beneficiaria'
  }

  if (clabe.length !== CLABE_LENGTH) {
    return `La CLABE debe tener ${CLABE_LENGTH} dígitos`
  }

  if (!isValidClabe(clabe)) {
    return 'CLABE no válida; verifica el número y el dígito de control'
  }

  return null
}
