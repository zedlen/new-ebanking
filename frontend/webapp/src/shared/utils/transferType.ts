/** SPEI when destination account is exactly 18 digits (CLABE), after stripping spaces. */
export function normalizeAccountNumber(value: string): string {
  return value.replace(/\s/g, '')
}

export function detectPaymentType(accountNumber: string): '1' | '2' {
  const cleared = normalizeAccountNumber(accountNumber)
  return /^\d{18}$/.test(cleared) ? '1' : '2'
}

export function isSpeiTransfer(accountNumber: string): boolean {
  return detectPaymentType(accountNumber) === '1'
}
