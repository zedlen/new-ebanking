import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { registrationService } from '@/api/services/registrationService'
import { DocumentChecklist } from '@/features/customer-registration/components/DocumentChecklist'
import { RegistrationAddressFields } from '@/features/customer-registration/components/RegistrationAddressFields'
import {
  naturalPersonSchema,
  type NaturalPersonFormValues,
} from '@/features/customer-registration/schemas'
import { TransferAlert } from '@/features/transfers/components/TransferAlert'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { NATURAL_PERSON_FILES } from '@/shared/constants/registration'
import { paths } from '@/shared/constants/paths'
import type { RegistrationAddress } from '@/shared/types/registration'

export function NaturalPersonRegistrationPage() {
  const navigate = useNavigate()
  const [alert, setAlert] = useState<{
    type: 'success' | 'error'
    title: string
    message?: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NaturalPersonFormValues>({
    resolver: zodResolver(naturalPersonSchema),
    defaultValues: {
      documents: [],
      intNum: '',
      otherFile: '',
    },
  })

  const documents = watch('documents')

  const onSubmit = handleSubmit((values) => {
    registrationService.submitNaturalPerson(values)
    setAlert({
      type: 'success',
      title: 'Solicitud registrada',
      message:
        'La alta quedó en la lista de pendientes. Cuando exista el API de altas, se enviará al backend.',
    })
    setTimeout(() => {
      navigate(paths.customerRegistration)
    }, 1200)
  })

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm text-neutral">
          <Link to={paths.customerRegistration} className="text-primary hover:underline">
            Altas de clientes
          </Link>
        </p>
        <h1 className="text-2xl font-semibold text-foreground">Persona física</h1>
        <p className="text-sm text-neutral">
          Captura los datos y marca los documentos del expediente.
        </p>
      </header>

      {alert ? (
        <TransferAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onDismiss={() => setAlert(null)}
        />
      ) : null}

      <form onSubmit={(event) => void onSubmit(event)} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-lg border border-border p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Datos de captura</h2>
            <div className="space-y-4">
              <Input
                label="Nombre(s)*"
                placeholder="Nombre"
                error={Boolean(errors.name)}
                {...register('name')}
              />
              <Input
                label="RFC*"
                placeholder="UEBD2912SS34A"
                error={Boolean(errors.rfc)}
                {...register('rfc')}
              />
              <RegistrationAddressFields
                register={
                  register as unknown as import('react-hook-form').UseFormRegister<RegistrationAddress>
                }
                errors={errors}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Teléfono de la empresa*"
                  placeholder="Teléfono de la empresa"
                  error={Boolean(errors.companyPhone)}
                  {...register('companyPhone')}
                />
                <Input
                  label="Teléfono de contacto*"
                  placeholder="Teléfono de contacto"
                  error={Boolean(errors.personalPhone)}
                  {...register('personalPhone')}
                />
              </div>
              <Input
                label="Nombre de contacto*"
                placeholder="Nombre de contacto"
                error={Boolean(errors.contactName)}
                {...register('contactName')}
              />
              <Input
                label="Correo electrónico del contacto*"
                placeholder="Correo institucional"
                type="email"
                error={Boolean(errors.email)}
                {...register('email')}
              />
            </div>
          </article>

          <article className="rounded-lg border border-border p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Documentos de expediente
            </h2>
            <DocumentChecklist
              documents={NATURAL_PERSON_FILES}
              selected={documents}
              onChange={(next) =>
                setValue('documents', next, { shouldValidate: true })
              }
              error={errors.documents?.message}
            />
            <div className="mt-4">
              <Input
                label="Especifique el documento"
                placeholder="Otro documento"
                {...register('otherFile')}
              />
            </div>
          </article>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Continuar'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(paths.customerRegistration)}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </section>
  )
}
