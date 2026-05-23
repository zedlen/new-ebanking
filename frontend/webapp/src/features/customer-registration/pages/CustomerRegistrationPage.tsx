import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrationService } from '@/api/services/registrationService'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { DataTable } from '@/shared/components/DataTable'
import { Input } from '@/shared/components/Input'
import { paths } from '@/shared/constants/paths'
import type { PendingRegistration } from '@/shared/types/registration'
import { formatDate } from '@/shared/utils/format'

function contactUsername(row: PendingRegistration): string {
  const local = row.email.split('@')[0]
  return local || row.contactName
}

export function CustomerRegistrationPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const pending = useMemo(() => {
    void refreshKey
    return registrationService.listPending()
  }, [refreshKey])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return pending
    return pending.filter((row) => {
      const haystack = [row.displayName, row.contactName, row.email, contactUsername(row)]
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [pending, search])

  const handleApprove = (id: string) => {
    registrationService.updateStatus(id, 'approved')
    setRefreshKey((value) => value + 1)
  }

  const handleReject = (id: string) => {
    registrationService.updateStatus(id, 'rejected')
    setRefreshKey((value) => value + 1)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Altas de clientes</h1>
          <p className="text-sm text-neutral">
            Solicitudes pendientes de aprobación. El backend de altas aún no está
            disponible; las capturas se guardan localmente en este navegador.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate(paths.legalEntityRegistration)}>
            Persona moral
          </Button>
          <Button variant="secondary" onClick={() => navigate(paths.naturalPersonRegistration)}>
            Persona física
          </Button>
        </div>
      </header>

      <section className="rounded-lg border border-border p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">Altas pendientes</h2>
          <div className="w-full max-w-sm">
            <Input
              label="Buscar"
              placeholder="Nombre, correo o contacto"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <DataTable<PendingRegistration>
          data={filtered}
          emptyMessage="No hay altas pendientes. Usa «Persona moral» o «Persona física» para registrar una."
          getRowKey={(row) => row.id}
          columns={[
            {
              id: 'type',
              header: 'Tipo',
              cell: (row) => (
                <Badge
                  label={row.type === 'legal_entity' ? 'Moral' : 'Física'}
                  tone="neutral"
                />
              ),
            },
            {
              id: 'name',
              header: 'Nombre cliente',
              cell: (row) => (
                <Link
                  to={
                    row.type === 'legal_entity'
                      ? paths.legalEntityRegistration
                      : paths.naturalPersonRegistration
                  }
                  className="font-medium text-primary hover:underline"
                >
                  {row.displayName}
                </Link>
              ),
            },
            {
              id: 'user',
              header: 'Usuario',
              cell: (row) => contactUsername(row),
            },
            {
              id: 'email',
              header: 'Correo electrónico',
              cell: (row) => row.email,
            },
            {
              id: 'date',
              header: 'Fecha',
              cell: (row) => formatDate(row.createdAt),
            },
            {
              id: 'actions',
              header: 'Aprobar cliente',
              cell: (row) => (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    className="!px-3 !py-1.5 text-sm"
                    onClick={() => handleApprove(row.id)}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="secondary"
                    className="!px-3 !py-1.5 text-sm"
                    onClick={() => handleReject(row.id)}
                  >
                    Rechazar
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </section>
    </section>
  )
}
