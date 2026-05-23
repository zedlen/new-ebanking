import { TypePerson } from "@/types/partners";

const PERSON_LABELS: Record<TypePerson, string> = {
  [TypePerson.Fisica]: "Persona física",
  [TypePerson.Moral]: "Persona moral",
};

export function getPersonTypeLabel(type: TypePerson): string {
  return PERSON_LABELS[type] ?? "Desconocido";
}

export function getDisplayName(entity: {
  taxpayer_type_id?: TypePerson;
  company_name?: string;
  contact_name?: string;
  name?: string;
}): string {
  if (entity.taxpayer_type_id === TypePerson.Fisica) {
    return entity.contact_name || entity.name || entity.company_name || "—";
  }
  return entity.company_name || entity.contact_name || entity.name || "—";
}

export function formatCurrency(amount?: number, currency = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(amount ?? 0);
}

export function formatDateTime(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatDateForApi(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatAddress(address?: {
  street?: string;
  num_ext?: string;
  num_int?: string;
  neighborhood?: string;
  district?: string;
  estate?: string;
  cp?: string;
}): string {
  if (!address) return "—";
  const parts = [
    address.street && `Calle ${address.street}`,
    address.num_ext && `Ext. ${address.num_ext}`,
    address.num_int && `Int. ${address.num_int}`,
    address.neighborhood && `Col. ${address.neighborhood}`,
    address.district,
    address.estate,
    address.cp && `C.P. ${address.cp}`,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    "0": "Desconocido",
    "1": "Creado",
    "2": "En proceso",
    "3": "Aprobado",
    "4": "Rechazado",
  };
  return labels[status] ?? status;
}
