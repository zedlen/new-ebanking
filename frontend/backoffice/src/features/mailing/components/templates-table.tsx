import { Mail, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { MailingTemplateListItem } from "@/types/mailing";

interface TemplatesTableProps {
  search: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  templates: MailingTemplateListItem[];
  selectedTemplateId: string | null;
  onSelect: (template: MailingTemplateListItem) => void;
  onSend: (template: MailingTemplateListItem) => void;
}

function statusVariant(status: string) {
  if (status === "published") return "default" as const;
  if (status === "draft") return "secondary" as const;
  return "outline" as const;
}

export function TemplatesTable({
  search,
  onSearchChange,
  loading,
  templates,
  selectedTemplateId,
  onSelect,
  onSend,
}: TemplatesTableProps) {
  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar por nombre, alias o estado"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Publicado</TableHead>
                  <TableHead>Actualizado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                      Cargando plantillas…
                    </TableCell>
                  </TableRow>
                ) : templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                      No hay plantillas disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((row) => (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "cursor-pointer",
                        row.id === selectedTemplateId && "bg-muted/60",
                      )}
                      onClick={() => onSelect(row)}
                    >
                      <TableCell>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {row.alias}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(row.status)}>
                          {row.status || "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.published_at || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.updated_at || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSend(row);
                          }}
                        >
                          <Mail className="mr-1 size-4" />
                          Enviar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
