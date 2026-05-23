import type { TemplateFormVariable, TemplateFormValues } from "@/types/mailing";

export function extractVariablesFromContent(input: string): string[] {
  if (!input) return [];

  const regex = /{{{\s*([a-zA-Z0-9_.-]+)\s*}}}/g;
  const matches = [...input.matchAll(regex)];

  return Array.from(new Set(matches.map((match) => match[1]).filter(Boolean)));
}

export function detectVariablesFromTemplate(
  values: Partial<TemplateFormValues>,
): string[] {
  const subjectVars = extractVariablesFromContent(values.subject ?? "");
  const htmlVars = extractVariablesFromContent(values.html ?? "");
  const textVars = extractVariablesFromContent(values.text ?? "");

  return Array.from(new Set([...subjectVars, ...htmlVars, ...textVars]));
}

export function mergeDetectedVariables(
  existingVariables: TemplateFormVariable[] = [],
  detectedKeys: string[] = [],
): TemplateFormVariable[] {
  const existingMap = new Map(existingVariables.map((item) => [item.key, item]));

  const merged = detectedKeys.map((key) => {
    const existing = existingMap.get(key);
    if (existing) {
      return { ...existing, detected: true };
    }
    return {
      key,
      type: "string",
      fallback_value: "",
      detected: true,
    };
  });

  const manualOnly = existingVariables.filter(
    (item) => !detectedKeys.includes(item.key),
  );

  return [
    ...merged,
    ...manualOnly.map((item) => ({ ...item, detected: false })),
  ];
}

export function parseRecipients(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildFallbackVariablesMap(
  variables: TemplateFormVariable[] = [],
): Record<string, string> {
  return Object.fromEntries(
    variables.map((variable) => [variable.key, variable.fallback_value ?? ""]),
  );
}

export function replaceTemplateVariables(
  content: string,
  variablesMap: Record<string, string>,
): string {
  if (!content) return "";

  return content.replace(
    /{{{\s*([a-zA-Z0-9_.-]+)\s*}}}/g,
    (_, variableName: string) => {
      if (Object.prototype.hasOwnProperty.call(variablesMap, variableName)) {
        return variablesMap[variableName] ?? "";
      }
      return `{{{${variableName}}}}`;
    },
  );
}

export function buildPreviewFromTemplate(params: {
  subject?: string;
  html?: string;
  text?: string;
  variablesMap?: Record<string, string>;
}) {
  const variablesMap = params.variablesMap ?? {};

  return {
    subject: replaceTemplateVariables(params.subject ?? "", variablesMap),
    html: replaceTemplateVariables(params.html ?? "", variablesMap),
    text: replaceTemplateVariables(params.text ?? "", variablesMap),
  };
}

export function htmlToPlainText(html: string): string {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const root = doc.body || doc.documentElement;
  if (!root) return "";

  root
    .querySelectorAll("style, script, title, noscript, meta, link, head")
    .forEach((node) => node.remove());

  const blockTags = new Set([
    "address",
    "article",
    "aside",
    "blockquote",
    "br",
    "div",
    "dl",
    "dt",
    "dd",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "header",
    "hr",
    "li",
    "main",
    "nav",
    "ol",
    "p",
    "pre",
    "section",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "td",
    "th",
    "ul",
  ]);

  function extract(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (
      ["style", "script", "title", "noscript", "meta", "link", "head"].includes(
        tag,
      )
    ) {
      return "";
    }
    if (tag === "br") return "\n";

    let text = "";
    for (const child of Array.from(element.childNodes)) {
      text += extract(child);
    }
    if (tag === "li") text = `• ${text}`;
    if (blockTags.has(tag)) return `\n${text}\n`;
    return text;
  }

  return extract(root)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function toApiVariables(
  variables: TemplateFormVariable[] = [],
): Array<{ key: string; type: string; fallbackValue: string }> {
  return variables.map((v) => ({
    key: v.key,
    type: v.type || "string",
    fallbackValue: v.fallback_value ?? "",
  }));
}
