import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { authService } from '@/api/services/authService'
import { ChangePasswordForm } from '@/features/profile/components/ChangePasswordForm'
import { EnrollOtpPanel } from '@/features/profile/components/EnrollOtpPanel'
import { OtpModal } from '@/features/transfers/components/OtpModal'
import { TransferAlert } from '@/features/transfers/components/TransferAlert'
import { Button } from '@/shared/components/Button'
import { Modal } from '@/shared/components/Modal'
import { ProfilePageSkeleton } from '@/features/profile/components/ProfilePageSkeleton'
import { useSessionStore } from '@/shared/store/sessionStore'
import { getCustomerDisplayName } from '@/shared/utils/customer'
import { formatAddress, formatDate } from '@/shared/utils/format'

const TAXPAYER_TYPE_LABELS: Record<number, string> = {
  1: 'Persona física',
  2: 'Persona moral',
}

export function ProfilePage() {
  const profile = useSessionStore((s) => s.profile)
  const updateProfile = useSessionStore((s) => s.updateProfile)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [enrollOtpOpen, setEnrollOtpOpen] = useState(false)
  const [otpOpen, setOtpOpen] = useState(false)
  const [pendingPassword, setPendingPassword] = useState('')
  const [alert, setAlert] = useState<{
    type: 'error' | 'success'
    title: string
    message?: string
  } | null>(null)

  const meQuery = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const fresh = await authService.getCurrentUser()
      if (fresh) {
        updateProfile(fresh)
      }
      return fresh
    },
    initialData: profile ?? undefined,
    staleTime: 60_000,
  })

  const user = meQuery.data ?? profile

  const startChangePassword = (newPassword: string) => {
    setPendingPassword(newPassword)
    setChangePasswordOpen(false)
    setOtpOpen(true)
  }

  const confirmChangePassword = async (otp: string) => {
    setOtpOpen(false)
    const result = await authService.changePassword(pendingPassword, otp)
    setPendingPassword('')

    if (result.code === 200) {
      setAlert({
        type: 'success',
        title: 'Contraseña actualizada',
        message: 'En tu próximo inicio de sesión deberás usar la nueva contraseña.',
      })
      return
    }

    const messages: Record<number, string> = {
      403: 'El código OTP es incorrecto. Inténtalo de nuevo.',
      500: 'No se pudo actualizar la contraseña. Inténtalo más tarde.',
    }

    setAlert({
      type: 'error',
      title: 'Error en la operación',
      message: messages[result.code] ?? messages[500],
    })
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Mi perfil</h1>
        <p className="text-sm text-neutral">
          Información de tu cuenta y configuración de seguridad.
        </p>
      </header>

      {alert ? (
        <TransferAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onDismiss={() => setAlert(null)}
        />
      ) : null}

      {meQuery.isLoading && !user ? (
        <ProfilePageSkeleton />
      ) : !user ? (
        <p className="rounded-lg border border-border bg-surface-muted px-6 py-12 text-center text-neutral">
          No se pudo cargar tu información de perfil.
        </p>
      ) : (
        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-border p-6">
            <div className="mb-4 flex items-center gap-4">
              {user.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="h-14 w-14 rounded-full border border-border object-cover"
                />
              ) : null}
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {getCustomerDisplayName(user)}
                </h2>
                <p className="text-sm text-neutral">{user.username}</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-neutral">Usuario: </span>
                <span className="font-medium">{user.username}</span>
              </li>
              <li>
                <span className="text-neutral">Correo: </span>
                {user.email || user.contact_email || '—'}
              </li>
              <li>
                <span className="text-neutral">Teléfono: </span>
                {user.contact_tel || '—'}
              </li>
              <li>
                <span className="text-neutral">RFC: </span>
                {user.rfc || '—'}
              </li>
              <li>
                <span className="text-neutral">Tipo de contribuyente: </span>
                {TAXPAYER_TYPE_LABELS[user.taxpayer_type_id] ??
                  String(user.taxpayer_type_id)}
              </li>
              <li>
                <span className="text-neutral">ID cliente: </span>
                {user.external_id || user.customer_id}
              </li>
              <li>
                <span className="text-neutral">Domicilio: </span>
                {formatAddress(user.address)}
              </li>
              <li>
                <span className="text-neutral">Registro: </span>
                {formatDate(user.creation_date)}
              </li>
            </ul>
          </article>

          <article className="rounded-lg border border-border p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Seguridad</h2>
            <p className="mb-4 text-sm text-neutral">
              Administra tu contraseña y la autenticación de dos factores (OTP).
            </p>
            <p className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={() => setChangePasswordOpen(true)}>
                Cambiar contraseña
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEnrollOtpOpen(true)}
              >
                Configurar OTP
              </Button>
            </p>
          </article>
        </section>
      )}

      <Modal
        open={changePasswordOpen}
        title="Cambio de contraseña"
        onClose={() => setChangePasswordOpen(false)}
      >
        <ChangePasswordForm
          onCancel={() => setChangePasswordOpen(false)}
          onSubmit={startChangePassword}
        />
      </Modal>

      <Modal
        open={enrollOtpOpen}
        title="Configurar OTP"
        onClose={() => setEnrollOtpOpen(false)}
      >
        <EnrollOtpPanel />
      </Modal>

      <OtpModal
        open={otpOpen}
        onClose={() => {
          setOtpOpen(false)
          setPendingPassword('')
        }}
        onSubmit={confirmChangePassword}
      />
    </section>
  )
}
