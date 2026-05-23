interface BadgeProps {
  label: string
  tone?: 'success' | 'warning' | 'error' | 'neutral'
}

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  neutral: 'bg-surface-muted text-neutral',
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {label}
    </span>
  )
}
