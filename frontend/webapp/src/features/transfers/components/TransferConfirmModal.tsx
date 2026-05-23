import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import type { TransferWizardDraft } from '@/features/transfers/types/wizard'
import { APP_BRAND, DEFAULT_BENEFICIARY_RFC } from '@/shared/constants/banking'
import { useBanks } from '@/shared/hooks/useBanks'
import { getAccountLabel } from '@/shared/utils/transferAccount'
import { getBeneficiaryInstitutionLabel } from '@/shared/utils/transferInstitution'
import { formatCurrency } from '@/shared/utils/format'

interface TransferConfirmModalProps {
  open: boolean
  pendingSave: boolean
  loading: boolean
  draft: TransferWizardDraft
  onClose: () => void
  onConfirm: (otp: string) => void | Promise<void>
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-neutral">{label}</span>
      <span className="font-medium text-foreground sm:text-right">{value}</span>
    </li>
  )
}

export function TransferConfirmModal({
  open,
  pendingSave,
  loading,
  draft,
  onClose,
  onConfirm,
}: TransferConfirmModalProps) {
  const banks = useBanks()
  const [code, setCode] = useState('')

  useEffect(() => {
    if (!open) setCode('')
  }, [open])

  if (!draft.sourceAccount) return null

  const isSpei = draft.paymentType === '1'
  const institution = getBeneficiaryInstitutionLabel(
    draft.paymentType,
    draft.beneficiaryBank,
    banks,
  )
  const paymentTypeLabel = isSpei
    ? 'SPEI'
    : `Traspaso ${APP_BRAND.transferName}`
  const amount = Number(draft.amount)
  const originLabel = getAccountLabel(draft.sourceAccount)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!code.trim() || loading) return
    await onConfirm(code.trim())
  }

  const title = pendingSave ? 'Guardar en pendientes' : 'Confirmar transferencia'

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Resumen de la operación
          </h3>
          <ul className="space-y-2.5 rounded-lg border border-border bg-surface-muted/40 px-4 py-3 text-sm">
            <SummaryRow label="Cuenta origen" value={originLabel} />            
            <SummaryRow label="Medio de pago" value={paymentTypeLabel} />
            <SummaryRow
              label="Institución destinataria"
              value={institution || '—'}
            />
            <SummaryRow
              label="Cuenta destino"
              value={draft.beneficiaryAccount}
            />
            <SummaryRow label="Beneficiario" value={draft.beneficiaryName} />
            <SummaryRow
              label="Importe"
              value={formatCurrency(amount, draft.sourceAccount.currency)}
            />
            <SummaryRow label="Concepto" value={draft.concept} />
            {isSpei ? (
              <SummaryRow label="Referencia" value={draft.numericalReference} />
            ) : null}
            {draft.beneficiaryEmail ? (
              <SummaryRow label="Email" value={draft.beneficiaryEmail} />
            ) : null}
            {isSpei && draft.beneficiaryUid.trim() ? (
              <SummaryRow label="RFC" value={draft.beneficiaryUid.trim()} />
            ) : null}
            {isSpei && !draft.beneficiaryUid.trim() ? (
              <SummaryRow label="RFC" value={DEFAULT_BENEFICIARY_RFC} />
            ) : null}
            {draft.saveAccount ? (
              <SummaryRow
                label="Guardar favorito"
                value={draft.beneficiaryNickname || 'Sí'}
              />
            ) : null}
          </ul>
        </section>

        <Input
          label="Código OTP"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="000000"
          autoComplete="one-time-code"
          inputMode="numeric"
        />
        <p className="text-sm text-neutral">
          Ingresa el código de tu aplicación autenticadora para confirmar.
        </p>

        <p className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!code.trim() || loading}>
            {loading
              ? 'Procesando…'
              : pendingSave
                ? 'Guardar en pendientes'
                : 'Confirmar transferencia'}
          </Button>
        </p>
      </form>
    </Modal>
  )
}
