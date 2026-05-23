import { describe, expect, it } from "vitest";
import {
  buildFallbackVariablesMap,
  buildPreviewFromTemplate,
  detectVariablesFromTemplate,
  extractVariablesFromContent,
  mergeDetectedVariables,
  parseRecipients,
  replaceTemplateVariables,
} from "@/features/mailing/mailing-utils";

describe("mailing utils", () => {
  it("extracts variables from triple-brace syntax", () => {
    expect(
      extractVariablesFromContent("Hola {{{user_name}}} y {{{email}}}"),
    ).toEqual(["user_name", "email"]);
  });

  it("detects variables across subject html and text", () => {
    expect(
      detectVariablesFromTemplate({
        subject: "{{{subject_var}}}",
        html: "{{{html_var}}}",
        text: "{{{text_var}}}",
      }),
    ).toEqual(["subject_var", "html_var", "text_var"]);
  });

  it("merges detected variables preserving manual ones", () => {
    const merged = mergeDetectedVariables(
      [{ key: "manual", type: "string", fallback_value: "x" }],
      ["detected"],
    );
    expect(merged.map((v) => v.key)).toEqual(["detected", "manual"]);
    expect(merged[0].detected).toBe(true);
    expect(merged[1].detected).toBe(false);
  });

  it("replaces variables in preview content", () => {
    const preview = buildPreviewFromTemplate({
      subject: "Hola {{{name}}}",
      html: "<p>{{{name}}}</p>",
      variablesMap: { name: "Luis" },
    });
    expect(preview.subject).toBe("Hola Luis");
    expect(preview.html).toBe("<p>Luis</p>");
  });

  it("leaves unknown placeholders intact", () => {
    expect(replaceTemplateVariables("{{{missing}}}", {})).toBe("{{{missing}}}");
  });

  it("parses comma-separated recipients", () => {
    expect(parseRecipients("a@test.com, b@test.com")).toEqual([
      "a@test.com",
      "b@test.com",
    ]);
  });

  it("builds fallback map from form variables", () => {
    expect(
      buildFallbackVariablesMap([
        { key: "name", type: "string", fallback_value: "Ana" },
      ]),
    ).toEqual({ name: "Ana" });
  });
});
