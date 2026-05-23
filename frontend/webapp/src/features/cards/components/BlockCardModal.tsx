import { useMemo, useState } from 'react'
import { authService } from '@/api/services/authService'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import {
  BLOCK_REASONS_PHYSICAL,
  BLOCK_REASONS_VIRTUAL,
  CANCEL_REASONS_PHYSICAL,
  CANCEL_REASONS_VIRTUAL,
  CARD_TYPE,
  type CardType,
} from '@/shared/types/card'

interface BlockCardModalProps {
  cardType: CardType
  disableCard: boolean
  loading?: boolean
  onClose: () => void
  onConfirm: (reason: string, otp?: string) => void
}

export function BlockCardModal({
  cardType,
  disableCard,
  loading = false,
  onClose,
  onConfirm,
}: BlockCardModalProps) {
  const [reason, setReason] = useState('')
  const [otp, setOtp] = useState('')
  const [otpMessage, setOtpMessage] = useState<string | null>(null)

  const options = useMemo(() => {
    if (disableCard) {
      return cardType === CARD_TYPE.VIRTUAL
        ? CANCEL_REASONS_VIRTUAL
        : CANCEL_REASONS_PHYSICAL
    }
    return cardType === CARD_TYPE.VIRTUAL
      ? BLOCK_REASONS_VIRTUAL
      : BLOCK_REASONS_PHYSICAL
  }, [cardType, disableCard])

  const canSubmit = disableCard ? Boolean(reason && otp) : Boolean(reason)

  const requestOtp = async () => {
    const ok = await authService.createOtpCancelCard()
    setOtpMessage(
      ok ? 'Código enviado a tu correo.' : 'No se pudo generar el código.',
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <p className="text-sm text-neutral">
        Elige un motivo para {disableCard ? 'cancelar' : 'bloquear'} la tarjeta:
      </p>

      <Select
        label="Motivo"
        value={reason}
        options={options}
        onChange={setReason}
        placeholder="Seleccionar motivo"
      />

      {disableCard ? (
        <>
          <section className="rounded-lg border border-border bg-surface-muted/50 p-4 text-center">
            <p className="mb-3 text-sm text-neutral">
              Para tu seguridad te enviaremos un código a tu correo.
            </p>
            <Button type="button" variant="secondary" onClick={() => void requestOtp()}>
              Generar código
            </Button>
          </section>
          <Input
            label="Código OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            maxLength={6}
            inputMode="numeric"
          />
          {otpMessage ? <p className="text-sm text-neutral">{otpMessage}</p> : null}
        </>
      ) : null}

      <p className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={!canSubmit || loading}
          onClick={() => onConfirm(reason, disableCard ? otp : undefined)}
        >
          {loading
            ? 'Procesando…'
            : disableCard
              ? 'Deshabilitar'
              : 'Bloquear'}
        </Button>
      </p>
    </section>
  )
}
