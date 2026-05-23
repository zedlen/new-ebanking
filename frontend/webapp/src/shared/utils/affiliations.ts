import type { Affiliation, AffiliationRow } from '@/shared/types/affiliations'
import { getCustomerDisplayName } from '@/shared/utils/customer'

export function flattenAffiliationRows(data: Affiliation[]): AffiliationRow[] {
  return data
    .flatMap((item) =>
      (item.accounts ?? []).map((account) => ({
        ...item,
        account,
        accounts: [],
        cards: account.cards ?? [],
        field_name: item.field_name ?? getCustomerDisplayName(item),
      })),
    )
    .filter((row) => row.account)
}

export function formatAffiliationAddress(
  address?: Affiliation['address'],
): string {
  if (!address) return '—'
  return `${address.street} ${address.num_ext} ${address.num_int ?? ''}, ${address.neighborhood}, ${address.district}, ${address.estate} C.P. ${address.cp}`
}
