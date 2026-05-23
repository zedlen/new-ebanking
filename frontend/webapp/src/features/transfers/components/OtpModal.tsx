import { useState, type FormEvent } from 'react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'

interface OtpModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (otp: string) => void | Promise<void>
  loading?: boolean
}

export function OtpModal({ open, onClose, onSubmit, loading = false }: OtpModalProps) {
  const [code, setCode] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!code.trim()) return
    await onSubmit(code.trim())
    setCode('')
  }

  return (
    <Modal open={open} title="Código de seguridad" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <p className="text-sm text-neutral">
          Ingresa el código OTP de tu aplicación autenticadora para confirmar la
          operación.
        </p>
        <Input
          label="Código OTP"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="000000"
          autoComplete="one-time-code"
          inputMode="numeric"
        />
        <p className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!code.trim() || loading}>
            {loading ? 'Procesando…' : 'Confirmar'}
          </Button>
        </p>
      </form>
    </Modal>
  )
}
