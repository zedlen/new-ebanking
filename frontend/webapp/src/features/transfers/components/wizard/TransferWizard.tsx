import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { customersService } from '@/api/services/customersService'
import { speiService } from '@/api/services/speiService'
import { transfersService } from '@/api/services/transfersService'
import { TransferDestinationStep } from '@/features/transfers/components/wizard/TransferDestinationStep'
import { TransferDetailsStep } from '@/features/transfers/components/wizard/TransferDetailsStep'
import { TransferSourceStep } from '@/features/transfers/components/wizard/TransferSourceStep'
import { TransferStepIndicator } from '@/features/transfers/components/wizard/TransferStepIndicator'
import { TransferConfirmModal } from '@/features/transfers/components/TransferConfirmModal'
import { SavedTransferModal } from '@/features/transfers/components/SavedTransferModal'
import { TransferAlert } from '@/features/transfers/components/TransferAlert'
import {
  TransferSuccessModal,
  type TransferSuccessData,
} from '@/features/transfers/components/TransferSuccessModal'
import { useUserAccounts } from '@/features/transfers/hooks/useUserAccounts'
import {
  emptyTransferDraft,
  type TransferWizardDraft,
} from '@/features/transfers/types/wizard'
import {
  APP_BRAND,
  DEFAULT_BENEFICIARY_RFC,
} from '@/shared/constants/banking'
import { useBanks } from '@/shared/hooks/useBanks'
import { useSessionStore } from '@/shared/store/sessionStore'
import { useTransferStore } from '@/shared/store/transferStore'
import type { TransferFavorite } from '@/shared/types/transfers'
import {
  getAccountClabe,
  getPayerAccountId,
  getSpeiAccountId,
} from '@/shared/utils/transferAccount'
import { getTransferErrorMessage } from '@/shared/utils/transferErrors'
import {
  type TransferDetailsFieldErrors,
  validateTransferDetails,
  hasTransferDetailsErrors,
} from '@/shared/utils/transferValidation'

interface TransferWizardProps {
  initialSourceAccountId?: string | null
  onSourceAccountChange?: (account: TransferWizardDraft['sourceAccount']) => void
}

