import { useEffect, useState } from 'react'
import { customersService } from '@/api/services/customersService'
import { useAccountDetails } from '@/features/accounts/context/AccountDetailsContext'
import { Button } from '@/shared/components/Button'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { APP_BRAND } from '@/shared/constants/banking'
import { useTransferStore } from '@/shared/store/transferStore'
import type { TransferFavorite } from '@/shared/types/transfers'

interface FavoritesPanelProps {
  onUseFavorite: () => void
}

export function FavoritesPanel({ onUseFavorite }: FavoritesPanelProps) {
  const { customerId } = useAccountDetails()
  const setSelectedFavorite = useTransferStore((s) => s.setSelectedFavorite)
  const [rows, setRows] = useState<TransferFavorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!customerId) return
    void customersService.getFavorites(customerId).then((data) => {
      setRows(data)
      setLoading(false)
    })
  }, [customerId])

  const sendMoney = (fav: TransferFavorite) => {
    setSelectedFavorite(fav)
    onUseFavorite()
  }

  const columns: DataTableColumn<TransferFavorite>[] = [
    {
      id: 'actions',
      header: '',
      cell: (row) => (
        <Button type="button" variant="ghost" onClick={() => sendMoney(row)}>
          Transferir
        </Button>
      ),
    },
    { id: 'alias', header: 'Alias', cell: (row) => row.account_alias || '—' },
    {
      id: 'beneficiary_name',
      header: 'Beneficiario',
      cell: (row) => row.beneficiary_name,
    },
    {
      id: 'account_id',
      header: 'Cuenta',
      cell: (row) => row.account_id,
    },
    {
      id: 'account_type',
      header: 'Tipo',
      cell: (row) =>
        row.account_type === '1' ? 'SPEI' : `Traspaso ${APP_BRAND.transferName}`,
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row) => row.beneficiary_email || '—',
    },
  ]

  return (
    <section>
      <header className="mb-4">
        <h3 className="text-base font-semibold text-foreground">Favoritos</h3>
        <p className="text-sm text-neutral">
          Usa una cuenta guardada para precargar el formulario de transferencia.
        </p>
      </header>

      <DataTable
        columns={columns}
        data={rows}
        getRowKey={(row) => row.account_id}
        emptyMessage="No tienes cuentas favoritas"
        isLoading={loading}
      />
    </section>
  )
}
