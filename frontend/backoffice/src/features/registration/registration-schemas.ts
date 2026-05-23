import { z } from "zod";
import { TypePerson } from "@/types/partners";
import type { RegistrationPayload } from "@/types/registration";

export const REGEX = {
  alphanumericBasic: /^[a-zA-Z0-9]+$/,
  alphanumericComplex: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9.,\s]+$/,
  rfcFisica: /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/,
  rfcMoral: /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/,
  onlyNumbers: /^\d+$/,
  text: /^[a-zA-Z0ÁÉÍÓÚÜÑáéíóúüñ\s]+$/,
  address: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9.#\s]+$/,
} as const;

const optionalAffiliationCode = z
  .string()
  .optional()
  .refine((v) => !v || REGEX.alphanumericBasic.test(v), {
    message: "Solo se permiten letras y números",
  })
  .refine((v) => !v || v.length >= 3, {
    message: "Ingresa al menos 3 caracteres",
  });

export const companyCustomerSchema = z.object({
  company_name: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres")
    .regex(REGEX.alphanumericComplex, "Ingresaste un caracter no permitido"),
  rfc: z
    .string()
    .min(1, "Este campo es obligatorio")
    .regex(REGEX.rfcMoral, "RFC inválido"),
  affiliation_code: optionalAffiliationCode,
});

export const companyPartnerSchema = companyCustomerSchema.extend({
  economic_activity: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(3, "Ingresa al menos 3 caracteres")
    .regex(REGEX.text, "Ingresaste un caracter no permitido"),
  business_activity: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(3, "Ingresa al menos 3 caracteres")
    .regex(REGEX.text, "Ingresaste un caracter no permitido"),
  company_tel: z
    .string()
    .min(1, "Este campo es obligatorio")
    .length(10, "Ingresa exactamente 10 dígitos")
    .regex(REGEX.onlyNumbers, "Ingresa solo números"),
});

export const addressSchema = z.object({
  street: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(3, "Ingresa al menos 3 caracteres")
    .regex(REGEX.address, "Ingresaste un caracter no permitido"),
  reference: z.string().optional(),
  neighborhood: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(3, "Ingresa al menos 3 caracteres")
    .regex(REGEX.text, "Ingresaste un caracter no permitido"),
  district: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(3, "Ingresa al menos 3 caracteres")
    .regex(REGEX.text, "Ingresaste un caracter no permitido"),
  num_ext: z
    .string()
    .min(1, "Este campo es obligatorio")
    .regex(REGEX.address, "Ingresaste un caracter no permitido"),
  num_int: z
    .string()
    .optional()
    .refine((v) => !v || REGEX.address.test(v), {
      message: "Ingresaste un caracter no permitido",
    }),
  estate: z.string().min(1, "Este campo es obligatorio"),
  cp: z
    .string()
    .min(1, "Este campo es obligatorio")
    .length(5, "Ingresa exactamente 5 dígitos")
    .regex(REGEX.onlyNumbers, "Solo se permiten números"),
});

export const personalMoralSchema = z.object({
  contact_name: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(3, "Ingresa al menos 3 caracteres")
    .regex(REGEX.text, "Ingresaste un caracter no permitido"),
  contact_email: z
    .string()
    .min(1, "Este campo es obligatorio")
    .email("El correo no es válido"),
  contact_tel: z
    .string()
    .min(1, "Este campo es obligatorio")
    .length(10, "Ingresa exactamente 10 dígitos")
    .regex(REGEX.onlyNumbers, "Ingresa solo números"),
});

export const personalFisicaSchema = z.object({
  name: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(3, "Ingresa al menos 3 caracteres")
    .regex(REGEX.text, "Ingresaste un caracter no permitido"),
  ap_paterno: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(3, "Ingresa al menos 3 caracteres")
    .regex(REGEX.text, "Ingresaste un caracter no permitido"),
  ap_materno: z
    .string()
    .min(1, "Este campo es obligatorio")
    .min(3, "Ingresa al menos 3 caracteres")
    .regex(REGEX.text, "Ingresaste un caracter no permitido"),
  contact_email: z
    .string()
    .min(1, "Este campo es obligatorio")
    .email("El correo no es válido"),
  contact_tel: z
    .string()
    .min(1, "Este campo es obligatorio")
    .length(10, "Ingresa exactamente 10 dígitos")
    .regex(REGEX.onlyNumbers, "Ingresa solo números"),
  rfc: z
    .string()
    .min(1, "Este campo es obligatorio")
    .regex(REGEX.rfcFisica, "RFC inválido"),
});

export type CompanyCustomerValues = z.infer<typeof companyCustomerSchema>;
export type CompanyPartnerValues = z.infer<typeof companyPartnerSchema>;
export type AddressFormValues = z.infer<typeof addressSchema>;
export type PersonalMoralValues = z.infer<typeof personalMoralSchema>;
export type PersonalFisicaValues = z.infer<typeof personalFisicaSchema>;

export function buildRegistrationPayload(
  typePerson: TypePerson,
  address: AddressFormValues,
  personal: PersonalMoralValues | PersonalFisicaValues,
  company?: CompanyCustomerValues | CompanyPartnerValues,
): RegistrationPayload {
  const isMoral = typePerson === TypePerson.Moral;

  if (isMoral && !company) {
    throw new Error("Datos de empresa requeridos para persona moral");
  }

  const fisica = personal as PersonalFisicaValues;
  const moralPersonal = personal as PersonalMoralValues;

  return {
    rfc: isMoral ? company!.rfc : fisica.rfc,
    company_name: company?.company_name,
    economic_activity:
      "economic_activity" in (company ?? {})
        ? (company as CompanyPartnerValues).economic_activity
        : undefined,
    business_activity:
      "business_activity" in (company ?? {})
        ? (company as CompanyPartnerValues).business_activity
        : undefined,
    taxpayer_type_id: typePerson,
    address: {
      street: address.street,
      num_ext: address.num_ext,
      num_int: address.num_int || undefined,
      neighborhood: address.neighborhood,
      district: address.district,
      estate: address.estate,
      cp: address.cp,
      reference: address.reference || undefined,
    },
    contact_name: isMoral
      ? moralPersonal.contact_name
      : `${fisica.name} ${fisica.ap_paterno} ${fisica.ap_materno}`,
    contact_email: personal.contact_email,
    contact_tel: personal.contact_tel,
    company_tel:
      company && "company_tel" in company
        ? (company as CompanyPartnerValues).company_tel
        : undefined,
    affiliation_code: company?.affiliation_code || undefined,
    name: isMoral ? undefined : fisica.name,
    ap_paterno: isMoral ? undefined : fisica.ap_paterno,
    ap_materno: isMoral ? undefined : fisica.ap_materno,
  };
}
