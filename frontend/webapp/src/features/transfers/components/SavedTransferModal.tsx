import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'

interface SavedTransferModalProps {
  open: boolean
  onClose: () => void
}

export function SavedTransferModal({ open, onClose }: SavedTransferModalProps) {
  return (
    <Modal open={open} title="Transferencia guardada" onClose={onClose}>
      <p className="text-sm text-neutral">
        La transferencia se guardó en pendientes. Puedes aprobarla desde el historial de
        cargas, pestaña Pendientes.
      </p>
      <p className="mt-6 flex justify-end">
        <Button type="button" onClick={onClose}>
          Entendido
        </Button>
      </p>
    </Modal>
  )
}
