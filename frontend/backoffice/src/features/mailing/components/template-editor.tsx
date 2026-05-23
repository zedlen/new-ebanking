import { Mail, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import EmailEditor, { type EditorRef } from "react-email-editor";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TemplatePreview } from "@/features/mailing/components/template-preview";
import { htmlToPlainText } from "@/features/mailing/mailing-utils";
import { env } from "@/lib/env";
import type {
  MailingTemplateDetail,
  TemplateFormValues,
  TemplateFormVariable,
} from "@/types/mailing";

interface TemplateEditorProps {
  selectedTemplateId: string | null;
  selectedTemplate: MailingTemplateDetail;
  detailLoading: boolean;
  saveLoading: boolean;
  values: TemplateFormValues;
  mergedVariables: TemplateFormVariable[];
  previewSubject: string;
  previewHtml: string;
  previewText: string;
  previewVariablesMap: Record<string, string>;
  onChange: (values: TemplateFormValues) => void;
  onRestore: () => void;
  onOpenSend: () => void;
  onSave: (values: TemplateFormValues) => Promise<void>;
}

const emptyForm: TemplateFormValues = {
  name: "",
  from: "",
  subject: "",
  reply_to: "",
  html: "",
  text: "",
  variables: [],
};

export function TemplateEditor({
  selectedTemplateId,
  selectedTemplate,
  detailLoading,
  saveLoading,
  values,
  mergedVariables,
  previewSubject,
  previewHtml,
  previewText,
  previewVariablesMap,
  onChange,
  onRestore,
  onOpenSend,
  onSave,
}: TemplateEditorProps) {
  const emailEditorRef = useRef<EditorRef | null>(null);
  const [builderReady, setBuilderReady] = useState(false);
  const [exporting, setExporting] = useState(false);
  const editorKey = selectedTemplateId ?? "none";

  const patch = (partial: Partial<TemplateFormValues>) => {
    onChange({ ...values, ...partial });
  };

  const exportBuilderHtml = useCallback(async (): Promise<{
    exportedHtml: string | null;
    design: Record<string, unknown> | null;
  }> => {
    const editor = emailEditorRef.current?.editor;
    if (!editor || !builderReady) {
      return { exportedHtml: null, design: null };
    }

    return new Promise((resolve) => {
      editor.exportHtml((data) => {
        const exportedHtml = data?.html?.trim?.() ?? "";
        resolve({
          exportedHtml: exportedHtml || null,
          design: (data?.design as Record<string, unknown>) ?? null,
        });
      });
    });
  }, [builderReady]);

  const syncBuilderToForm = useCallback(async () => {
    const { exportedHtml, design } = await exportBuilderHtml();

    if (!exportedHtml) {
      if (values.html?.trim()) {
        return {
          html: values.html,
          text: values.text || htmlToPlainText(values.html),
          design: values.design,
        };
      }
      throw new Error("No fue posible exportar HTML desde el editor visual");
    }

    const generatedText = htmlToPlainText(exportedHtml);
    const next = {
      html: exportedHtml,
      text: generatedText,
      design: design ?? undefined,
    };
    onChange({ ...values, ...next });
    return next;
  }, [exportBuilderHtml, onChange, values]);

  const handleEditorReady = useCallback(() => {
    const editor = emailEditorRef.current?.editor;
    if (!editor) return;
    if (selectedTemplate.design) {
      editor.loadDesign(selectedTemplate.design as Parameters<
        typeof editor.loadDesign
      >[0]);
    }
  }, [selectedTemplate.design]);

  const handleSave = async () => {
    if (!values.name?.trim() || !values.from?.trim() || !values.subject?.trim()) {
      toast.error("Completa nombre, remitente y asunto");
      return;
    }

    try {
      setExporting(true);
      const exported = await syncBuilderToForm();
      await onSave({
        ...values,
        html: exported.html,
        text: exported.text,
        design: exported.design,
        variables: mergedVariables,
      });
    } catch {
      toast.error("No fue posible guardar la plantilla");
    } finally {
      setExporting(false);
    }
  };

  const handleSyncContent = async () => {
    try {
      setExporting(true);
      await syncBuilderToForm();
      toast.success("HTML y texto sincronizados desde el editor visual");
    } catch {
      toast.error("No fue posible sincronizar el contenido");
    } finally {
      setExporting(false);
    }
  };

  const updateVariable = (
    index: number,
    field: keyof TemplateFormVariable,
    fieldValue: string,
  ) => {
    const next = [...mergedVariables];
    next[index] = { ...next[index], [field]: fieldValue };
    onChange({ ...values, variables: next });
  };

  const addManualVariable = () => {
    onChange({
      ...values,
      variables: [
        ...mergedVariables,
        { key: "", type: "string", fallback_value: "", detected: false },
      ],
    });
  };

  const removeVariable = (index: number) => {
    const variable = mergedVariables[index];
    if (variable?.detected) return;
    onChange({
      ...values,
      variables: mergedVariables.filter((_, i) => i !== index),
    });
  };

  const formValues = selectedTemplateId ? values : emptyForm;
  const canSend =
    Boolean(selectedTemplateId) && selectedTemplateId !== "new";

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-base">Editor de plantilla</CardTitle>
        {selectedTemplateId ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {selectedTemplate.alias || selectedTemplateId}
            </Badge>
            {selectedTemplate.has_unpublished_versions ? (
              <Badge>Tiene cambios sin publicar</Badge>
            ) : null}
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        {detailLoading ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            Cargando detalles de la plantilla…
          </p>
        ) : !selectedTemplateId ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            Selecciona una plantilla para editarla o crea una nueva
          </p>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tpl-name">Nombre</Label>
                <Input
                  id="tpl-name"
                  value={formValues.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="Nombre de la plantilla"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpl-from">De</Label>
                <Input
                  id="tpl-from"
                  value={formValues.from}
                  onChange={(e) => patch({ from: e.target.value })}
                  placeholder="Remitente <remitente@ejemplo.com>"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpl-subject">Asunto</Label>
                <Input
                  id="tpl-subject"
                  value={formValues.subject}
                  onChange={(e) => patch({ subject: e.target.value })}
                  placeholder="Asunto del correo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpl-reply">Responder a</Label>
                <Input
                  id="tpl-reply"
                  value={formValues.reply_to}
                  onChange={(e) => patch({ reply_to: e.target.value })}
                  placeholder="reply-to@ejemplo.com"
                />
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              El contenido se edita en el editor visual. Al guardar se exporta
              el HTML y se genera el texto plano automáticamente.
            </div>

            <div className="overflow-hidden rounded-lg border">
              <div className="h-[600px]">
                <EmailEditor
                  key={editorKey}
                  ref={emailEditorRef}
                  onLoad={() => setBuilderReady(true)}
                  onReady={handleEditorReady}
                  options={{
                    appearance: { theme: "light" },
                    projectId: env.emailEditorProjectId
                      ? Number(env.emailEditorProjectId)
                      : undefined,
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleSyncContent()}
                disabled={exporting}
              >
                <RefreshCw className="mr-1 size-4" />
                Sincronizar contenido
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tpl-text">Texto plano</Label>
              <Textarea
                id="tpl-text"
                readOnly
                rows={6}
                className="font-mono text-sm"
                value={formValues.text}
                placeholder="Texto generado a partir del HTML"
              />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Variables</h3>
                <p className="text-muted-foreground text-sm">
                  Detectadas automáticamente desde asunto, HTML y texto.
                </p>
              </div>

              {mergedVariables.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <p className="text-muted-foreground mb-3 text-sm">
                    Esta plantilla no tiene variables
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addManualVariable}
                  >
                    <Plus className="mr-1 size-4" />
                    Agregar variable manual
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {mergedVariables.map((variable, index) => (
                    <div
                      key={`${variable.key}-${index}`}
                      className="rounded-lg border bg-muted/20 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        {variable.detected ? (
                          <Badge className="bg-green-600">Detectada</Badge>
                        ) : (
                          <Badge variant="outline">Manual</Badge>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={variable.detected}
                          onClick={() => removeVariable(index)}
                          aria-label="Eliminar variable"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Clave</Label>
                          <Input
                            value={variable.key}
                            disabled={variable.detected}
                            onChange={(e) =>
                              updateVariable(index, "key", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Input
                            value={variable.type}
                            onChange={(e) =>
                              updateVariable(index, "type", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Valor por defecto</Label>
                          <Input
                            value={variable.fallback_value ?? ""}
                            onChange={(e) =>
                              updateVariable(
                                index,
                                "fallback_value",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addManualVariable}
                  >
                    <Plus className="mr-1 size-4" />
                    Agregar variable manual
                  </Button>
                </div>
              )}
            </div>

            <TemplatePreview
              title="Vista previa en edición"
              subtitle="Usa el valor por defecto para reemplazar variables mientras editas."
              subject={previewSubject}
              html={previewHtml}
              text={previewText}
              variablesMap={previewVariablesMap}
            />

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={onRestore}>
                Restaurar cambios
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!canSend}
                onClick={onOpenSend}
              >
                <Mail className="mr-1 size-4" />
                Enviar
              </Button>
              <Button
                type="button"
                disabled={saveLoading || exporting}
                onClick={() => void handleSave()}
              >
                <Save className="mr-1 size-4" />
                {saveLoading || exporting ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
