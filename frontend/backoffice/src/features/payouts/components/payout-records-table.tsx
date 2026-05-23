import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import type { PayoutAuthorizationRecord } from "@/types/payouts";

interface PayoutRecordsTableProps {
  records: PayoutAuthorizationRecord[];
}

export function PayoutRecordsTable({ records }: PayoutRecordsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hora</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Monto</TableHead>
          <TableHead>Establecimiento</TableHead>
          <TableHead>Respuesta</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => {
          const response = record.response?.body?.response ?? "";
          const amount = record.request?.body?.values?.billing_value;
          return (
            <TableRow key={record.request_headers.Uuid}>
              <TableCell>
                {new Date(record["ts-cst"]).toLocaleTimeString("es-MX")}
              </TableCell>
              <TableCell>
                {record.request?.body?.processing?.type ?? "—"}
              </TableCell>
              <TableCell>
                {amount != null
                  ? formatCurrency(parseFloat(amount))
                  : "—"}
              </TableCell>
              <TableCell>
                {record.request?.body?.establishment ?? "—"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={response === "APPROVED" ? "default" : "destructive"}
                >
                  {response || "—"}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
