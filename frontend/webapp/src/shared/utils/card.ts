export function maskPan(
  value?: string,
  visibleStart = 6,
  visibleEnd = 12,
  separator = 4,
): string {
  if (!value) return '—'
  const str = value.replace(/\s/g, '')
  const start = Math.max(0, visibleStart)
  const end = Math.min(str.length, visibleEnd)
  const masked =
    str.slice(0, start) + '*'.repeat(Math.max(0, end - start)) + str.slice(end)
  if (!separator) return masked
  return masked.match(new RegExp(`.{1,${separator}}`, 'g'))?.join(' ') ?? masked
}

export function formatCardExpiry(value?: string): string {
  if (!value) return '—'
  const date = new Date(value.replace(/[zZ]/, ''))
  if (Number.isNaN(date.getTime())) return '—'
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${month}/${year}`
}

export function secondsUntil(future: string | Date): number {
  const target = new Date(future).getTime()
  const now = Date.now()
  return Math.max(0, Math.floor(Math.abs(target - now) / 1000))
}
