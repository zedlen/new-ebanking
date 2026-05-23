import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { speiService } from '@/api/services/speiService'
import { transfersService } from '@/api/services/transfersService'
import { customersService } from '@/api/services/customersService'
import { useAccountDetails } from '@/features/accounts/context/AccountDetailsContext'
import { OtpModal } from '@/features/transfers/components/OtpModal'
import { SavedTransferModal } from '@/features/transfers/components/SavedTransferModal'
import { TransferAlert } from '@/features/transfers/components/TransferAlert'
import {
  TransferSuccessModal,
  type TransferSuccessData,
} from '@/features/transfers/components/TransferSuccessModal'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import {
  APP_BRAND,
  DEFAULT_BENEFICIARY_RFC,
} from '@/shared/constants/banking'
import { useBanks } from '@/shared/hooks/useBanks'
import { useTransferStore } from '@/shared/store/transferStore'
import type { TransferFavorite } from '@/shared/types/transfers'
import { getTransferErrorMessage } from '@/shared/utils/transferErrors'

const paymentOptions = [
  { value: '2', label: `Traspaso cuenta ${APP_BRAND.transferName}` },
  { value: '1', label: 'SPEI' },
]

const transferSchema = z.object({
  paymentType: z.enum(['1', '2']),
  beneficiaryName: z.string().min(1, 'Requerido'),
  beneficiaryEmail: z.string().optional(),
  beneficiaryAccount: z.string().min(1, 'Requerido'),
  numericalReference: z.string().min(1, 'Requerido'),
  beneficiaryNickname: z.string().optional(),
  amount: z.string().min(1, 'Requerido'),
  concept: z.string().min(1, 'Requerido').max(40),
  beneficiaryBank: z.string().min(1, 'Requerido'),
  beneficiaryUid: z.string().optional(),
})

type TransferFormValues = z.infer<typeof transferSchema>

