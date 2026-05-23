import { useQuery } from '@tanstack/react-query'
import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { accountsService } from '@/api/services/accountsService'
import { affiliationsService } from '@/api/services/affiliationsService'
import { transfersService } from '@/api/services/transfersService'
import { AffiliationDetailPanel } from '@/features/affiliations/components/AffiliationDetailPanel'
import { BulkDispersionModal } from '@/features/affiliations/components/BulkDispersionModal'
import { DispersionModal } from '@/features/affiliations/components/DispersionModal'
import { OtpModal } from '@/features/transfers/components/OtpModal'
import { TransferAlert } from '@/features/transfers/components/TransferAlert'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Modal } from '@/shared/components/Modal'
import { Pagination } from '@/shared/components/Pagination'
import { RefetchIndicator } from '@/shared/components/RefetchIndicator'
import { TableSkeleton } from '@/shared/components/TableSkeleton'
import { APP_BRAND } from '@/shared/constants/banking'
import { paths } from '@/shared/constants/paths'
import { useSessionStore } from '@/shared/store/sessionStore'
import { useTransferStore } from '@/shared/store/transferStore'
import type { AffiliationRow } from '@/shared/types/affiliations'
import type { InternalTransferRequest } from '@/shared/types/transfers'
import { flattenAffiliationRows } from '@/shared/utils/affiliations'
import { getCustomerDisplayName } from '@/shared/utils/customer'
import { formatCurrency } from '@/shared/utils/format'
import { getTransferErrorMessage } from '@/shared/utils/transferErrors'

const PAGE_SIZE = 10

