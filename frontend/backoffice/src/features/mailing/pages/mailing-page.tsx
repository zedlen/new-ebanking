import { useQuery } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SendTemplateDialog } from "@/features/mailing/components/send-template-dialog";
import { TemplateEditor } from "@/features/mailing/components/template-editor";
import { TemplatesTable } from "@/features/mailing/components/templates-table";
import {
  createMailingTemplate,
  fetchMailingTemplate,
  fetchMailingTemplates,
  sendMailingTemplate,
  updateMailingTemplate,
} from "@/features/mailing/mailing-api";
import {
  buildFallbackVariablesMap,
  buildPreviewFromTemplate,
  detectVariablesFromTemplate,
  mergeDetectedVariables,
} from "@/features/mailing/mailing-utils";
import type {
  MailingTemplateDetail,
  MailingTemplateListItem,
  SendMailFormValues,
  TemplateFormValues,
} from "@/types/mailing";
import { emptyTemplateDetail } from "@/types/mailing";

const emptyForm: TemplateFormValues = {
  name: "",
  from: "",
  subject: "",
  reply_to: "",
  html: "",
  text: "",
  variables: [],
};

function detailToForm(detail: MailingTemplateDetail): TemplateFormValues {
  return {
    name: detail.name ?? "",
    from: detail.from ?? "",
    subject: detail.subject ?? "",
    reply_to: detail.reply_to ?? "",
    html: detail.html ?? "",
    text: detail.text ?? "",
    design: detail.design,
    variables: (detail.variables ?? []).map((variable) => ({
      id: variable.id,
      key: variable.key,
      type: variable.type,
      fallback_value:
        variable.fallback_value ?? variable.fallbackValue ?? "",
      detected: true,
    })),
  };
}

