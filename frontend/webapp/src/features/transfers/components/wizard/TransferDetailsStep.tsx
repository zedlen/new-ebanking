import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { APP_BRAND, DEFAULT_BENEFICIARY_RFC } from '@/shared/constants/banking'
import type { TransferWizardDraft } from '@/features/transfers/types/wizard'
import type { TransferDetailsFieldErrors } from '@/shared/utils/transferValidation'
import {
  TRANSFER_CONCEPT_MAX_LENGTH,
  TRANSFER_REFERENCE_MAX_LENGTH,
  hasTransferDetailsErrors,
  sanitizeConceptInput,
  sanitizeReferenceInput,
  validateTransferDetails,
} from '@/shared/utils/transferValidation'

interface TransferDetailsStepProps {
  draft: TransferWizardDraft
  errors: TransferDetailsFieldErrors
  loading: boolean
  onChange: (patch: Partial<TransferWizardDraft>) => void
  onErrorsChange: (errors: TransferDetailsFieldErrors) => void
  onBack: () => void
  onSubmit: (pendingSave: boolean) => void
}

export function TransferDetailsStep({
  draft,
  errors,
  loading,
  onChange,
  onErrorsChange,
  onBack,
  onSubmit,
}: TransferDetailsStepProps) {
  const isSpei = draft.paymentType === '1'
  const favoriteLocked = Boolean(draft.lockedFavorite)

  const toDetailsDraft = (state: TransferWizardDraft) => ({
    paymentType: state.paymentType,
    beneficiaryAccount: state.beneficiaryAccount,
    beneficiaryBank: state.beneficiaryBank,
    beneficiaryName: state.beneficiaryName,
    beneficiaryEmail: state.beneficiaryEmail,
    beneficiaryUid: state.beneficiaryUid,
    numericalReference: state.numericalReference,
    concept: state.concept,
    amount: state.amount,
    saveAccount: state.saveAccount,
    beneficiaryNickname: state.beneficiaryNickname,
  })

  const revalidate = (next: TransferWizardDraft) => {
    onErrorsChange(validateTransferDetails(toDetailsDraft(next)))
  }

  const patch = (partial: Partial<TransferWizardDraft>) => {
    const next = { ...draft, ...partial }
    onChange(partial)
    revalidate(next)
  }

  const canSubmit = !hasTransferDetailsErrors(
    validateTransferDetails(toDetailsDraft(draft)),
  )

  const handleSubmit = (pendingSave: boolean) => {
    const nextErrors = validateTransferDetails(toDetailsDraft(draft))
    onErrorsChange(nextErrors)
    if (hasTransferDetailsErrors(nextErrors)) return
    onSubmit(pendingSave)
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Detalle de la transferencia</h2>
        <p className="mt-1 text-sm text-neutral">
          {isSpei ? 'Transferencia SPEI' : `Traspaso ${APP_BRAND.transferName}`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nombre beneficiario*"
          value={draft.beneficiaryName}
          disabled={favoriteLocked}
          error={Boolean(errors.beneficiaryName)}
          errorMessage={errors.beneficiaryName}
          onChange={(event) => patch({ beneficiaryName: event.target.value })}
        />

        {isSpei ? (
          <>
            <Input
              label="Email beneficiario"
              type="email"
              value={draft.beneficiaryEmail}
              disabled={favoriteLocked}
              error={Boolean(errors.beneficiaryEmail)}
              errorMessage={errors.beneficiaryEmail}
              onChange={(event) => patch({ beneficiaryEmail: event.target.value })}
            />
            <Input
              label="RFC beneficiario"
              placeholder={DEFAULT_BENEFICIARY_RFC}
              maxLength={13}
              value={draft.beneficiaryUid}
              error={Boolean(errors.beneficiaryUid)}
              errorMessage={errors.beneficiaryUid}
              onChange={(event) =>
                patch({ beneficiaryUid: event.target.value.toUpperCase() })
              }
            />
            <Input
              label="Referencia numérica*"
              value={draft.numericalReference}
              maxLength={TRANSFER_REFERENCE_MAX_LENGTH}
              inputMode="numeric"
              error={Boolean(errors.numericalReference)}
              errorMessage={errors.numericalReference}
              onChange={(event) =>
                patch({ numericalReference: sanitizeReferenceInput(event.target.value) })
              }
            />
          </>
        ) : (
          <Input
            label="Email beneficiario"
            type="email"
            value={draft.beneficiaryEmail}
            disabled={favoriteLocked}
            error={Boolean(errors.beneficiaryEmail)}
            errorMessage={errors.beneficiaryEmail}
            onChange={(event) => patch({ beneficiaryEmail: event.target.value })}
          />
        )}

        <Input
          label="Importe*"
          type="number"
          min={0}
          step="0.01"
          value={draft.amount}
          error={Boolean(errors.amount)}
          errorMessage={errors.amount}
          onChange={(event) => patch({ amount: event.target.value })}
        />

        <Input
          label="Concepto*"
          maxLength={TRANSFER_CONCEPT_MAX_LENGTH}
          value={draft.concept}
          error={Boolean(errors.concept)}
          errorMessage={errors.concept}
          onChange={(event) =>
            patch({ concept: sanitizeConceptInput(event.target.value) })
          }
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral">
        <input
          type="checkbox"
          checked={draft.saveAccount}
          onChange={(event) => {
            const saveAccount = event.target.checked
            patch({
              saveAccount,
              beneficiaryNickname: saveAccount ? draft.beneficiaryNickname : '',
            })
          }}
          className="size-4 rounded border-border"
        />
        ¿Guardar cuenta destino?
      </label>

      {draft.saveAccount ? (
        <Input
          label="Alias cuenta beneficiario*"
          value={draft.beneficiaryNickname}
          disabled={favoriteLocked}
          minLength={3}
          error={Boolean(errors.beneficiaryNickname)}
          errorMessage={errors.beneficiaryNickname}
          onChange={(event) => patch({ beneficiaryNickname: event.target.value })}
        />
      ) : null}

      <p className="flex flex-wrap justify-between gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>
          Atrás
        </Button>
        <span className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={!canSubmit || loading}
            onClick={() => handleSubmit(true)}
          >
            Guardar en pendientes
          </Button>
          <Button
            type="button"
            disabled={!canSubmit || loading}
            onClick={() => handleSubmit(false)}
          >
            {loading ? 'Procesando…' : 'Transferir'}
          </Button>
        </span>
      </p>
    </section>
  )
}
