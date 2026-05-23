import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { affiliationsService } from '@/api/services/affiliationsService'
import { AffiliationRequestEditForm } from '@/features/affiliations/components/AffiliationRequestEditForm'
import { TransferAlert } from '@/features/transfers/components/TransferAlert'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { Modal } from '@/shared/components/Modal'
import { useSessionStore } from '@/shared/store/sessionStore'
import type { AffiliationRequest } from '@/shared/types/affiliations'
import { formatAffiliationAddress } from '@/shared/utils/affiliations'

function requestStatusBadge(status: string): {
  label: string
  tone: 'warning' | 'success' | 'error' | 'neutral'
} {
  if (status === 'approved') return { label: 'Aprobado', tone: 'success' }
  if (status === 'rejected') return { label: 'Rechazado', tone: 'error' }
  return { label: 'Pendiente', tone: 'warning' }
}

export function AffiliationRequestsPanel() {
  const customerId = useSessionStore((s) => s.profile?.customer_id ?? '')
  const [editing, setEditing] = useState<AffiliationRequest | null>(null)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState<{
    type: 'error' | 'success'
    title: string
    message?: string
  } | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['affiliation-requests', customerId],
    queryFn: () => affiliationsService.getRequests(customerId),
    enabled: Boolean(customerId),
  })

  const approve = async (row: AffiliationRequest) => {
    const result = await affiliationsService.approveRequest(customerId, row.id)
    if (!result.id) {
      setAlert({
        type: 'error',
        title: 'Error en la operación',
        message: result.message,
      })
      return
    }
    setAlert({ type: 'success', title: 'Afiliación aprobada' })
    void refetch()
  }

  const reject = async (row: AffiliationRequest) => {
    const ok = await affiliationsService.rejectRequest(customerId, row.id)
    if (!ok) {
      setAlert({ type: 'error', title: 'No se pudo rechazar la solicitud' })
      return
    }
    setAlert({ type: 'success', title: 'Solicitud rechazada' })
    void refetch()
  }

  const saveEdit = async (request: AffiliationRequest) => {
    setSaving(true)
    const result = await affiliationsService.updateRequest(customerId, request.id, {
      name: request.name,
      ap_paterno: request.ap_paterno,
      ap_materno: request.ap_materno,
      rfc: request.rfc,
      contact_email: request.contact_email,
      contact_tel: request.contact_tel,
      isEnterprise: false,
      address: {
        street: request.address.street,
        num_ext: request.address.num_ext,
        num_int: request.address.num_int,
        reference: request.address.reference,
        neighborhood: request.address.neighborhood,
        district: request.address.district,
        estate: request.address.estate,
        cp: request.address.cp,
      },
    })
    setSaving(false)
    setEditing(null)

    if (result.code !== 200) {
      setAlert({
        type: 'error',
        title: 'Error al guardar',
        message: result.message,
      })
      return
    }

    setAlert({ type: 'success', title: 'Solicitud actualizada' })
    void refetch()
  }

  const columns: DataTableColumn<AffiliationRequest>[] = [
    {
      id: 'actions',
      header: 'Acciones',
      cell: (row) =>
        row.status === 'pending' ? (
          <p className="flex gap-1">
            <Button type="button" variant="ghost" onClick={() => setEditing(row)}>
              Editar
            </Button>
            <Button type="button" variant="ghost" onClick={() => void approve(row)}>
              Aprobar
            </Button>
            <Button type="button" variant="ghost" onClick={() => void reject(row)}>
              Rechazar
            </Button>
          </p>
        ) : (
          '—'
        ),
    },
    { id: 'name', header: 'Nombre', cell: (row) => row.contact_name || row.name },
    { id: 'email', header: 'Correo', cell: (row) => row.contact_email },
    { id: 'rfc', header: 'RFC', cell: (row) => row.rfc },
    {
      id: 'address',
      header: 'Dirección',
      cell: (row) => formatAffiliationAddress(row.address),
    },
    {
      id: 'status',
      header: 'Estatus',
      cell: (row) => {
        const badge = requestStatusBadge(row.status)
        return <Badge label={badge.label} tone={badge.tone} />
      },
    },
  ]

  return (
    <section className="space-y-4">
      {alert ? (
        <TransferAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onDismiss={() => setAlert(null)}
        />
      ) : null}

      <header>
        <h2 className="text-lg font-semibold text-foreground">
          Solicitudes de afiliación
        </h2>
        <p className="text-sm text-neutral">
          Aprueba, rechaza o edita solicitudes recibidas.
        </p>
      </header>

      <DataTable
        columns={columns}
        data={data ?? []}
        getRowKey={(row) => row.id}
        emptyMessage="No tienes solicitudes de afiliación"
        isLoading={isLoading}
      />

      <Modal
        open={editing !== null}
        title="Editar solicitud"
        onClose={() => setEditing(null)}
      >
        {editing ? (
          <AffiliationRequestEditForm
            request={editing}
            loading={saving}
            onClose={() => setEditing(null)}
            onSave={(request) => void saveEdit(request)}
          />
        ) : null}
      </Modal>
    </section>
  )
}
