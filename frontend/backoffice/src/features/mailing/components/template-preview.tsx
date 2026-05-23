import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/features/mailing/sanitize-html";

type PreviewTab = "html" | "source" | "text";

interface TemplatePreviewProps {
  title?: string;
  subtitle?: string;
  subject?: string;
  html?: string;
  text?: string;
  variablesMap?: Record<string, string>;
}

export function TemplatePreview({
  title = "Vista previa",
  subtitle,
  subject,
  html,
  text,
  variablesMap,
}: TemplatePreviewProps) {
  const [tab, setTab] = useState<PreviewTab>("html");
  const variableEntries = Object.entries(variablesMap ?? {});
  const hasContent = Boolean(subject || html || text);
  const safeHtml = sanitizeHtml(html ?? "");

  const tabs: { id: PreviewTab; label: string }[] = [
    { id: "html", label: "HTML renderizado" },
    { id: "source", label: "HTML fuente" },
    { id: "text", label: "Texto" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle ? (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasContent ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No hay contenido para previsualizar
          </p>
        ) : (
          <>
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="mb-2 text-sm font-medium">Asunto</p>
              <p className="rounded-md border bg-background p-3 text-sm">
                {subject || "—"}
              </p>
            </div>

            {variableEntries.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-medium">Variables aplicadas</p>
                <div className="flex flex-wrap gap-2">
                  {variableEntries.map(([key, value]) => (
                    <Badge key={key} variant="secondary">
                      {key}: {value || "''"}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 border-b pb-2">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    tab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === "html" ? (
              html ? (
                <div
                  className="prose max-w-none rounded-lg border bg-background p-4"
                  dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
              ) : (
                <p className="text-muted-foreground text-sm">
                  No hay HTML para mostrar
                </p>
              )
            ) : null}

            {tab === "source" ? (
              html ? (
                <pre className="overflow-x-auto rounded-lg border bg-slate-950 p-4 text-xs text-slate-100 whitespace-pre-wrap">
                  {html}
                </pre>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No hay HTML fuente
                </p>
              )
            ) : null}

            {tab === "text" ? (
              text ? (
                <p className="rounded-lg border bg-background p-4 text-sm whitespace-pre-wrap">
                  {text}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No hay versión en texto plano
                </p>
              )
            ) : null}

            <p className="text-muted-foreground text-xs">
              El HTML renderizado se sanitiza antes de mostrarse.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
