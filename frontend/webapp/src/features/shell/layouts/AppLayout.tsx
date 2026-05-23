import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '@/api/services/authService'
import { Button } from '@/shared/components/Button'
import { TAXPAYER_TYPE_ID } from '@/shared/constants/banking'
import { paths } from '@/shared/constants/paths'
import { useSessionStore } from '@/shared/store/sessionStore'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-md px-3 py-2.5 transition-colors',
    isActive
      ? 'bg-primary/10 text-primary'
      : 'text-neutral hover:bg-background hover:text-foreground',
  ].join(' ')

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const profile = useSessionStore((s) => s.profile)
  const clearSession = useSessionStore((s) => s.clearSession)
  const [navOpen, setNavOpen] = useState(false)  
  const accountsPath = (profile?.external_id || profile?.id)    
  ? paths.accounts(profile.external_id || profile.id)
    : paths.menu

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!navOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [navOpen])

  const handleLogout = async () => {
    await authService.logout()
    clearSession()
    navigate(paths.login, { replace: true })
  }

  const displayName =
    profile?.name || profile?.contact_name || profile?.username

  const navContent = (
    <>
      <img
        src="/brand/zeuspay-logo.svg"
        alt="ZeusPay"
        className="mb-8 h-8 w-auto lg:mb-10"
      />
      <nav className="flex flex-1 flex-col gap-1 text-sm font-medium">
        <NavLink to={accountsPath} className={navLinkClass}>
          Mis cuentas
        </NavLink>
        <NavLink to={paths.transfers} className={navLinkClass}>
          Transferencias
        </NavLink>
        {profile?.taxpayer_type_id === TAXPAYER_TYPE_ID.LEGAL ? (
          <NavLink to={paths.clients} className={navLinkClass}>
            Mis clientes
          </NavLink>
        ) : null}
        {profile?.taxpayer_type_id === TAXPAYER_TYPE_ID.PHYSICAL ? (
          <NavLink to={paths.cards} className={navLinkClass}>
            Mis tarjetas
          </NavLink>
        ) : null}
        {profile?.taxpayer_type_id === TAXPAYER_TYPE_ID.LEGAL ? (
          <>
            <NavLink to={paths.affiliations} className={navLinkClass}>
              Afiliaciones
            </NavLink>
            <NavLink to={paths.customerRegistration} className={navLinkClass}>
              Altas de clientes
            </NavLink>
          </>
        ) : null}
      </nav>
      <section className="mt-6 border-t border-border pt-4 lg:mt-0">
        <NavLink to={paths.profile} className={navLinkClass}>
          Mi perfil
        </NavLink>
        {displayName ? (
          <p className="mb-3 mt-3 truncate text-xs text-neutral">{displayName}</p>
        ) : null}
        <Button variant="secondary" fullWidth onClick={() => void handleLogout()}>
          Cerrar sesión
        </Button>
      </section>
    </>
  )

  return (
    <section className="flex min-h-dvh">
      {navOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-border bg-surface-muted p-5 transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:p-6',
          navOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="text-sm font-semibold text-foreground">Menú</span>
          <button
            type="button"
            aria-label="Cerrar menú"
            className="rounded-md px-2 py-1 text-lg text-neutral hover:bg-background"
            onClick={() => setNavOpen(false)}
          >
            ×
          </button>
        </div>
        {navContent}
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background px-4 sm:h-16 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menú"
              aria-expanded={navOpen}
              className="rounded-md border border-border px-2.5 py-1.5 text-lg leading-none text-foreground lg:hidden"
              onClick={() => setNavOpen(true)}
            >
              ☰
            </button>
            <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
              ZeusPay
            </h1>
          </div>
          {displayName ? (
            <p className="hidden truncate text-sm text-neutral sm:block">
              Hola,{' '}
              <span className="font-medium text-foreground">{displayName}</span>
            </p>
          ) : null}
        </header>
        <main className="relative flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </section>
    </section>
  )
}
