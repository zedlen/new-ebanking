import { useEffect, useState } from 'react'
import { accountsService } from '@/api/services/accountsService'
import { authService } from '@/api/services/authService'
import { cardsService } from '@/api/services/cardsService'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import { CARD_TYPE, type CardType } from '@/shared/types/card'
import type { AccountInfo } from '@/shared/types/accounts'

interface LinkCardModalProps {
  onClose: () => void
  onSuccess: () => void
}

const cardTypeOptions = [
  { value: CARD_TYPE.VIRTUAL, label: 'Tarjeta virtual' },
  { value: CARD_TYPE.PHYSICAL, label: 'Tarjeta física' },
]

export function LinkCardModal({ onClose, onSuccess }: LinkCardModalProps) {
  const [cardType, setCardType] = useState<CardType>(CARD_TYPE.VIRTUAL)
  const [accounts, setAccounts] = useState<AccountInfo[]>([])
  const [accountId, setAccountId] = useState('')
  const [pan, setPan] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'error' | 'success'
    text: string
  } | null>(null)

  useEffect(() => {
    void accountsService.list(0, 50).then((res) => {
      setAccounts(res.accounts)
      if (res.accounts.length === 1) {
        setAccountId(res.accounts[0].external_id ?? res.accounts[0].id)
      }
    })
  }, [])

  const accountOptions = accounts.map((account) => ({
    value: account.external_id ?? account.id,
    label: account.clabes?.[0]?.account_id ?? account.id,
  }))

  const canSubmit =
    Boolean(otp) &&
    Boolean(accountId) &&
    (cardType === CARD_TYPE.VIRTUAL || pan.replace(/\D/g, '').length >= 16)

  const requestOtp = async () => {
    const ok = await authService.createOtpLinkCard()
    setMessage(
      ok
        ? { type: 'success', text: 'Código enviado a tu correo.' }
        : {
            type: 'error',
            text: 'No se pudo generar el código. Intenta de nuevo.',
          },
    )
  }

  const submit = async () => {
    if (cardType === CARD_TYPE.PHYSICAL) {
      setMessage({
        type: 'error',
        text: 'La vinculación de tarjeta física no está disponible en esta versión.',
      })
      return
    }

    setLoading(true)
    setMessage(null)
    const ok = await cardsService.linkVirtual({ accountId })
    setLoading(false)

    if (ok) {
      onSuccess()
      return
    }

    setMessage({
      type: 'error',
      text: 'No se pudo vincular la tarjeta. Verifica el código e intenta de nuevo.',
    })
  }

  return (
    <section className="flex max-w-md flex-col gap-4">
      <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
        <strong>Importante:</strong> una vez vinculada, la tarjeta no se puede desvincular.
      </p>

      <Select
        label="Tipo de tarjeta"
        value={cardType}
        options={cardTypeOptions}
        onChange={(value) => setCardType(value as CardType)}
        placeholder="Seleccionar"
      />

      <Select
        label="Cuenta a vincular"
        value={accountId}
        options={accountOptions}
        onChange={setAccountId}
        placeholder="Selecciona una cuenta"
      />

      {cardType === CARD_TYPE.PHYSICAL ? (
        <Input
          label="Número de tarjeta (16 dígitos)"
          value={pan}
          onChange={(event) => setPan(event.target.value)}
          maxLength={16}
          inputMode="numeric"
        />
      ) : null}

      <section className="rounded-lg border border-border bg-surface-muted/50 p-4 text-center">
        <p className="mb-3 text-sm text-neutral">
          Para tu seguridad te enviaremos un código a tu correo.
        </p>
        <Button type="button" variant="secondary" onClick={() => void requestOtp()}>
          Generar código
        </Button>
      </section>

      <Input
        label="Código enviado a tu email"
        value={otp}
        onChange={(event) => setOtp(event.target.value)}
        maxLength={6}
        inputMode="numeric"
      />

      {message ? (
        <p
          className={
            message.type === 'success' ? 'text-sm text-success' : 'text-sm text-error'
          }
          role="alert"
        >
          {message.text}
        </p>
      ) : null}

      <p className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="button" disabled={!canSubmit || loading} onClick={() => void submit()}>
          {loading ? 'Vinculando…' : 'Vincular'}
        </Button>
      </p>
    </section>
  )
}
