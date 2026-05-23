import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { customersService } from '@/api/services/customersService'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Pagination } from '@/shared/components/Pagination'
import { RefetchIndicator } from '@/shared/components/RefetchIndicator'
import { TableSkeleton } from '@/shared/components/TableSkeleton'
import { paths } from '@/shared/constants/paths'
import type { Customer } from '@/shared/types/customer'
import { formatDate } from '@/shared/utils/format'

const PAGE_SIZE = 10

function clientKey(client: Customer): string {
  return client.external_id ?? client.id ?? client.rfc ?? ''
}

export function ClientsPage() {
  const navigate = useNavigate()
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [childRows, setChildRows] = useState<Record<string, Customer[]>>({})
  const [loadingChildren, setLoadingChildren] = useState<string | null>(null)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['clients', offset, PAGE_SIZE],
    queryFn: () => customersService.list(offset, PAGE_SIZE),
  })

  useEffect(() => {
    setExpandedId(null)
    setChildRows({})
  }, [offset])

  const filteredClients = useMemo(() => {
    const rows = data?.data ?? []
    const term = search.trim().toLowerCase()
    if (!term) return rows

    return rows.filter((client) => {
      const haystack = [
        client.field_name,
        client.rfc,
        client.contact_name,
        client.company_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [data?.data, search])

  const toggleExpand = async (client: Customer) => {
    const id = clientKey(client)
    if (!id) return

    if (expandedId === id) {
      setExpandedId(null)
      return
    }

    setExpandedId(id)

    const embedded = client.customers?.data ?? []
    const total = client.customers?.total ?? embedded.length

    if (embedded.length >= total) {
      setChildRows((current) => ({ ...current, [id]: embedded }))
      return
    }

    setLoadingChildren(id)
    const response = await customersService.listByParent(id, 0, PAGE_SIZE)
    setChildRows((current) => ({
      ...current,
      [id]: response.data.length ? response.data : embedded,
    }))
    setLoadingChildren(null)
  }

  const loadMoreChildren = async (parent: Customer) => {
    const parentId = clientKey(parent)
    const current = childRows[parentId] ?? parent.customers?.data ?? []
    const total = parent.customers?.total ?? current.length
    if (current.length >= total) return

    setLoadingChildren(parentId)
    const response = await customersService.listByParent(
      parentId,
      current.length,
      PAGE_SIZE,
    )
    setChildRows((state) => ({
      ...state,
      [parentId]: [...current, ...response.data],
    }))
    setLoadingChildren(null)
  }

  const goToAccounts = (client: Customer) => {
    const id = client.external_id ?? client.id
    if (!id) return
    navigate(paths.clientAccounts(id))
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Mis clientes</h1>
        <RefetchIndicator active={isFetching && !isLoading} />
      </header>

      <section className="space-y-4 rounded-lg border border-border bg-background p-4 sm:p-6">
        <div className="w-full sm:max-w-md">
          <Input
            label="Buscar"
            placeholder="Nombre, RFC…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {isLoading ? (
          <TableSkeleton columns={4} rows={8} />
        ) : filteredClients.length === 0 ? (
          <p className="rounded-lg border border-border bg-surface-muted px-6 py-12 text-center text-neutral">
            No se encontraron clientes
          </p>
        ) : (
          <section className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted">
                <tr>
                  <th className="w-28 px-4 py-3 font-semibold text-neutral">Cuentas</th>
                  <th className="px-4 py-3 font-semibold text-neutral">Nombre</th>
                  <th className="px-4 py-3 font-semibold text-neutral">RFC</th>
                  <th className="px-4 py-3 font-semibold text-neutral">Fecha alta</th>
                  <th className="px-4 py-3 font-semibold text-neutral">
                    Fecha actualización
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const id = clientKey(client)
                  const isExpanded = expandedId === id
                  const children = childRows[id] ?? client.customers?.data ?? []
                  const childTotal = client.customers?.total ?? children.length
                  const hasChildren = childTotal > 0

                  return (
                    <ClientRowsGroup
                      key={id}
                      client={client}
                      isExpanded={isExpanded}
                      hasChildren={hasChildren}
                      children={children}
                      childTotal={childTotal}
                      loadingChildren={loadingChildren === id}
                      onToggle={() => void toggleExpand(client)}
                      onOpenAccounts={goToAccounts}
                      onLoadMore={() => void loadMoreChildren(client)}
                    />
                  )
                })}
              </tbody>
            </table>
          </section>
        )}

        {!search && data && data.total > 0 && (
          <Pagination
            offset={offset}
            limit={PAGE_SIZE}
            total={data.total}
            onChange={setOffset}
          />
        )}
      </section>
    </section>
  )
}

interface ClientRowsGroupProps {
  client: Customer
  isExpanded: boolean
  hasChildren: boolean
  children: Customer[]
  childTotal: number
  loadingChildren: boolean
  onToggle: () => void
  onOpenAccounts: (client: Customer) => void
  onLoadMore: () => void
}

function ClientRowsGroup({
  client,
  isExpanded,
  hasChildren,
  children,
  childTotal,
  loadingChildren,
  onToggle,
  onOpenAccounts,
  onLoadMore,
}: ClientRowsGroupProps) {
  return (
    <>
      <ClientRow
        client={client}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        onToggle={onToggle}
        onOpenAccounts={() => onOpenAccounts(client)}
      />

      {isExpanded &&
        children.map((child) => (
          <ClientRow
            key={clientKey(child)}
            client={child}
            nested
            hasChildren={false}
            isExpanded={false}
            onToggle={onToggle}
            onOpenAccounts={() => onOpenAccounts(child)}
          />
        ))}

      {isExpanded && children.length < childTotal && (
        <tr className="border-b border-border bg-surface-muted/40">
          <td colSpan={5} className="px-4 py-2 pl-12">
            <Button
              type="button"
              variant="ghost"
              disabled={loadingChildren}
              onClick={onLoadMore}
            >
              {loadingChildren ? 'Cargando…' : 'Cargar más subclientes'}
            </Button>
          </td>
        </tr>
      )}
    </>
  )
}

interface ClientRowProps {
  client: Customer
  nested?: boolean
  hasChildren: boolean
  isExpanded: boolean
  onToggle: () => void
  onOpenAccounts: () => void
}

function ClientRow({
  client,
  nested = false,
  hasChildren,
  isExpanded,
  onToggle,
  onOpenAccounts,
}: ClientRowProps) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-surface-muted/60">
      <td className={`px-4 py-3 ${nested ? 'pl-10' : ''}`}>
        <p className="flex items-center gap-1">
          {hasChildren ? (
            <button
              type="button"
              title={isExpanded ? 'Contraer' : 'Expandir'}
              className="rounded-full px-2 py-1 text-neutral hover:bg-surface-muted"
              onClick={onToggle}
              aria-expanded={isExpanded}
            >
              {isExpanded ? '▾' : '▸'}
            </button>
          ) : (
            <span className="inline-block w-7" aria-hidden />
          )}
          <button
            type="button"
            title="Ver cuentas"
            className="rounded-full px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            onClick={onOpenAccounts}
          >
            Cuentas
          </button>
        </p>
      </td>
      <td className="px-4 py-3 font-medium text-foreground">
        {client.field_name ?? '—'}
      </td>
      <td className="px-4 py-3 font-mono text-xs">{client.rfc ?? '—'}</td>
      <td className="px-4 py-3">{formatDate(client.creation_date)}</td>
      <td className="px-4 py-3">{formatDate(client.creation_date)}</td>
    </tr>
  )
}
