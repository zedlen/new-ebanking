export type MovementStatusTone = 'success' | 'warning' | 'error' | 'neutral'

export function movementStatusTone(status: string): MovementStatusTone {
  if (['applied', 'scattered'].includes(status)) return 'success'
  if (['canceled', 'returned', 'stoped'].includes(status)) return 'error'
  if (['pending', 'sent', 'in_transit', 'created'].includes(status)) {
    return 'warning'
  }
  return 'neutral'
}