export function AffiliationsListPanel() {
  const navigate = useNavigate()
  const profile = useSessionStore((s) => s.profile)
  const setDispersionPrefill = useTransferStore((s) => s.setDispersionPrefill)

  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailRow, setDetailRow] = useState<AffiliationRow | null>(null)
  const [dispersionOpen, setDispersionOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [otpOpen, setOtpOpen] = useState(false)
  const [payerAccountId, setPayerAccountId] = useState('')
  const [pendingDispersion, setPendingDispersion] = useState<InternalTransferRequest | null>(
    null,
  )
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [alert, setAlert] = useState<{
    type: 'error' | 'success'
    title: string
    message?: string
  } | null>(null)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['affiliations', offset, PAGE_SIZE, search],
    queryFn: () => affiliationsService.list(offset, PAGE_SIZE, search),
  })

  const rows = useMemo(
    () => flattenAffiliationRows(data?.data ?? []),
    [data?.data],
  )

  const loadPayerAccount = async () => {
    const list = await accountsService.list(0, 1)
    const account = list.accounts[0]
    const id = account?.clabes?.[0]?.account_id ?? account?.external_id ?? account?.id
    if (id) setPayerAccountId(id)
    return id ?? ''
  }

  const openDispersion = async () => {
    const payer = await loadPayerAccount()
    if (!payer) {
      setAlert({
        type: 'error',
        title: 'Sin cuenta de origen',
        message: 'No se encontró una cuenta para dispersar.',
      })
      return
    }
    setDispersionOpen(true)
  }

  const submitDispersion = (body: InternalTransferRequest) => {
    setPendingDispersion(body)
    setDispersionOpen(false)
    setOtpOpen(true)
  }

  const submitBulk = async (file: File) => {
    const payer = await loadPayerAccount()
    if (!payer) return
    setBulkFile(file)
    setBulkOpen(false)
    setOtpOpen(true)
  }

  const confirmOtp = async (otp: string) => {
    setOtpOpen(false)

    if (bulkFile) {
      const formData = new FormData()
      formData.append('template', bulkFile)
      formData.append('payerAccount', payerAccountId)
      const result = await transfersService.sendDispersionMassive(formData, otp)
      setBulkFile(null)
      if (result.code === 200) {
        setAlert({
          type: 'success',
          title: 'Dispersiones guardadas',
          message:
            'Las transacciones aparecerán en Pendientes para que las apruebes.',
        })
      } else {
        setAlert({ type: 'error', title: 'Error en dispersión masiva' })
      }
      return
    }

    if (!pendingDispersion) return

    const result = await transfersService.sendDispersion(pendingDispersion, otp)
    setPendingDispersion(null)

    if (result.code === 200) {
      setAlert({ type: 'success', title: 'Dispersión enviada correctamente' })
      return
    }

    setAlert({
      type: 'error',
      title: 'Error en la operación',
      message: getTransferErrorMessage(result.message),
    })
  }

  const sync = async () => {
    setSyncing(true)
    await affiliationsService.sync()
    await refetch()
    setSyncing(false)
    setAlert({ type: 'success', title: 'Afiliaciones sincronizadas' })
  }

  const goToTransfer = async (row: AffiliationRow) => {
    if (!profile?.customer_id) return
    const list = await accountsService.list(0, 1)
    const payer = list.accounts[0]
    if (!payer) return

    setDispersionPrefill({
      beneficiaryName: row.field_name ?? getCustomerDisplayName(row),
      beneficiaryEmail: row.contact_email,
      beneficiaryAccount: row.account.clabes?.[0]?.account_id ?? '',
      paymentType: '2',
    })

    navigate(paths.transfers)
  }

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

      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full max-w-md">
          <Input
            label="Buscar usuarios"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setOffset(0)
            }}
            placeholder="Nombre, RFC, correo…"
          />
        </div>
        <p className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={syncing}
            onClick={() => void sync()}
          >
            {syncing ? 'Sincronizando…' : 'Sync'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => void openDispersion()}>
            Dispersión
          </Button>
          <Button
            type="button"
            onClick={() => void loadPayerAccount().then(() => setBulkOpen(true))}
          >
            Dispersión masiva
          </Button>
        </p>
      </header>

      {isLoading ? (
        <TableSkeleton columns={5} rows={6} />
      ) : (
        <section className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                <th className="px-4 py-3 font-semibold text-neutral">Acciones</th>
                <th className="px-4 py-3 font-semibold text-neutral">Usuario</th>
                <th className="px-4 py-3 font-semibold text-neutral">
                  Cuenta {APP_BRAND.transferName}
                </th>
                <th className="px-4 py-3 font-semibold text-neutral">Teléfono</th>
                <th className="px-4 py-3 font-semibold text-neutral">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const rowId = `${row.id}-${row.account.id}`
                const isExpanded = expandedId === rowId
                return (
                  <Fragment key={rowId}>
                    <tr
                      className="border-b border-border hover:bg-surface-muted/60"
                    >
                      <td className="px-4 py-3">
                        <p className="flex gap-1">
                          <button
                            type="button"
                            className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10"
                            onClick={() => setDetailRow(row)}
                          >
                            Detalle
                          </button>
                          <button
                            type="button"
                            className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10"
                            onClick={() => void goToTransfer(row)}
                          >
                            Transferir
                          </button>
                          {row.cards.length > 0 ? (
                            <button
                              type="button"
                              className="rounded px-2 py-1 text-xs text-neutral hover:bg-surface-muted"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : rowId)
                              }
                            >
                              {isExpanded ? '▾ Tarjetas' : '▸ Tarjetas'}
                            </button>
                          ) : null}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{row.field_name}</p>
                        <p className="text-xs text-neutral">{row.contact_email}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {row.account.clabes?.[0]?.account_id ?? '—'}
                      </td>
                      <td className="px-4 py-3">{row.contact_tel ?? '—'}</td>
                      <td className="px-4 py-3">
                        {formatCurrency(row.account.amount, row.account.currency)}
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr key={`${rowId}-cards`} className="bg-surface-muted/30">
                        <td colSpan={5} className="px-6 py-4">
                          <ul className="flex flex-wrap gap-3">
                            {row.cards.map((card) => (
                              <li
                                key={card.id}
                                className="rounded-lg border border-border bg-background px-3 py-2 text-xs"
                              >
                                <p className="font-mono">{card.masked_pan}</p>
                                <p className="text-neutral">
                                  {card.type} · {card.status}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="px-6 py-12 text-center text-neutral">No hay afiliaciones</p>
          )}
        </section>
      )}

      <RefetchIndicator active={isFetching && !isLoading} />

      {data && data.total > 0 ? (
        <Pagination
          offset={offset}
          limit={PAGE_SIZE}
          total={data.total}
          onChange={setOffset}
        />
      ) : null}

      <Modal
        open={detailRow !== null}
        title="Detalle del cliente"
        onClose={() => setDetailRow(null)}
      >
        {detailRow ? <AffiliationDetailPanel row={detailRow} /> : null}
      </Modal>

      <Modal
        open={dispersionOpen}
        title="Agregar dispersión"
        onClose={() => setDispersionOpen(false)}
      >
        <DispersionModal
          rows={rows}
          payerAccountId={payerAccountId}
          onSubmit={submitDispersion}
          onClose={() => setDispersionOpen(false)}
        />
      </Modal>

      <Modal open={bulkOpen} title="Dispersión masiva" onClose={() => setBulkOpen(false)}>
        <BulkDispersionModal
          onFileSelected={(file) => {
            void submitBulk(file)
          }}
        />
      </Modal>

      <OtpModal
        open={otpOpen}
        onClose={() => {
          setOtpOpen(false)
          setPendingDispersion(null)
          setBulkFile(null)
        }}
        onSubmit={confirmOtp}
      />
    </section>
  )
}
