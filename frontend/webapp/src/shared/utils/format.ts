const currencyLocales: Record<string, string> = {
  MXN: 'es-MX',
  USD: 'en-US',
  EUR: 'es-ES',
}

export function formatDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value.replace(/[zZ]/, ''))
  if (Number.isNaN(date.getTime())) return '—'

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

export function formatAddress(address?: {
  street?: string
  num_ext?: string
  num_int?: string | null
  neighborhood?: string
  district?: string
  estate?: string
  cp?: string
} | null): string {
  if (!address) return '—'

  const line1 = [address.street, address.num_ext, address.num_int]
    .filter(Boolean)
    .join(' ')
  const line2 = [address.neighborhood, address.district, address.estate, address.cp]
    .filter(Boolean)
    .join(', ')

  return [line1, line2].filter(Boolean).join(' · ') || '—'
}

export function formatCurrency(amount?: number, currency = 'MXN'): string {
  const locale = currencyLocales[currency] ?? 'es-MX'
  return (amount ?? 0).toLocaleString(locale, {
    style: 'currency',
    currency,
  })
}
