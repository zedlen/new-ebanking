import { useMemo, useState } from 'react'
import { Input } from '@/shared/components/Input'
import { APP_BRAND } from '@/shared/constants/banking'
import type { TransferFavorite } from '@/shared/types/transfers'

interface FavoriteSearchFieldProps {
  favorites: TransferFavorite[]
  lockedFavorite: TransferFavorite | null
  onSelect: (favorite: TransferFavorite | null) => void
}

export function FavoriteSearchField({
  favorites,
  lockedFavorite,
  onSelect,
}: FavoriteSearchFieldProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return favorites.slice(0, 8)
    return favorites
      .filter((fav) => {
        const haystack = [
          fav.beneficiary_name,
          fav.account_alias,
          fav.account_id,
          fav.beneficiary_email,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(term)
      })
      .slice(0, 8)
  }, [favorites, query])

  if (favorites.length === 0) return null

  const pick = (fav: TransferFavorite) => {
    onSelect(fav)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative">
      <Input
        label="Buscar favorito"
        placeholder="Nombre, alias o cuenta…"
        value={lockedFavorite ? `${lockedFavorite.beneficiary_name} — ${lockedFavorite.account_id}` : query}
        disabled={Boolean(lockedFavorite)}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          if (!event.target.value.trim()) onSelect(null)
        }}
        onFocus={() => setOpen(true)}
      />
      {lockedFavorite ? (
        <button
          type="button"
          className="mt-1 text-sm font-medium text-primary hover:underline"
          onClick={() => {
            onSelect(null)
            setQuery('')
          }}
        >
          Usar cuenta nueva
        </button>
      ) : null}
      {open && !lockedFavorite && filtered.length > 0 ? (
        <ul
          className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-background py-1 shadow-lg"
          role="listbox"
        >
          {filtered.map((fav) => (
            <li key={fav.account_id}>
              <button
                type="button"
                role="option"
                className="w-full px-3 py-2 text-left text-sm hover:bg-surface-muted"
                onClick={() => pick(fav)}
              >
                <span className="font-medium text-foreground">{fav.beneficiary_name}</span>
                <span className="mt-0.5 block text-xs text-neutral">
                  {fav.account_alias || fav.account_id} ·{' '}
                  {fav.account_type === '1' ? 'SPEI' : APP_BRAND.transferName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
