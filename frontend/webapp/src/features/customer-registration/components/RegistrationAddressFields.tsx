import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Input } from '@/shared/components/Input'
import type { RegistrationAddress } from '@/shared/types/registration'

interface RegistrationAddressFieldsProps {
  register: UseFormRegister<RegistrationAddress>
  errors: FieldErrors<RegistrationAddress>
}

export function RegistrationAddressFields({
  register,
  errors,
}: RegistrationAddressFieldsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Input
          label="Calle*"
          placeholder="Calle"
          error={Boolean(errors.street)}
          {...register('street')}
        />
      </div>
      <Input
        label="Número exterior*"
        placeholder="Núm. exterior"
        error={Boolean(errors.extNum)}
        {...register('extNum')}
      />
      <Input
        label="Número interior"
        placeholder="Núm. interior"
        error={Boolean(errors.intNum)}
        {...register('intNum')}
      />
      <Input
        label="Código postal*"
        placeholder="Código postal"
        error={Boolean(errors.zipcode)}
        {...register('zipcode')}
      />
      <div className="sm:col-span-2">
        <Input
          label="Colonia*"
          placeholder="Ingresa la colonia"
          error={Boolean(errors.colony)}
          {...register('colony')}
        />
      </div>
    </section>
  )
}
