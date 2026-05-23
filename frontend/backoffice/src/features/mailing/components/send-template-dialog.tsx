import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
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
import { TemplatePreview } from "@/features/mailing/components/template-preview";
import { buildPreviewFromTemplate } from "@/features/mailing/mailing-utils";
import type { SendMailFormValues } from "@/types/mailing";

interface SendTemplateDialogProps {
  open: boolean;
  loading: boolean;
  templateHtml: string;
  templateText: string;
  initialValues: SendMailFormValues;
  onClose: () => void;
  onSubmit: (values: SendMailFormValues) => void;
}

export function SendTemplateDialog({
  open,
  loading,
  templateHtml,
  templateText,
  initialValues,
  onClose,
  onSubmit,
}: SendTemplateDialogProps) {
  const form = useForm<SendMailFormValues>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(initialValues);
    }
  }, [open, initialValues, form]);

  const watched = form.watch();
  const variables = watched.variables ?? [];

  const previewVariablesMap = useMemo(
    () =>
      Object.fromEntries(
        variables.map((item) => [item.key, item.value ?? ""]),
      ),
    [variables],
  );

  const preview = useMemo(
    () =>
      buildPreviewFromTemplate({
        subject: watched.subject,
        html: templateHtml,
        text: templateText,
        variablesMap: previewVariablesMap,
      }),
    [
      watched.subject,
      templateHtml,
      templateText,
      previewVariablesMap,
    ],
  );

  const handleSubmit = form.handleSubmit((values) => onSubmit(values));

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar correo con plantilla</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="send-to">Para</Label>
            <Input
              id="send-to"
              placeholder="correo1@dominio.com, correo2@dominio.com"
              {...form.register("to", { required: true })}
            />
            <p className="text-muted-foreground text-xs">
              Puedes ingresar varios correos separados por coma
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="send-from">De</Label>
              <Input
                id="send-from"
                {...form.register("from", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="send-subject">Asunto</Label>
              <Input
                id="send-subject"
                {...form.register("subject", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="send-reply">Responder a</Label>
              <Input id="send-reply" {...form.register("reply_to")} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Valores para variables</h3>
            {variables.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Esta plantilla no requiere variables
              </p>
            ) : (
              variables.map((_, index) => (
                <div
                  key={variables[index]?.key ?? index}
                  className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-2"
                >
                  <div className="space-y-2">
                    <Label>Variable</Label>
                    <Input
                      disabled
                      {...form.register(`variables.${index}.key`)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input
                      placeholder="Valor para reemplazo al enviar"
                      {...form.register(`variables.${index}.value`)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <TemplatePreview
            title="Vista previa del correo a enviar"
            subtitle="Usa los valores capturados en este formulario para reemplazar variables."
            subject={preview.subject}
            html={preview.html}
            text={preview.text}
            variablesMap={previewVariablesMap}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando…" : "Enviar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
