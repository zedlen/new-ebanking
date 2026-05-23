interface DocumentChecklistProps {
  documents: Record<string, string>
  selected: string[]
  onChange: (selected: string[]) => void
  error?: string
}

export function DocumentChecklist({
  documents,
  selected,
  onChange,
  error,
}: DocumentChecklistProps) {
  const toggle = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...selected, id])
      return
    }
    onChange(selected.filter((item) => item !== id))
  }

  return (
    <section className="space-y-3">
      {Object.entries(documents).map(([id, label]) => (
        <label
          key={id}
          className="flex cursor-pointer items-start gap-3 rounded-md border border-border px-4 py-3 hover:bg-surface-muted"
        >
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-primary"
            checked={selected.includes(id)}
            onChange={(event) => toggle(id, event.target.checked)}
          />
          <span className="text-sm text-foreground">{label}</span>
        </label>
      ))}
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </section>
  )
}
