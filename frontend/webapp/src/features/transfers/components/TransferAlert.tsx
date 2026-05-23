interface TransferAlertProps {
  type: 'error' | 'success'
  title: string
  message?: string
  onDismiss?: () => void
}

export function TransferAlert({ type, title, message, onDismiss }: TransferAlertProps) {
  const styles =
    type === 'error'
      ? 'border-error/40 bg-error/10 text-error'
      : 'border-success/40 bg-success/10 text-success'

  return (
    <aside
      className={`mb-4 rounded-lg border px-4 py-3 text-sm ${styles}`}
      role="alert"
    >
      <p className="font-semibold">{title}</p>
      {message ? <p className="mt-1 opacity-90">{message}</p> : null}
      {onDismiss ? (
        <button
          type="button"
          className="mt-2 text-xs underline"
          onClick={onDismiss}
        >
          Cerrar
        </button>
      ) : null}
    </aside>
  )
}