export function MailingPage() {
  const [search, setSearch] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<MailingTemplateDetail>(emptyTemplateDetail);
  const [formValues, setFormValues] = useState<TemplateFormValues>(emptyForm);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState("");
  const [sendOpen, setSendOpen] = useState(false);
  const [sendInitial, setSendInitial] = useState<SendMailFormValues>({
    to: "",
    from: "",
    subject: "",
    reply_to: "",
    variables: [],
  });

  const {
    data: listData,
    isLoading: listLoading,
    refetch: refetchList,
  } = useQuery({
    queryKey: ["mailing-templates"],
    queryFn: fetchMailingTemplates,
  });

  const templates = listData?.data ?? [];
  const hasMore = listData?.has_more ?? false;

  const filteredTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter(
      (t) =>
        t.name?.toLowerCase().includes(term) ||
        t.alias?.toLowerCase().includes(term) ||
        t.status?.toLowerCase().includes(term),
    );
  }, [search, templates]);

  const detectedKeys = useMemo(
    () => detectVariablesFromTemplate(formValues),
    [formValues.subject, formValues.html, formValues.text],
  );

  const mergedVariables = useMemo(
    () => mergeDetectedVariables(formValues.variables, detectedKeys),
    [formValues.variables, detectedKeys],
  );

  useEffect(() => {
    const comparable = (vars: typeof mergedVariables) =>
      JSON.stringify(
        vars.map((v) => ({
          key: v.key,
          type: v.type,
          fallback_value: v.fallback_value,
          detected: v.detected,
        })),
      );

    if (comparable(formValues.variables) !== comparable(mergedVariables)) {
      setFormValues((prev) => ({ ...prev, variables: mergedVariables }));
    }
  }, [mergedVariables, formValues.variables]);

  const editingPreviewMap = useMemo(
    () => buildFallbackVariablesMap(mergedVariables),
    [mergedVariables],
  );

  const editingPreview = useMemo(
    () =>
      buildPreviewFromTemplate({
        subject: formValues.subject,
        html: formValues.html,
        text: formValues.text,
        variablesMap: editingPreviewMap,
      }),
    [
      formValues.subject,
      formValues.html,
      formValues.text,
      editingPreviewMap,
    ],
  );

  const loadDetail = async (id: string) => {
    setDetailLoading(true);
    setError("");
    try {
      const detail = await fetchMailingTemplate(id);
      setSelectedTemplate(detail);
      setFormValues(detailToForm(detail));
    } catch {
      setSelectedTemplate(emptyTemplateDetail);
      setFormValues(emptyForm);
      setError("No se pudo cargar el detalle de la plantilla.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelect = async (template: MailingTemplateListItem) => {
    setSelectedTemplateId(template.id);
    await loadDetail(template.id);
  };

  const createNew = () => {
    setSelectedTemplateId("new");
    setSelectedTemplate(emptyTemplateDetail);
    setFormValues(emptyForm);
    setDetailLoading(false);
  };

  const handleSave = async (values: TemplateFormValues) => {
    if (!selectedTemplateId) return;

    setSaveLoading(true);
    setError("");

    if (selectedTemplateId === "new") {
      const result = await createMailingTemplate(values);
      if (!result.success) {
        setError(result.error ?? "No se pudo crear la plantilla.");
        toast.error(result.error ?? "No se pudo crear la plantilla");
        setSaveLoading(false);
        return;
      }
      toast.success("Plantilla creada correctamente");
      await refetchList();
      if (result.id) {
        setSelectedTemplateId(result.id);
        await loadDetail(result.id);
      }
      setSaveLoading(false);
      return;
    }

    const result = await updateMailingTemplate(selectedTemplateId, values);
    if (!result.success) {
      setError(result.error ?? "No se pudo actualizar la plantilla.");
      toast.error(result.error ?? "No se pudo actualizar la plantilla");
      setSaveLoading(false);
      return;
    }

    toast.success("Plantilla actualizada correctamente");
    await refetchList();
    await loadDetail(selectedTemplateId);
    setSaveLoading(false);
  };

  const openSendModal = (source?: TemplateFormValues) => {
    if (!selectedTemplateId || selectedTemplateId === "new") return;

    const base = source ?? formValues;
    const vars = mergeDetectedVariables(
      base.variables,
      detectVariablesFromTemplate(base),
    );

    setSendInitial({
      to: "",
      from: base.from,
      subject: base.subject,
      reply_to: base.reply_to,
      variables: vars.map((v) => ({
        key: v.key,
        value: v.fallback_value ?? "",
      })),
    });
    setSendOpen(true);
  };

  const handleSendFromTable = async (template: MailingTemplateListItem) => {
    setSelectedTemplateId(template.id);
    setDetailLoading(true);
    setError("");
    try {
      const detail = await fetchMailingTemplate(template.id);
      setSelectedTemplate(detail);
      const nextForm = detailToForm(detail);
      setFormValues(nextForm);
      openSendModal(nextForm);
    } catch {
      setError("No se pudo cargar el detalle de la plantilla.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSend = async (values: SendMailFormValues) => {
    if (!selectedTemplateId || selectedTemplateId === "new") return;

    setSendLoading(true);
    setError("");

    const result = await sendMailingTemplate(selectedTemplateId, values);
    setSendLoading(false);

    if (!result.success) {
      setError(result.error ?? "No se pudo enviar el correo.");
      toast.error(result.error ?? "No se pudo enviar el correo");
      return;
    }

    toast.success("Correo enviado correctamente");
    setSendOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Plantillas de correo</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Lista, edición, vista previa y envío de plantillas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void refetchList()}
            disabled={listLoading}
          >
            <RefreshCw className="mr-1 size-4" />
            Recargar
          </Button>
          <Button onClick={createNew}>
            <Plus className="mr-1 size-4" />
            Crear plantilla
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <TemplatesTable
        search={search}
        onSearchChange={setSearch}
        loading={listLoading}
        templates={filteredTemplates}
        selectedTemplateId={selectedTemplateId}
        onSelect={(t) => void handleSelect(t)}
        onSend={(t) => void handleSendFromTable(t)}
      />

      <p className="text-muted-foreground text-xs">
        Hay más resultados: {hasMore ? "Sí" : "No"}
      </p>

      <TemplateEditor
        selectedTemplateId={selectedTemplateId}
        selectedTemplate={selectedTemplate}
        detailLoading={detailLoading}
        saveLoading={saveLoading}
        values={formValues}
        mergedVariables={mergedVariables}
        previewSubject={editingPreview.subject}
        previewHtml={editingPreview.html}
        previewText={editingPreview.text}
        previewVariablesMap={editingPreviewMap}
        onChange={setFormValues}
        onRestore={() => {
          if (selectedTemplateId && selectedTemplateId !== "new") {
            void loadDetail(selectedTemplateId);
          }
        }}
        onOpenSend={openSendModal}
        onSave={handleSave}
      />

      <SendTemplateDialog
        open={sendOpen}
        loading={sendLoading}
        templateHtml={formValues.html}
        templateText={formValues.text}
        initialValues={sendInitial}
        onClose={() => setSendOpen(false)}
        onSubmit={(values) => void handleSend(values)}
      />
    </div>
  );
}
