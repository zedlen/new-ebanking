import { useMutation } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { changeDocumentStatus } from "@/features/onboarding/onboarding-api";
import {
  DOCUMENT_STATUS_LABELS,
  type DocumentStatusAction,
  type ProspectDocument,
} from "@/types/onboarding";

interface ProspectDocumentsTableProps {
  prospectId: string;
  documents: ProspectDocument[];
  onUpdated: () => void;
}

export function ProspectDocumentsTable({
  prospectId,
  documents,
  onUpdated,
}: ProspectDocumentsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pendingStatus, setPendingStatus] =
    useState<DocumentStatusAction | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<ProspectDocument | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      docId,
      status,
      statusReason,
    }: {
      docId: string;
      status: DocumentStatusAction;
      statusReason?: string;
    }) => changeDocumentStatus(prospectId, docId, status, statusReason),
    onSuccess: (ok) => {
      if (ok) {
        toast.success("Cambios guardados exitosamente");
        onUpdated();
        setDialogOpen(false);
        setReason("");
        setSelectedDoc(null);
        setPendingStatus(null);
      } else {
        toast.error("Error al guardar los cambios");
      }
    },
  });

  const openReasonDialog = (doc: ProspectDocument, status: DocumentStatusAction) => {
    setSelectedDoc(doc);
    setPendingStatus(status);
    setReason("");
    setDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (!selectedDoc || !pendingStatus) return;
    mutation.mutate({
      docId: selectedDoc.uuid,
      status: pendingStatus,
      statusReason: pendingStatus === "approved" ? undefined : reason,
    });
  };

  if (!documents.length) {
    return (
      <p className="text-muted-foreground text-sm">No hay documentos cargados.</p>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Archivo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.uuid}>
              <TableCell>{doc.type}</TableCell>
              <TableCell>{doc.description}</TableCell>
              <TableCell className="max-w-[180px] truncate">
                {doc.originalName}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {DOCUMENT_STATUS_LABELS[doc.status] ?? doc.status}
                </Badge>
                {doc.statusReason ? (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {doc.statusReason}
                  </p>
                ) : null}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(doc.fileUrl, "_blank")}
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                  {doc.status !== "approved" && doc.status !== "rejected" ? (
                    <>
                      <Button
                        size="sm"
                        disabled={mutation.isPending}
                        onClick={() =>
                          mutation.mutate({
                            docId: doc.uuid,
                            status: "approved",
                          })
                        }
                      >
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() => openReasonDialog(doc, "modify")}
                      >
                        Modificar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={mutation.isPending}
                        onClick={() => openReasonDialog(doc, "rejected")}
                      >
                        Rechazar
                      </Button>
                    </>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Razón de rechazo o modificación</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="doc-reason">Motivo</Label>
            <Input
              id="doc-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Escribe la razón aquí"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={reason.trim().length < 3 || mutation.isPending}
              onClick={confirmStatusChange}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
