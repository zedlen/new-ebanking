import { useMemo, useState } from 'react'
import { useBanks } from '@/shared/hooks/useBanks'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { APP_BRAND } from '@/shared/constants/banking'
import type { TransferFavorite } from '@/shared/types/transfers'
import { CLABE_LENGTH, sanitizeClabeInput, validateClabe } from '@/shared/utils/clabe'
import { detectPaymentType, normalizeAccountNumber } from '@/shared/utils/transferType'
import { getBeneficiaryInstitutionLabel } from '@/shared/utils/transferInstitution'
import { validateTransferDestination } from '@/shared/utils/transferValidation'
import { FavoriteSearchField } from '@/features/transfers/components/FavoriteSearchField'

interface TransferDestinationStepProps {
  beneficiaryAccount: string
  paymentType: '1' | '2'
  beneficiaryBank: string
  favorites: TransferFavorite[]
  lockedFavorite: TransferFavorite | null
  onAccountChange: (account: string, paymentType: '1' | '2', bank: string) => void
  onFavoriteSelect: (favorite: TransferFavorite | null) => void
  onBack: () => void
  onContinue: () => void
}

export function TransferDestinationStep({
  beneficiaryAccount,
  paymentType,
  beneficiaryBank,
  favorites,
  lockedFavorite,
  onAccountChange,
  onFavoriteSelect,
  onBack,
  onContinue,
}: TransferDestinationStepProps) {
  const banks = useBanks()
  const isSpei = paymentType === '1'
  const [accountError, setAccountError] = useState<string | null>(null)

  const institutionLabel = getBeneficiaryInstitutionLabel(
    paymentType,
    beneficiaryBank,
    banks,
  )

  const clearedLen = normalizeAccountNumber(beneficiaryAccount).length

  const clabeHint = useMemo(() => {
    if (!isSpei) return null
    if (clearedLen === 0) return null
    if (clearedLen < CLABE_LENGTH) {
      return `Ingresa ${CLABE_LENGTH} dígitos para la CLABE`
    }
    return null
  }, [isSpei, clearedLen])

  const handleAccountInput = (raw: string) => {
    const noSpaces = raw.replace(/\s/g, '')
    const paymentType = detectPaymentType(noSpaces)
    const normalized = paymentType === '1' ? sanitizeClabeInput(raw) : noSpaces

    let bank = paymentType === '2' ? APP_BRAND.displayName : beneficiaryBank
    if (paymentType === '1') {
      if (normalized.length >= 3) {
        const prefix = normalized.substring(0, 3)
        const match = banks.find((item) => item.legalCode === prefix)
        bank = match?.legalCode ?? ''
      } else {
        bank = ''
      }
      setAccountError(
        normalized.length === CLABE_LENGTH ? validateClabe(normalized) : null,
      )
    } else {
      setAccountError(null)
    }

    onAccountChange(normalized, paymentType, bank)
  }

  const handleContinue = () => {
    const error = validateTransferDestination(
      beneficiaryAccount,
      paymentType,
      beneficiaryBank,
    )
    setAccountError(error)
    if (error) return
    onContinue()
  }

  const canContinue =
    clearedLen > 0 &&
    !accountError &&
    (isSpei
      ? clearedLen === CLABE_LENGTH && Boolean(beneficiaryBank && institutionLabel)
      : true)

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Cuenta destino</h2>
        <p className="mt-1 text-sm text-neutral">
          Cuentas de {CLABE_LENGTH} dígitos (CLABE) se envían por SPEI; cualquier otra
          longitud es traspaso {APP_BRAND.transferName}.
        </p>
      </div>

      <FavoriteSearchField
        favorites={favorites}
        lockedFavorite={lockedFavorite}
        onSelect={onFavoriteSelect}
      />

      <Input
        label={isSpei ? 'CLABE beneficiaria*' : 'Cuenta beneficiaria*'}
        value={beneficiaryAccount}
        disabled={Boolean(lockedFavorite)}
        inputMode={isSpei ? 'numeric' : 'text'}
        maxLength={isSpei ? CLABE_LENGTH : undefined}
        error={Boolean(accountError)}
        errorMessage={accountError ?? clabeHint ?? undefined}
        onChange={(event) => handleAccountInput(event.target.value)}
        placeholder={isSpei ? `${CLABE_LENGTH} dígitos` : 'Cuenta ZeusPay'}
      />

      <p className="rounded-md bg-surface-muted px-3 py-2 text-sm text-neutral">
        Tipo detectado:{' '}
        <span className="font-medium text-foreground">
          {isSpei ? 'SPEI' : `Traspaso ${APP_BRAND.transferName}`}
        </span>
      </p>

      <Input
        label="Institución destinataria"
        value={
          institutionLabel ||
          (isSpei && clearedLen === CLABE_LENGTH
            ? 'No se pudo identificar la institución'
            : isSpei
              ? `Se calculará al completar la CLABE (${CLABE_LENGTH} dígitos)`
              : APP_BRAND.displayName)
        }
        disabled
        readOnly
      />

      <p className="flex flex-wrap justify-between gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>
          Atrás
        </Button>
        <Button type="button" disabled={!canContinue} onClick={handleContinue}>
          Continuar
        </Button>
      </p>
    </section>
  )
}
