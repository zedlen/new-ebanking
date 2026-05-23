import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { authService } from '@/api/services/authService'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { paths } from '@/shared/constants/paths'

const schema = z.object({
  email: z.email('Correo inválido'),
})

type RecoverForm = z.infer<typeof schema>

export function RecoverPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RecoverForm>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const onSubmit = async (values: RecoverForm) => {
    setLoading(true)
    const ok = await authService.recoverPassword(values.email)
    setLoading(false)
    if (ok) setSent(true)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <img
          src="/brand/zeuspay-logo.svg"
          alt="ZeusPay"
          className="mb-8 h-10 w-auto"
        />
        <h1 className="mb-2 text-2xl font-semibold">Recuperar contraseña</h1>
        <p className="mb-8 text-neutral">
          {sent
            ? 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.'
            : 'Ingresa el correo asociado a tu cuenta.'}
        </p>

        {!sent && (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              autoComplete="email"
              error={Boolean(errors.email)}
              {...register('email')}
            />
            <Button type="submit" fullWidth disabled={!isValid || loading}>
              {loading ? 'Enviando…' : 'Enviar'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center">
          <Link
            to={paths.login}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
