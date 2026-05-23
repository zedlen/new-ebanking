import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '@/api/services/authService'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Spinner } from '@/shared/components/Spinner'
import { paths } from '@/shared/constants/paths'
import { generateRsaKeyPair } from '@/shared/utils/crypto'
import {
  selectIsAuthenticated,
  useSessionStore,
} from '@/shared/store/sessionStore'

const loginSchema = z.object({
  username: z.string().min(1, 'Usuario requerido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

type LoginForm = z.infer<typeof loginSchema>

const LOGIN_ERRORS: Record<number, string> = {
  401: 'Usuario o contraseña incorrectos. Verifica tus datos o recupera tu contraseña.',
  409: 'Hay una sesión activa. Espera a que termine o fuerza el cierre.',
  500: 'No pudimos procesar tu solicitud. Intenta más tarde.',
  502: 'Inicio de sesión correcto, pero no pudimos cargar tu perfil. Intenta de nuevo.',
}

export function LoginPage() {
  const navigate = useNavigate()
  const isAuthenticated = useSessionStore(selectIsAuthenticated)
  const profile = useSessionStore((s) => s.profile)
  const setSession = useSessionStore((s) => s.setSession)
  const isHydrated = useSessionStore((s) => s.isHydrated)

  const [loading, setLoading] = useState(false)
  const [errorCode, setErrorCode] = useState<number | null>(null)
  const [sessionConflict, setSessionConflict] = useState<{
    ip: string
    agent: string
    credentials: LoginForm
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    if (isHydrated && isAuthenticated && profile?.customer_id) {
      navigate(paths.accounts(profile.customer_id), { replace: true })
    }
  }, [isHydrated, isAuthenticated, profile, navigate])

  const completeLogin = async (values: LoginForm, forced = false) => {
    setLoading(true)
    setErrorCode(null)

    try {
      const { publicKey, privateKey } = await generateRsaKeyPair()
      const result = await authService.login({
        username: values.username,
        password: values.password,        
        pbk: publicKey,
        forced,
      })

      if (result.sessionConflict) {
        setSessionConflict({
          ip: result.sessionConflict.ip,
          agent: result.sessionConflict.agent,
          credentials: values,
        })
        return
      }

      if (!result.ok) {
        setErrorCode(result.status)
        return
      }

      const token = result.data?.token ?? ''
      const userProfile = await authService.getCurrentUser(token || undefined)
      console.log('User profile:', userProfile)
      if (!userProfile) {
        setErrorCode(502)
        return
      }

      setSession({
        profile: userProfile,
        token,
        encryptionKey: result.data?.key ?? '',
        privateKey,
      })
      navigate(paths.accounts(userProfile.external_id), { replace: true })
    } catch {
      setErrorCode(500)
    } finally {
      setLoading(false)
    }
  }

  if (!isHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner label="Verificando sesión…" />
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="hidden flex-1 items-center justify-center bg-surface-muted p-12 lg:flex">
        <img
          src="/brand/zeuspay-logo.svg"
          alt="ZeusPay"
          className="max-w-md w-full"
        />
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <img
            src="/brand/zeuspay-logo.svg"
            alt="ZeusPay"
            className="mb-8 h-10 w-auto lg:hidden"
          />
          <h1 className="mb-2 text-2xl font-semibold text-foreground">
            Inicio de sesión
          </h1>
          <p className="mb-8 text-neutral">
            Introduce tus datos si ya tienes una cuenta
          </p>

          <form
            className="flex flex-col gap-6"
            onSubmit={handleSubmit((values) => completeLogin(values))}
            noValidate
          >
            <Input
              label="Usuario"
              placeholder="Introduce tu usuario"
              autoComplete="username"
              error={Boolean(errors.username) || errorCode !== null}
              {...register('username')}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="**************"
              autoComplete="current-password"
              error={Boolean(errors.password) || errorCode !== null}
              {...register('password')}
            />

            {errorCode !== null && (
              <p className="text-sm text-error" role="alert">
                {LOGIN_ERRORS[errorCode] ?? LOGIN_ERRORS[401]}
              </p>
            )}

            <Button type="submit" fullWidth disabled={!isValid || loading}>
              {loading ? 'Iniciando…' : 'Iniciar sesión'}
            </Button>
          </form>

          <p className="mt-6 text-center">
            <Link
              to={paths.recoverPassword}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Olvidé mi contraseña
            </Link>
          </p>

          {sessionConflict && (
            <div
              className="mt-8 rounded-lg border border-border bg-surface-muted p-4 text-sm"
              role="alert"
            >
              <p className="font-semibold">Sesión activa detectada</p>
              <p className="mt-2 text-neutral">
                IP: {sessionConflict.ip} · {sessionConflict.agent}
              </p>
              <div className="mt-4 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSessionConflict(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const creds = sessionConflict.credentials
                    setSessionConflict(null)
                    void completeLogin(creds, true)
                  }}
                >
                  Forzar cierre
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-12 text-center text-xs text-neutral">
          Copyright © {new Date().getFullYear()} ZeusPay
        </p>
      </main>
    </div>
  )
}
