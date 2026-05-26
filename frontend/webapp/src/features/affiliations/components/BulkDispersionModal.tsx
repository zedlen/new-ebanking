import { transfersService } from "@/api/services/transfersService";
import { Button } from "@/shared/components/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import type { BulkSpeiPreviewRow } from "@/shared/types/transfers";
import { formatCurrency } from "@/shared/utils/format";
import { useRef, useState } from "react";

const TEMPLATE_URL = "https://cdn.ebanking-service.net/transfer_template.xlsx";

interface BulkDispersionModalProps {
  onFileSelected: (file: File) => void;
}

const previewColumns: DataTableColumn<BulkSpeiPreviewRow>[] = [
  { id: "line", header: "Línea", cell: (row) => row.line },
  {
    id: "account",
    header: "Cuenta destino",
    cell: (row) => row.beneficiary_account,
  },
  { id: "name", header: "Beneficiario", cell: (row) => row.beneficiary_name },
  { id: "concept", header: "Concepto", cell: (row) => row.concept },
  {
    id: "amount",
    header: "Monto",
    cell: (row) => formatCurrency(row.amount),
  },
];
export function BulkDispersionModal({
  onFileSelected,
}: BulkDispersionModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewRows, setPreviewRows] = useState<BulkSpeiPreviewRow[] | null>(
    null,
  );
  const [previewLoading, setPreviewLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const loadFile = async (next: File | null) => {
    setFile(next);
    setPreviewRows(null);
    if (!next) return;

    setPreviewLoading(true);
    const formData = new FormData();
    formData.append("template", next);
    try {
      const rows = await transfersService.previewBulkDispersion(formData);
      setPreviewRows(rows);
    } catch {
      console.log("Error al leer archivo")
    } finally {
      setPreviewLoading(false);
    }
  };
  return (
    <section className="flex max-w-lg flex-col gap-4">
      <Button
        type="button"
        variant="secondary"
        onClick={() =>
          window.open(TEMPLATE_URL, "_blank", "noopener,noreferrer")
        }
      >
        Descargar plantilla
      </Button>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-10 text-center">
        <span className="text-sm font-medium text-foreground">
          {previewLoading
            ? "Leyendo archivo…"
            : "Arrastra o selecciona tu archivo .xlsx"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) loadFile(file);
          }}
        />
      </label>
      {previewRows ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Vista previa ({previewRows.length} filas)
          </h3>
          <DataTable
            columns={previewColumns}
            data={previewRows}
            getRowKey={(row) => String(row.line)}
            skeletonRows={3}
          />
          <p className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setPreviewRows(null);
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Cambiar archivo
            </Button>
            <Button
              type="button"
              disabled={!file}
              onClick={() => file && onFileSelected(file)}
            >
              Continuar
            </Button>
          </p>
        </section>
      ) : null}
    </section>
  );
}
