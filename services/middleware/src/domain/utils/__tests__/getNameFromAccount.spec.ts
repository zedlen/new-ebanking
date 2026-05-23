import { getNameFromAccount } from "@utils/functions/getNameFromAccount";

describe("getNameFromAccount", () => {
  it("returns company_name for taxpayer_type_id 2", () => {
    const account = { taxpayer_type_id: 2, company_name: "Acme Corp" };
    expect(getNameFromAccount(account)).toBe("ACME CORP");
  });

  it("returns contact_name for taxpayer_type_id 2 if company_name missing", () => {
    const account = { taxpayer_type_id: 2, contact_name: "John Doe" };
    expect(getNameFromAccount(account)).toBe("JOHN DOE");
  });

  it("returns empty string for taxpayer_type_id 2 if company_name and contact missing", () => {
    const account = { taxpayer_type_id: 2 };
    expect(getNameFromAccount(account)).toBe("");
  });

  it("returns full name for taxpayer_type_id not 2", () => {
    const account = {
      taxpayer_type_id: 1,
      name: "Jane",
      ap_paterno: "Smith",
      ap_materno: "Doe",
    };
    expect(getNameFromAccount(account)).toBe("JANE SMITH DOE");
  });

  it("returns company_name if full name missing", () => {
    const account = { taxpayer_type_id: 1, company_name: "Acme Corp" };
    expect(getNameFromAccount(account)).toBe("ACME CORP");
  });

  it("returns contact_name if full name and company_name missing", () => {
    const account = { taxpayer_type_id: 1, contact_name: "John Doe" };
    expect(getNameFromAccount(account)).toBe("JOHN DOE");
  });

  it("returns empty string if nothing present", () => {
    const account = { taxpayer_type_id: 1 };
    expect(getNameFromAccount(account)).toBe("");
  });
});