export function TransferWizard({
  initialSourceAccountId,
  onSourceAccountChange,
}: TransferWizardProps) {
  const profile = useSessionStore((s) => s.profile)
  const banks = useBanks()
  const [searchParams] = useSearchParams()
  const dispersionPrefill = useTransferStore((s) => s.dispersionPrefill)
  const setDispersionPrefill = useTransferStore((s) => s.setDispersionPrefill)
  const selectedFavorite = useTransferStore((s) => s.selectedFavorite)
  const clearSelectedFavorite = useTransferStore((s) => s.clearSelectedFavorite)

  const accountsQuery = useUserAccounts()
  const accounts = accountsQuery.data ?? []

  const customerId = profile?.external_id ?? profile?.id ?? ''

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [draft, setDraft] = useState<TransferWizardDraft>(emptyTransferDraft)
  const [favorites, setFavorites] = useState<TransferFavorite[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingSave, setPendingSave] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{
    type: 'error' | 'success'
    title: string
    message?: string
  } | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const [savedOpen, setSavedOpen] = useState(false)
  const [successData, setSuccessData] = useState<TransferSuccessData | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<TransferDetailsFieldErrors>({})

  const patch = (partial: Partial<TransferWizardDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...partial }
      if (partial.sourceAccount !== undefined) {
        onSourceAccountChange?.(partial.sourceAccount)
      }
      return next
    })
  }

  useEffect(() => {
    onSourceAccountChange?.(draft.sourceAccount)
  }, [draft.sourceAccount, onSourceAccountChange])

  useEffect(() => {
    if (!customerId) return
    void customersService.getFavorites(String(customerId)).then(setFavorites)
  }, [customerId])

  useEffect(() => {
    if (initialized || accountsQuery.isLoading || accounts.length === 0) return

    const fromParam = initialSourceAccountId ?? searchParams.get('fromAccount')
    const matched = fromParam
      ? accounts.find(
          (a) =>
            a.id === fromParam ||
            a.external_id === fromParam ||
            String(a.external_id) === fromParam,
        )
      : null

    const source = matched ?? (accounts.length === 1 ? accounts[0] : null)
    if (source) {
      patch({ sourceAccount: source })
      if (accounts.length === 1 && !dispersionPrefill && !selectedFavorite) {
        setStep(2)
      }
    }
    setInitialized(true)
  }, [
    accounts,
    accountsQuery.isLoading,
    dispersionPrefill,
    initialSourceAccountId,
    initialized,
    searchParams,
    selectedFavorite,
  ])

  useEffect(() => {
    if (!selectedFavorite || !initialized) return
    applyFavorite(selectedFavorite)
    clearSelectedFavorite()
    setStep(2)
  }, [selectedFavorite, initialized])

  useEffect(() => {
    if (!dispersionPrefill || !initialized) return
    patch({
      beneficiaryName: dispersionPrefill.beneficiaryName,
      beneficiaryEmail: dispersionPrefill.beneficiaryEmail ?? '',
      beneficiaryAccount: dispersionPrefill.beneficiaryAccount,
      paymentType: '2',
      beneficiaryBank: APP_BRAND.displayName,
    })
    setDispersionPrefill(null)
    setStep(2)
  }, [dispersionPrefill, initialized, setDispersionPrefill])

  const applyFavorite = (fav: TransferFavorite) => {
    const paymentType = fav.account_type === '1' ? '1' : '2'
    let beneficiaryBank =
      paymentType === '2' ? APP_BRAND.displayName : draft.beneficiaryBank
    if (paymentType === '1') {
      const cleared = fav.account_id.replace(/\s/g, '')
      if (cleared.length >= 3) {
        const prefix = cleared.substring(0, 3)
        const bank = banks.find((item) => item.legalCode === prefix)
        if (bank) beneficiaryBank = bank.legalCode
      }
    }
    patch({
      lockedFavorite: fav,
      beneficiaryName: fav.beneficiary_name,
      beneficiaryEmail: fav.beneficiary_email ?? '',
      beneficiaryAccount: fav.account_id,
      paymentType,
      beneficiaryBank,
    })
  }

  const handleFavoriteSelect = (fav: TransferFavorite | null) => {
    if (!fav) {
      patch({ lockedFavorite: null })
      return
    }
    applyFavorite(fav)
  }

  const openConfirm = (savePending: boolean) => {
    const errors = validateTransferDetails({
      paymentType: draft.paymentType,
      beneficiaryAccount: draft.beneficiaryAccount,
      beneficiaryBank: draft.beneficiaryBank,
      beneficiaryName: draft.beneficiaryName,
      beneficiaryEmail: draft.beneficiaryEmail,
      beneficiaryUid: draft.beneficiaryUid,
      numericalReference: draft.numericalReference,
      concept: draft.concept,
      amount: draft.amount,
      saveAccount: draft.saveAccount,
      beneficiaryNickname: draft.beneficiaryNickname,
    })
    setFieldErrors(errors)
    if (hasTransferDetailsErrors(errors)) {
      setAlert({
        type: 'error',
        title: 'Revisa el formulario',
        message: 'Corrige los campos marcados antes de continuar.',
      })
      return
    }
    setPendingSave(savePending)
    setConfirmOpen(true)
  }

  const executeTransfer = async (otp: string) => {
    if (!draft.sourceAccount) return

    setLoading(true)
    setAlert(null)

    const amount = Number(draft.amount)
    const account = draft.sourceAccount
    const clabe = getAccountClabe(account)
    const payerAccountId = getPayerAccountId(account)
    const accountIdForSpei = getSpeiAccountId(account)

    const paymentTypeLabel =
      draft.paymentType === '1'
        ? 'SPEI'
        : `Traspaso cuenta ${APP_BRAND.transferName}`

    let result
    if (draft.paymentType === '1') {
      const body = {
        concept: draft.concept,
        beneficiary_account: draft.beneficiaryAccount,
        beneficiary_bank: draft.beneficiaryBank,
        beneficiary_name: draft.beneficiaryName,
        beneficiary_uid: draft.beneficiaryUid.trim() || DEFAULT_BENEFICIARY_RFC,
        beneficiary_account_type: 40,
        beneficiary_email: draft.beneficiaryEmail || undefined,
        payer_account: clabe,
        amount,
        numerical_reference: Number(draft.numericalReference),
        save_beneficiary_account: draft.saveAccount,
        alias_beneficiary_account: draft.beneficiaryNickname || undefined,
        account_id: accountIdForSpei,
      }
      result = pendingSave
        ? await speiService.saveSpei(body, otp)
        : await speiService.sendSpei(body, otp)
    } else {
      const body = {
        payer_account: payerAccountId,
        beneficiary_account: draft.beneficiaryAccount,
        amount,
        concept: draft.concept,
        save_beneficiary_account: draft.saveAccount,
        alias_beneficiary_account: draft.beneficiaryNickname || undefined,
      }
      result = pendingSave
        ? await transfersService.saveTransfer(body, otp)
        : await transfersService.sendTransfer(body, otp)
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

    setConfirmOpen(false)

    if (wasPendingSave) {
      setSavedOpen(true)
      setDraft(emptyTransferDraft())
      setStep(1)
      if (accounts.length === 1) {
        patch({ sourceAccount: accounts[0] })
        setStep(2)
      }
      return
    }

    setSuccessData({
      amount,
      concept: draft.concept,
      reference: draft.numericalReference,
      beneficiaryName: draft.beneficiaryName,
      beneficiaryAccount: draft.beneficiaryAccount,
      paymentTypeLabel,
      currency: account.currency,
    })
    setSuccessOpen(true)
    setDraft(emptyTransferDraft())
    setStep(1)
    if (accounts.length === 1) {
      patch({ sourceAccount: accounts[0] })
      setStep(2)
    }
  }

  const autoSelected = accounts.length === 1

  return (
    <section>
      <TransferStepIndicator currentStep={step} />

      {alert ? (
        <TransferAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onDismiss={() => setAlert(null)}
        />
      ) : null}

      {step === 1 ? (
        <TransferSourceStep
          accounts={accounts}
          isLoading={accountsQuery.isLoading}
          selected={draft.sourceAccount}
          onSelect={(account) => patch({ sourceAccount: account })}
          onContinue={() => setStep(2)}
          autoSelected={autoSelected}
        />
      ) : null}

      {step === 2 ? (
        <TransferDestinationStep
          beneficiaryAccount={draft.beneficiaryAccount}
          paymentType={draft.paymentType}
          beneficiaryBank={draft.beneficiaryBank}
          favorites={favorites}
          lockedFavorite={draft.lockedFavorite}
          onAccountChange={(beneficiaryAccount, paymentType, beneficiaryBank) =>
            patch({ beneficiaryAccount, paymentType, beneficiaryBank })
          }
          onFavoriteSelect={handleFavoriteSelect}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      ) : null}

      {step === 3 && draft.sourceAccount ? (
        <TransferDetailsStep
          draft={draft}
          errors={fieldErrors}
          loading={loading}
          onChange={patch}
          onErrorsChange={setFieldErrors}
          onBack={() => setStep(2)}
          onSubmit={openConfirm}
        />
      ) : null}

      <TransferConfirmModal
        open={confirmOpen}
        pendingSave={pendingSave}
        loading={loading}
        draft={draft}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeTransfer}
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
