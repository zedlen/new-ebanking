import { describe, expect, it } from "vitest";
import {
  addressSchema,
  buildRegistrationPayload,
  companyPartnerSchema,
  personalFisicaSchema,
  personalMoralSchema,
  REGEX,
} from "@/features/registration/registration-schemas";
import { TypePerson } from "@/types/partners";

const validAddress = {
  street: "Av. Reforma 123",
  reference: "",
  neighborhood: "Centro",
  district: "Cuauhtémoc",
  num_ext: "10",
  num_int: "",
  estate: "Ciudad de México",
  cp: "06000",
};

const validCompanyPartner = {
  company_name: "Acme SA de CV",
  rfc: "ACM010101ABC",
  economic_activity: "Finanzas",
  business_activity: "Servicios",
  company_tel: "5512345678",
  affiliation_code: "",
};

const validPersonalMoral = {
  contact_name: "Juan Pérez",
  contact_email: "juan@acme.test",
  contact_tel: "5512345678",
};

const validPersonalFisica = {
  name: "María",
  ap_paterno: "López",
  ap_materno: "García",
  contact_email: "maria@test.com",
  contact_tel: "5598765432",
  rfc: "LOGM850101ABC",
};

describe("registration schemas", () => {
  it("rejects invalid RFC moral", () => {
    const result = companyPartnerSchema.safeParse({
      ...validCompanyPartner,
      rfc: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid partner company", () => {
    expect(companyPartnerSchema.safeParse(validCompanyPartner).success).toBe(
      true,
    );
  });

  it("accepts valid address", () => {
    expect(addressSchema.safeParse(validAddress).success).toBe(true);
  });

  it("builds moral partner payload", () => {
    const payload = buildRegistrationPayload(
      TypePerson.Moral,
      validAddress,
      validPersonalMoral,
      validCompanyPartner,
    );

    expect(payload.taxpayer_type_id).toBe(TypePerson.Moral);
    expect(payload.rfc).toBe(validCompanyPartner.rfc);
    expect(payload.company_name).toBe(validCompanyPartner.company_name);
    expect(payload.economic_activity).toBe(validCompanyPartner.economic_activity);
    expect(payload.contact_name).toBe(validPersonalMoral.contact_name);
    expect(payload.address.street).toBe(validAddress.street);
    expect(payload.company_tel).toBe(validCompanyPartner.company_tel);
  });

  it("builds fisica customer payload without company", () => {
    const payload = buildRegistrationPayload(
      TypePerson.Fisica,
      validAddress,
      validPersonalFisica,
    );

    expect(payload.taxpayer_type_id).toBe(TypePerson.Fisica);
    expect(payload.rfc).toBe(validPersonalFisica.rfc);
    expect(payload.contact_name).toBe("María López García");
    expect(payload.name).toBe(validPersonalFisica.name);
    expect(payload.company_name).toBeUndefined();
  });

  it("validates fisica RFC pattern", () => {
    expect(REGEX.rfcFisica.test(validPersonalFisica.rfc)).toBe(true);
    expect(personalFisicaSchema.safeParse(validPersonalFisica).success).toBe(
      true,
    );
    expect(personalMoralSchema.safeParse(validPersonalMoral).success).toBe(true);
  });
});
