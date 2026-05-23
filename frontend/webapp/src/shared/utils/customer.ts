/** Display name for customer/client/affiliation rows (matches legacy `getName`). */
export function getCustomerDisplayName(
  customer?: {
    taxpayer_type_id?: number
    company_name?: string | null
    contact_name?: string
    name?: string
    ap_paterno?: string
    ap_materno?: string
  } | null,
): string {
  if (!customer) return '—'

  if (customer.taxpayer_type_id === 2) {
    return (customer.company_name || customer.contact_name || '—').toUpperCase()
  }

  const fullName = [customer.name, customer.ap_paterno, customer.ap_materno]
    .filter(Boolean)
    .join(' ')

  return (fullName || customer.company_name || customer.contact_name || '—').toUpperCase()
}