export function ThirdPartyTransferForm() {
  const { account, customerId, refetchAccount } = useAccountDetails()
  const banks = useBanks()
  const selectedFavorite = useTransferStore((s) => s.selectedFavorite)
  const clearSelectedFavorite = useTransferStore((s) => s.clearSelectedFavorite)
  const dispersionPrefill = useTransferStore((s) => s.dispersionPrefill)
  const setDispersionPrefill = useTransferStore((s) => s.setDispersionPrefill)

  const [favorites, setFavorites] = useState<TransferFavorite[]>([])
  const [lockedFavorite, setLockedFavorite] = useState<TransferFavorite | null>(null)
  const [saveAccount, setSaveAccount] = useState(false)
  const [pendingSave, setPendingSave] = useState(false)
  const [otpOpen, setOtpOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{
    type: 'error' | 'success'
    title: string
    message?: string
  } | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const [savedOpen, setSavedOpen] = useState(false)
  const [successData, setSuccessData] = useState<TransferSuccessData | null>(null)
  const [formSnapshot, setFormSnapshot] = useState<TransferFormValues | null>(null)

  const clabe = account?.clabes?.[0]?.clabe ?? ''
  const payerAccountId =
    account?.clabes?.[0]?.account_id ?? account?.external_id ?? account?.id ?? ''
  const accountIdForSpei = account?.external_id ?? account?.id ?? ''

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    mode: 'onChange',
    defaultValues: {
      paymentType: '2',
      beneficiaryName: '',
      beneficiaryEmail: '',
      beneficiaryAccount: '',
      numericalReference: '',
      beneficiaryNickname: '',
      amount: '',
      concept: '',
      beneficiaryBank: APP_BRAND.displayName,
      beneficiaryUid: '',
    },
  })

  const paymentType = watch('paymentType')
  const isSpei = paymentType === '1'

  const bankOptions = useMemo(
    () => [
      { value: '', label: 'Selecciona una institución' },
      ...banks.map((bank) => ({
        value: bank.legalCode,
        label: bank.name,
      })),
    ],
    [banks],
  )

  useEffect(() => {
    if (!customerId) return
    void customersService.getFavorites(customerId).then(setFavorites)
  }, [customerId])

  useEffect(() => {
    if (!selectedFavorite) return
    applyFavorite(selectedFavorite)
    clearSelectedFavorite()
  }, [selectedFavorite])

  useEffect(() => {
    if (!dispersionPrefill) return
    setValue('paymentType', '2', { shouldValidate: true })
    setValue('beneficiaryName', dispersionPrefill.beneficiaryName, {
      shouldValidate: true,
    })
    setValue('beneficiaryEmail', dispersionPrefill.beneficiaryEmail ?? '', {
      shouldValidate: true,
    })
    setValue('beneficiaryAccount', dispersionPrefill.beneficiaryAccount, {
      shouldValidate: true,
    })
    setValue('beneficiaryBank', APP_BRAND.displayName, { shouldValidate: true })
    setDispersionPrefill(null)
  }, [dispersionPrefill, setValue, setDispersionPrefill])

  const applyFavorite = (fav: TransferFavorite) => {
    setLockedFavorite(fav)
    setValue('paymentType', fav.account_type === '1' ? '1' : '2', {
      shouldValidate: true,
    })
    setValue('beneficiaryName', fav.beneficiary_name, { shouldValidate: true })
    setValue('beneficiaryEmail', fav.beneficiary_email ?? '', { shouldValidate: true })
    setValue('beneficiaryAccount', fav.account_id, { shouldValidate: true })
    if (fav.account_type === '1') {
      detectBankFromAccount(fav.account_id)
    } else {
      setValue('beneficiaryBank', APP_BRAND.displayName, { shouldValidate: true })
    }
  }

  const detectBankFromAccount = (accountNumber: string) => {
    const cleared = accountNumber.replace(/\s/g, '')
    if (cleared.length < 3) return
    const prefix = cleared.substring(0, 3)
    const bank = banks.find((item) => item.legalCode === prefix)
    if (bank) {
      setValue('beneficiaryBank', bank.legalCode, { shouldValidate: true })
    }
  }

  const onPaymentTypeChange = (value: string) => {
    setValue('paymentType', value as '1' | '2', { shouldValidate: true })
    if (value === '2') {
      setValue('beneficiaryBank', APP_BRAND.displayName, { shouldValidate: true })
    } else if (watch('beneficiaryBank') === APP_BRAND.displayName) {
      setValue('beneficiaryBank', '', { shouldValidate: true })
    }
  }

  const onFavoritePick = (favoriteId: string) => {
    if (!favoriteId) {
      setLockedFavorite(null)
      return
    }
    const fav = favorites.find((item) => item.account_id === favoriteId)
    if (fav) applyFavorite(fav)
  }

  const openOtpFlow = handleSubmit((data) => {
    if (saveAccount && !data.beneficiaryNickname?.trim()) {
      setAlert({
        type: 'error',
        title: 'Alias requerido',
        message: 'Indica un alias para guardar la cuenta destino.',
      })
      return
    }
    setFormSnapshot(data)
    setOtpOpen(true)
  })

  const executeTransfer = async (otp: string, values: TransferFormValues) => {
    setOtpOpen(false)
    setLoading(true)
    setAlert(null)

    const amount = Number(values.amount)
    const paymentTypeLabel =
      values.paymentType === '1'
        ? 'SPEI'
        : `Traspaso cuenta ${APP_BRAND.transferName}`

    let result
    if (values.paymentType === '1') {
      const body = {
        concept: values.concept,
        beneficiary_account: values.beneficiaryAccount,
        beneficiary_bank: values.beneficiaryBank,
        beneficiary_name: values.beneficiaryName,
        beneficiary_uid: values.beneficiaryUid || DEFAULT_BENEFICIARY_RFC,
        beneficiary_account_type: 40,
        beneficiary_email: values.beneficiaryEmail,
        payer_account: clabe,
        amount,
        numerical_reference: Number(values.numericalReference),
        save_beneficiary_account: saveAccount,
        alias_beneficiary_account: values.beneficiaryNickname,
        account_id: accountIdForSpei,
      }
      result = pendingSave
        ? await speiService.saveSpei(body, otp)
        : await speiService.sendSpei(body, otp)
    } else {
      result = await transfersService.sendTransfer(
        {
          payer_account: payerAccountId,
          beneficiary_account: values.beneficiaryAccount,
          amount,
          concept: values.concept,
          save_beneficiary_account: saveAccount,
          alias_beneficiary_account: values.beneficiaryNickname,
        },
        otp,
      )
    }

    const wasPendingSave = pendingSave
    setLoading(false)
    setPendingSave(false)

    if (result.code === 500) {
      setAlert({
        type: 'error',
        title: 'Error en la operación',
        message: getTransferErrorMessage(result.message),
      })
      return
    }

    void refetchAccount()

    if (wasPendingSave && values.paymentType === '1') {
      setSavedOpen(true)
      resetForm()
      return
    }

    setSuccessData({
      amount,
      concept: values.concept,
      reference: values.numericalReference,
      beneficiaryName: values.beneficiaryName,
      beneficiaryAccount: values.beneficiaryAccount,
      paymentTypeLabel,
      currency: account?.currency,
    })
    setSuccessOpen(true)
    resetForm()
  }

  const resetForm = () => {
    setLockedFavorite(null)
    setSaveAccount(false)
    reset({
      paymentType: '2',
      beneficiaryName: '',
      beneficiaryEmail: '',
      beneficiaryAccount: '',
      numericalReference: '',
      beneficiaryNickname: '',
      amount: '',
      concept: '',
      beneficiaryBank: APP_BRAND.displayName,
      beneficiaryUid: '',
    })
  }

  const favoriteLocked = Boolean(lockedFavorite)

  return (
    <section className="w-full">
      {alert ? (
        <TransferAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onDismiss={() => setAlert(null)}
        />
      ) : null}

      {loading ? (
        <p className="mb-4 text-sm text-neutral">Procesando transferencia…</p>
      ) : null}

      <form
        id="third-party-transfer-form"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault()
          setPendingSave(false)
          void openOtpFlow()
        }}
      >
        {favorites.length > 0 ? (
          <Select
            label="Cuenta favorita"
            value={lockedFavorite?.account_id ?? ''}
            options={[
              { value: '', label: 'Nueva cuenta' },
              ...favorites.map((fav) => ({
                value: fav.account_id,
                label: `${fav.beneficiary_name} — ${fav.account_id}`,
              })),
            ]}
            onChange={onFavoritePick}
            placeholder="Nueva cuenta"
          />
        ) : null}

        <Select
          label="Tipo de operación*"
          value={paymentType}
          options={paymentOptions}
          onChange={onPaymentTypeChange}
          placeholder="Seleccionar"
        />

        <Input
          label="Nombre beneficiario*"
          disabled={favoriteLocked}
          error={Boolean(errors.beneficiaryName)}
          {...register('beneficiaryName')}
        />

        <Input
          label="Email beneficiario"
          type="email"
          disabled={favoriteLocked}
          {...register('beneficiaryEmail')}
        />

        <Input
          label="Cuenta beneficiaria*"
          disabled={favoriteLocked}
          error={Boolean(errors.beneficiaryAccount)}
          {...register('beneficiaryAccount', {
            onChange: (event) => {
              if (isSpei) detectBankFromAccount(event.target.value)
            },
          })}
        />

        <Input
          label="Referencia*"
          error={Boolean(errors.numericalReference)}
          {...register('numericalReference')}
        />

        <Input
          label="Alias cuenta beneficiario"
          disabled={favoriteLocked}
          error={saveAccount && !watch('beneficiaryNickname')}
          {...register('beneficiaryNickname')}
        />

        <label className="flex items-center gap-2 text-sm text-neutral sm:col-span-2 lg:col-span-3">
          <input
            type="checkbox"
            checked={saveAccount}
            onChange={(event) => setSaveAccount(event.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          ¿Guardar cuenta destino?
        </label>

        <Input
          label="Importe*"
          type="number"
          min={0}
          step="0.01"
          error={Boolean(errors.amount)}
          {...register('amount')}
        />

        <Input
          label="Concepto*"
          maxLength={40}
          error={Boolean(errors.concept)}
          {...register('concept')}
        />

        {isSpei ? (
          <Select
            label="Banco destino*"
            value={watch('beneficiaryBank')}
            options={bankOptions}
            onChange={(value) =>
              setValue('beneficiaryBank', value, { shouldValidate: true })
            }
          />
        ) : (
          <Input
            label="Institución destino*"
            value={APP_BRAND.displayName}
            disabled
            readOnly
          />
        )}

        <Input
          label="RFC beneficiario"
          placeholder={DEFAULT_BENEFICIARY_RFC}
          maxLength={13}
          {...register('beneficiaryUid')}
        />
      </form>

      <p className="mt-6 flex flex-wrap justify-end gap-3">
        {isSpei ? (
          <Button
            type="button"
            variant="secondary"
            disabled={!isValid || loading}
            onClick={() => {
              setPendingSave(true)
              void openOtpFlow()
            }}
          >
            Guardar en pendientes
          </Button>
        ) : null}
        <Button type="submit" disabled={!isValid || loading}>
          Transferir
        </Button>
      </p>

      <OtpModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        loading={loading}
        onSubmit={async (otp) => {
          if (!formSnapshot) return
          await executeTransfer(otp, formSnapshot)
        }}
      />

      <TransferSuccessModal
        open={successOpen}
        data={successData}
        onClose={() => setSuccessOpen(false)}
      />

      <SavedTransferModal open={savedOpen} onClose={() => setSavedOpen(false)} />
    </section>
  )
}
