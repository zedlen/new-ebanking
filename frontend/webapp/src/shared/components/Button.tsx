import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50',
  secondary:
    'bg-surface-muted text-foreground border border-border hover:bg-border/40 disabled:opacity-50',
  ghost: 'text-primary hover:bg-surface-muted disabled:opacity-50',
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold transition-colors cursor-pointer border-0',
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
