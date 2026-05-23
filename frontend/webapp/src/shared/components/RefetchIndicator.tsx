interface RefetchIndicatorProps {
  active: boolean
}

/** Thin progress bar shown while a query refetches in the background. */
export function RefetchIndicator({ active }: RefetchIndicatorProps) {
  if (!active) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Actualizando datos"
      className="h-0.5 w-full overflow-hidden rounded-full bg-primary/15"
    >
      <span className="block h-full w-1/3 animate-[refetch-slide_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
    </div>
  )
}
