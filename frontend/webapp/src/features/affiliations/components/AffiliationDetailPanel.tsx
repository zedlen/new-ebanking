import type { AffiliationRow } from '@/shared/types/affiliations'
import { formatAffiliationAddress } from '@/shared/utils/affiliations'
import { formatCurrency } from '@/shared/utils/format'

interface AffiliationDetailPanelProps {
  row: AffiliationRow
}

export function AffiliationDetailPanel({ row }: AffiliationDetailPanelProps) {
  return (
    <section className="grid gap-6 sm:grid-cols-2">
      <article>
        <h3 className="mb-3 font-semibold text-foreground">Datos personales</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <span className="text-neutral">Nombre: </span>
            {[row.name, row.ap_paterno, row.ap_materno].filter(Boolean).join(' ') ||
              row.contact_name}
          </li>
          <li>
            <span className="text-neutral">Correo: </span>
            {row.contact_email ?? '—'}
          </li>
          <li>
            <span className="text-neutral">RFC: </span>
            {row.rfc ?? '—'}
          </li>
          <li>
            <span className="text-neutral">Teléfono: </span>
            {row.contact_tel ?? '—'}
          </li>
          <li>
            <span className="text-neutral">Fecha de ingreso: </span>
            {row.creation_date ?? '—'}
          </li>
        </ul>
      </article>
      <article>
        <h3 className="mb-3 font-semibold text-foreground">Cuenta y dirección</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <span className="text-neutral">Cuenta: </span>
            {row.account.clabes?.[0]?.account_id ?? '—'}
          </li>
          <li>
            <span className="text-neutral">Saldo: </span>
            {formatCurrency(row.account.amount, row.account.currency)}
          </li>
          <li>
            <span className="text-neutral">Dirección: </span>
            {formatAffiliationAddress(row.address)}
          </li>
        </ul>
      </article>
    </section>
  )
}
