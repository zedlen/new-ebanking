import { useState } from "react";
import { toast } from "sonner";
import { EmailListInput } from "@/components/payouts/email-list-input";
import { FileDropzone } from "@/components/payouts/file-dropzone";
import { Button } from "@/components/ui/button";
import { PayoutRecordsTable } from "@/features/payouts/components/payout-records-table";
import {
  PAYOUT_CLIENT,
  processPayoutFile,
  sendPayoutFileReport,
} from "@/features/payouts/payouts-api";
import { formatCurrency } from "@/lib/format";
import type { ProcessPayoutsResponse } from "@/types/payouts";

export function PayoutUploadTab() {
  const [processing, setProcessing] = useState(false);
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [data, setData] = useState<ProcessPayoutsResponse | null>(null);

  const handleFile = async (next: File) => {
    setProcessing(true);
    setFile(next);
    const response = await processPayoutFile(next);
    setProcessing(false);

    if (response) {
      setData(response);
      toast.success("Archivo procesado correctamente");
    } else {
      setData(null);
      toast.error("Error al procesar el archivo de liquidación");
    }
  };

  const handleSendReport = async () => {
    if (!file) {
      toast.error("No hay ningún archivo cargado para enviar");
      return;
    }
    setSending(true);
    const ok = await sendPayoutFileReport(file, emails);
    setSending(false);
    if (ok) {
      toast.success("Reporte enviado correctamente");
    } else {
      toast.error("Error al enviar el reporte");
    }
  };

  const { dayGrouping = {}, ignoredRecords = [], total = "0" } = data ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Cargar archivos de liquidación</h2>
        <p className="text-muted-foreground text-sm">
          Cliente: <span className="font-medium">{PAYOUT_CLIENT}</span>
        </p>
      </div>

      <FileDropzone onFile={(f) => void handleFile(f)} disabled={processing} />

      {processing ? (
        <p className="text-muted-foreground text-sm">Procesando archivo…</p>
      ) : null}

      {data ? (
        <div className="space-y-4">
          {Object.entries(dayGrouping).map(([date, info]) => (
            <details
              key={date}
              className="group rounded-lg border"
              open
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-medium">
                <span>{date}</span>
                <span className="text-green-600">
                  Total: {formatCurrency(parseFloat(info.total))}
                </span>
              </summary>
              <div className="overflow-x-auto border-t px-2 py-2">
                <PayoutRecordsTable records={info.records} />
              </div>
            </details>
          ))}

          {ignoredRecords.length > 0 ? (
            <details className="rounded-lg border">
              <summary className="cursor-pointer px-4 py-3 font-medium">
                Registros ignorados ({ignoredRecords.length})
              </summary>
              <div className="overflow-x-auto border-t px-2 py-2">
                <PayoutRecordsTable records={ignoredRecords} />
              </div>
            </details>
          ) : null}

          <div className="flex justify-end gap-2 text-sm">
            <span className="font-semibold">Total procesado:</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(parseFloat(total))}
            </span>
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
            <p className="text-muted-foreground text-sm">
              Ingresa a qué correos se les notificará el resultado del proceso de
              liquidación. Si no se ingresa ningún correo, no se enviará ninguna
              notificación.
            </p>
            <EmailListInput value={emails} onChange={setEmails} />
            <Button disabled={!file || sending} onClick={() => void handleSendReport()}>
              {sending ? "Enviando…" : "Enviar reporte"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
