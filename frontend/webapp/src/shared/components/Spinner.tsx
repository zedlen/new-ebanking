interface SpinnerProps {
  label?: string
  size?: 'sm' | 'md'
  className?: string
}

const sizeClasses = {
  sm: 'size-5 border',
  md: 'size-8 border-2',
} as const

export function Spinner({
  label = 'Cargando…',
  size = 'md',
  className = '',
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 text-neutral ${className}`.trim()}
    >
      <span
        className={`animate-spin rounded-full border-border border-t-primary ${sizeClasses[size]}`}
      />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  )
}
