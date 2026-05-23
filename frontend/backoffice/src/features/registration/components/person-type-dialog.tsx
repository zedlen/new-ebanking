import { Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TypePerson } from "@/types/partners";

const PERSON_LABELS: Record<TypePerson, string> = {
  [TypePerson.Fisica]: "Persona Física",
  [TypePerson.Moral]: "Persona Moral",
};

interface PersonTypeDialogProps {
  open: boolean;
  onSelect: (type: TypePerson) => void;
  onRequestClose: () => void;
}

export function PersonTypeDialog({
  open,
  onSelect,
  onRequestClose,
}: PersonTypeDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onRequestClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tipo de cuenta</DialogTitle>
          <DialogDescription>
            Selecciona la opción que necesites
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-6 py-4 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex h-auto w-full flex-col gap-3 rounded-2xl px-8 py-8 sm:w-44"
            onClick={() => onSelect(TypePerson.Fisica)}
          >
            <span className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
              <User className="size-7" />
            </span>
            <span className="font-semibold">{PERSON_LABELS[TypePerson.Fisica]}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex h-auto w-full flex-col gap-3 rounded-2xl px-8 py-8 sm:w-44"
            onClick={() => onSelect(TypePerson.Moral)}
          >
            <span className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
              <Building2 className="size-7" />
            </span>
            <span className="font-semibold">{PERSON_LABELS[TypePerson.Moral]}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
