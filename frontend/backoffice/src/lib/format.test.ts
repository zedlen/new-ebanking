import { describe, expect, it } from "vitest";
import { getDisplayName, getPersonTypeLabel } from "@/lib/format";
import { TypePerson } from "@/types/partners";

describe("format", () => {
  it("uses company name for moral person", () => {
    expect(
      getDisplayName({
        taxpayer_type_id: TypePerson.Moral,
        company_name: "Acme SA",
        contact_name: "Juan",
      }),
    ).toBe("Acme SA");
  });

  it("uses contact name for physical person", () => {
    expect(
      getDisplayName({
        taxpayer_type_id: TypePerson.Fisica,
        company_name: "Acme",
        contact_name: "Juan Pérez",
      }),
    ).toBe("Juan Pérez");
  });

  it("returns person type labels in Spanish", () => {
    expect(getPersonTypeLabel(TypePerson.Fisica)).toBe("Persona física");
    expect(getPersonTypeLabel(TypePerson.Moral)).toBe("Persona moral");
  });
});
