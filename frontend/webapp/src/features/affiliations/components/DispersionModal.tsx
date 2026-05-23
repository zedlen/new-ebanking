import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Select } from '@/shared/components/Select'
import type { AffiliationRow } from '@/shared/types/affiliations'
import type { InternalTransferRequest } from '@/shared/types/transfers'

const schema = z.object({
  beneficiaryAccount: z.string().min(1),
  amount: z.string().min(1),
  concept: z.string().min(1).max(40),
})

type FormValues = z.infer<typeof schema>

interface DispersionModalProps {
  rows: AffiliationRow[]
  payerAccountId: string
  currency?: string
  onSubmit: (body: InternalTransferRequest) => void
  onClose: () => void
}

export function DispersionModal({
  rows,
  payerAccountId,
  currency = 'MXN',
  onSubmit,
  onClose,
}: DispersionModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const beneficiaryOptions = rows.map((row) => ({
    value: row.account.clabes?.[0]?.account_id ?? row.id,
    label: `${row.field_name} — ${row.account.clabes?.[0]?.account_id ?? ''}`,
  }))

  return (
    <form
      className="flex max-w-lg flex-col gap-4"
      onSubmit={handleSubmit((values) => {
        onSubmit({
          payer_account: payerAccountId,
          beneficiary_account: values.beneficiaryAccount,
          amount: Number(values.amount),
          concept: values.concept,
          save_beneficiary_account: false,
        })
      })}
    >
      <Select
        label="Cuenta beneficiario*"
        value={watch('beneficiaryAccount') ?? ''}
        options={[{ value: '', label: 'Seleccionar' }, ...beneficiaryOptions]}
        onChange={(value) =>
          setValue('beneficiaryAccount', value, { shouldValidate: true })
        }
      />
      {errors.beneficiaryAccount ? (
        <p className="text-sm text-error">Selecciona un beneficiario</p>
      ) : null}

      <Input
        label={`Monto (${currency})*`}
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

      <p className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!isValid}>
          Continuar
        </Button>
      </p>
    </form>
  )
}
