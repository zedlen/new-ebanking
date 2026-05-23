export function getLastThreeMonths(): { key: string; label: string }[] {
  const result: { key: string; label: string }[] = []
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('es-MX', { month: 'long' })

  for (let i = 1; i <= 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = formatter.format(date)
    const month = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    const year = date.getFullYear()
    const monthNumber = date.getMonth() + 1
    result.push({
      key: `${monthNumber},${year}`,
      label: `${month} ${year}`,
    })
  }

  return result
}

function formatDateQueryParam(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function buildMovementDateFilters(
  startDate?: string,
  endDate?: string,
): string {
  let filters = ''
  if (startDate) filters += `&startDate=${formatDateQueryParam(startDate)}`
  if (endDate) filters += `&endDate=${formatDateQueryParam(endDate)}`
  return filters
}
