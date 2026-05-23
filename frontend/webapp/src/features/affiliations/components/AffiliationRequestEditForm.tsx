import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import type { AffiliationRequest } from '@/shared/types/affiliations'

const schema = z.object({
  name: z.string().min(3),
  ap_paterno: z.string().min(2),
  ap_materno: z.string().min(2),
  rfc: z.string().min(10),
  contact_email: z.string().email(),
  contact_tel: z.string().min(10),
  street: z.string().min(1),
  num_ext: z.string().min(1),
  num_int: z.string().optional(),
  neighborhood: z.string().min(1),
  district: z.string().min(1),
  estate: z.string().min(1),
  cp: z.string().min(5),
})

type FormValues = z.infer<typeof schema>

interface AffiliationRequestEditFormProps {
  request: AffiliationRequest
  loading?: boolean
  onClose: () => void
  onSave: (request: AffiliationRequest) => void
}

export function AffiliationRequestEditForm({
  request,
  loading = false,
  onClose,
  onSave,
}: AffiliationRequestEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      name: request.name,
      ap_paterno: request.ap_paterno,
      ap_materno: request.ap_materno,
      rfc: request.rfc,
      contact_email: request.contact_email,
      contact_tel: request.contact_tel,
      street: request.address.street,
      num_ext: request.address.num_ext,
      num_int: request.address.num_int ?? '',
      neighborhood: request.address.neighborhood,
      district: request.address.district,
      estate: request.address.estate,
      cp: request.address.cp,
    },
  })

  return (
    <form
      className="grid max-h-[70vh] gap-4 overflow-y-auto sm:grid-cols-2"
      onSubmit={handleSubmit((values) => {
        onSave({
          ...request,
          name: values.name,
          ap_paterno: values.ap_paterno,
          ap_materno: values.ap_materno,
          rfc: values.rfc,
          contact_email: values.contact_email,
          contact_tel: values.contact_tel,
          address: {
            street: values.street,
            num_ext: values.num_ext,
            num_int: values.num_int,
            neighborhood: values.neighborhood,
            district: values.district,
            estate: values.estate,
            cp: values.cp,
          },
        })
      })}
    >
      <Input label="Nombre*" {...register('name')} />
      <Input label="Apellido paterno*" {...register('ap_paterno')} />
      <Input label="Apellido materno*" {...register('ap_materno')} />
      <Input label="RFC*" {...register('rfc')} />
      <Input label="Email*" type="email" {...register('contact_email')} />
      <Input label="Teléfono*" {...register('contact_tel')} />
      <Input label="Calle*" {...register('street')} />
      <Input label="No. exterior*" {...register('num_ext')} />
      <Input label="No. interior" {...register('num_int')} />
      <Input label="Colonia*" {...register('neighborhood')} />
      <Input label="Municipio*" {...register('district')} />
      <Input label="Estado*" {...register('estate')} />
      <Input label="C.P.*" {...register('cp')} />

      <p className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!isValid || loading}>
          {loading ? 'Guardando…' : 'Guardar'}
        </Button>
      </p>
    </form>
  )
}
