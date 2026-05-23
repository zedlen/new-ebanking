import { useEffect, useState } from 'react'
import { authService } from '@/api/services/authService'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Spinner } from '@/shared/components/Spinner'

type OtpStatus = 'idle' | 'valid' | 'invalid'

export function EnrollOtpPanel() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [qrSrc, setQrSrc] = useState('')
  const [thalosUserId, setThalosUserId] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<OtpStatus>('idle')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const result = await authService.enrollOtp()
      setLoading(false)

      if (!result) {
        setError(true)
        return
      }

      if (typeof result === 'string') {
        setQrSrc(`data:image/png;base64,${result}`)
        return
      }

      if (result.qrcode) {
        setQrSrc(
          result.qrcode.startsWith('data:')
            ? result.qrcode
            : `data:image/png;base64,${result.qrcode}`,
        )
      }
      if (result.id) setThalosUserId(result.id)
    }

    void load()
  }, [])

  const validate = async () => {
    const ok = await authService.validateOtp(code, thalosUserId || undefined)
    setStatus(ok ? 'valid' : 'invalid')
  }

  if (loading) {
    return (
      <p className="flex justify-center py-8">
        <Spinner label="Generando código QR…" />
      </p>
    )
  }

  if (error) {
    return (
      <section className="max-w-md space-y-2 text-sm text-neutral">
        <p>No se pudo generar el código OTP.</p>
        <p>
          Es posible que ya tengas uno configurado. Si el problema continúa, contacta a
          soporte.
        </p>
      </section>
    )
  }

  return (
    <section className="flex max-w-md flex-col gap-4">
      <p className="text-sm text-neutral">
        Escanea el código con tu aplicación autenticadora y valida el primer código
        generado.
      </p>

      {qrSrc ? (
        <img
          src={qrSrc}
          alt="Código QR para autenticación de dos factores"
          className="mx-auto size-[260px] rounded-lg border border-border bg-white p-2"
        />
      ) : null}

      <Input
        label="Código OTP"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        maxLength={6}
        inputMode="numeric"
        autoComplete="one-time-code"
      />

      {status === 'valid' ? (
        <p className="text-sm text-success">El código es válido.</p>
      ) : null}
      {status === 'invalid' ? (
        <p className="text-sm text-error">
          El código no es válido. Verifica que no haya expirado.
        </p>
      ) : null}

      <Button type="button" disabled={code.length < 6} onClick={() => void validate()}>
        Validar código
      </Button>
    </section>
  )
}
