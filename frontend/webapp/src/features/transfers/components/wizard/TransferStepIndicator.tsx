const STEPS = [
  { id: 1, label: 'Cuenta origen' },
  { id: 2, label: 'Cuenta destino' },
  { id: 3, label: 'Detalle' },
] as const

interface TransferStepIndicatorProps {
  currentStep: 1 | 2 | 3
}

export function TransferStepIndicator({ currentStep }: TransferStepIndicatorProps) {
  return (
    <nav aria-label="Pasos de transferencia" className="mb-8">
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
        {STEPS.map((step, index) => {
          const done = step.id < currentStep
          const active = step.id === currentStep
          return (
            <li key={step.id} className="flex items-center gap-2 sm:flex-1">
              <span
                className={[
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : done
                      ? 'bg-primary/15 text-primary'
                      : 'bg-surface-muted text-neutral',
                ].join(' ')}
              >
                {done ? '✓' : step.id}
              </span>
              <span
                className={[
                  'text-sm font-medium',
                  active ? 'text-foreground' : 'text-neutral',
                ].join(' ')}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 ? (
                <span
                  className="mx-2 hidden h-px flex-1 bg-border sm:block"
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
