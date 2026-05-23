import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import {
  isPasswordValid,
  validatePasswordRules,
} from '@/shared/utils/password'

const schema = z
  .object({
    new_password: z.string().min(8),
    confirm_password: z.string().min(8),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm_password'],
  })

type FormValues = z.infer<typeof schema>

interface ChangePasswordFormProps {
  onSubmit: (newPassword: string) => void
  onCancel: () => void
}

export function ChangePasswordForm({ onSubmit, onCancel }: ChangePasswordFormProps) {
  const [password, setPassword] = useState('')

  const rules = useMemo(() => validatePasswordRules(password), [password])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  return (
    <form
      className="flex max-w-lg flex-col gap-4"
      onSubmit={handleSubmit((values) => onSubmit(values.new_password))}
    >
      <p className="text-sm text-neutral">
        La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un
        carácter especial.
      </p>

      <Input
        label="Nueva contraseña"
        type="password"
        autoComplete="new-password"
        error={Boolean(errors.new_password)}
        {...register('new_password', {
          onChange: (event) => setPassword(event.target.value),
        })}
      />

      <ul className="flex flex-wrap gap-2">
        {[
          { key: 'length', label: 'Mínimo 8 caracteres' },
          { key: 'uppercase', label: 'Letra mayúscula' },
          { key: 'number', label: 'Número' },
          { key: 'special', label: 'Carácter especial' },
        ].map((item) => (
          <li
            key={item.key}
            className={[
              'rounded px-2 py-1 text-xs',
              rules[item.key as keyof typeof rules]
                ? 'bg-success/10 text-success'
                : 'bg-surface-muted text-neutral',
            ].join(' ')}
          >
            {item.label}
          </li>
        ))}
      </ul>

      <Input
        label="Confirmar contraseña"
        type="password"
        autoComplete="new-password"
        error={Boolean(errors.confirm_password)}
        {...register('confirm_password')}
      />
      {errors.confirm_password ? (
        <p className="text-sm text-error">{errors.confirm_password.message}</p>
      ) : null}

      <p className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!isValid || !isPasswordValid(rules)}
        >
          Continuar
        </Button>
      </p>
    </form>
  )
}
