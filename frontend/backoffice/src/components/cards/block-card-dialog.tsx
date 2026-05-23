import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { blockReasonsForCardType } from "@/types/cards";

interface BlockCardDialogProps {
  open: boolean;
  cardType: string;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

export function BlockCardDialog({
  open,
  cardType,
  loading,
  onOpenChange,
  onConfirm,
}: BlockCardDialogProps) {
  const [reason, setReason] = useState("");
  const options = blockReasonsForCardType(cardType);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setReason("");
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquear tarjeta</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="block-reason">
            Elige un motivo por el que deseas bloquear la tarjeta
          </Label>
          <select
            id="block-reason"
            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={!reason || loading}
            onClick={() => onConfirm(reason)}
          >
            Bloquear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
