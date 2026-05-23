import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: boolean
  errorMessage?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error = false, errorMessage, className = '', id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
    const showError = error || Boolean(errorMessage)

    return (
      <label className="flex w-full flex-col gap-2" htmlFor={inputId}>
        <span className="text-sm font-medium text-neutral">{label}</span>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={showError}
          aria-describedby={errorMessage ? `${inputId}-error` : undefined}
          className={[
            'h-12 w-full rounded-md border bg-background px-4 text-foreground outline-none transition-colors',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            showError ? 'border-error' : 'border-border',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {errorMessage ? (
          <span id={`${inputId}-error`} className="text-sm text-error" role="alert">
            {errorMessage}
          </span>
        ) : null}
      </label>
    )
  },
)

Input.displayName = 'Input'
