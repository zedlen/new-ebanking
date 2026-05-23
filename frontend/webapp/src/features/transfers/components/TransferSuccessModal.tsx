import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'
import { formatCurrency } from '@/shared/utils/format'

export interface TransferSuccessData {
  amount: number
  concept: string
  reference: string
  beneficiaryName: string
  beneficiaryAccount: string
  paymentTypeLabel: string
  currency?: string
}

interface TransferSuccessModalProps {
  open: boolean
  data: TransferSuccessData | null
  onClose: () => void
}

export function TransferSuccessModal({
  open,
  data,
  onClose,
}: TransferSuccessModalProps) {
  if (!data) return null

  return (
    <Modal open={open} title="Detalle de transacción" onClose={onClose}>
      <ul className="space-y-3 text-sm">
        <li>
          <span className="text-neutral">Importe: </span>
          <strong>{formatCurrency(data.amount, data.currency)}</strong>
        </li>
        <li>
          <span className="text-neutral">Concepto: </span>
          {data.concept}
        </li>
        <li>
          <span className="text-neutral">Referencia: </span>
          {data.reference}
        </li>
        <li>
          <span className="text-neutral">Medio de pago: </span>
          {data.paymentTypeLabel}
        </li>
        <li>
          <span className="text-neutral">Beneficiario: </span>
          {data.beneficiaryName}
        </li>
        <li>
          <span className="text-neutral">Cuenta destino: </span>
          {data.beneficiaryAccount}
        </li>
      </ul>
      <p className="mt-6 flex justify-end">
        <Button type="button" onClick={onClose}>
          Cerrar
        </Button>
      </p>
    </Modal>
  )
}
