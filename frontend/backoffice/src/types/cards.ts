export enum CardStatus {
  Normal = "NORMAL",
  Blocked = "BLOCKED",
  Cancelled = "CANCELED",
}

export enum CardType {
  Virtual = "VIRTUAL",
  Physical = "PHYSICAL",
}

export const CARD_TYPE_LABELS: Record<string, string> = {
  [CardType.Virtual]: "Virtual",
  [CardType.Physical]: "Física",
};

export const CARD_STATUS_LABELS: Record<string, string> = {
  [CardStatus.Normal]: "Activa",
  [CardStatus.Blocked]: "Bloqueada",
  [CardStatus.Cancelled]: "Cancelada",
};

export const CARD_STATUS_ACTION: Record<string, string> = {
  [CardStatus.Normal]: "Bloquear",
  [CardStatus.Blocked]: "Desbloquear",
  [CardStatus.Cancelled]: "Cancelada",
};

export interface CardRecord {
  id: string;
  masked_pan: string;
  cardholder_name: string;
  type: CardType | string;
  status: CardStatus | string;
  status_reason?: string;
  brand?: string;
  product_type?: string;
  creation_date?: string;
  account_id?: string;
  alias?: string;
  issuing_country?: string;
  external_id?: string;
}

export interface CardAccountBundle {
  id: string;
  external_id: string;
  amount?: number;
  linked_cellphone?: string;
  card: CardRecord;
}

export interface ChangeCardStatusBody {
  status: string;
  statusReason: string | null;
}

export interface LinkCardBody {
  pan: string;
  accountId: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export const BLOCK_REASONS_VIRTUAL: SelectOption[] = [
  { value: "OWNER_REQUEST", label: "Bloqueo por solicitud del propietario" },
  { value: "SUSPICION_OF_FRAUD", label: "Bloqueo por sospecha de fraude" },
  { value: "TEMPORARILY", label: "Bloqueo temporal" },
  { value: "INACTIVITY", label: "Bloqueo por inactividad" },
  { value: "OTHER", label: "Otro" },
];

export const BLOCK_REASONS_PHYSICAL: SelectOption[] = [
  { value: "LOST", label: "Bloqueo por extravío" },
  { value: "SUSPICION_OF_FRAUD", label: "Bloqueo por sospecha de fraude" },
  { value: "OWNER_REQUEST", label: "Bloqueo por solicitud del propietario" },
  { value: "TEMPORARILY", label: "Bloqueo temporal" },
  { value: "INACTIVITY", label: "Bloqueo por inactividad" },
  { value: "OTHER", label: "Otro" },
];

export const CANCEL_REASONS_VIRTUAL: SelectOption[] = [
  { value: "THEFT", label: "Cancelar por robo" },
  { value: "OWNER_REQUEST", label: "Cancelar por solicitud del propietario" },
  { value: "TERMINATED_CONTRACT", label: "Cancelar por término de contrato" },
  { value: "SUSPICION_OF_FRAUD", label: "Cancelar por sospecha de fraude" },
  { value: "INACTIVITY", label: "Cancelar por inactividad" },
  { value: "OTHER", label: "Otro" },
];

export const CANCEL_REASONS_PHYSICAL: SelectOption[] = [
  { value: "LOST", label: "Cancelar por extravío" },
  { value: "THEFT", label: "Cancelar por robo" },
  { value: "OWNER_REQUEST", label: "Cancelar por solicitud del propietario" },
  { value: "TERMINATED_CONTRACT", label: "Cancelar por término de contrato" },
  { value: "MISPLACED_CARD", label: "Tarjeta no recibida" },
  { value: "SUSPICION_OF_FRAUD", label: "Cancelar por sospecha de fraude" },
  { value: "INACTIVITY", label: "Cancelar por inactividad" },
  { value: "OTHER", label: "Otro" },
];

export function blockReasonsForCardType(type: string): SelectOption[] {
  return type === CardType.Virtual
    ? BLOCK_REASONS_VIRTUAL
    : BLOCK_REASONS_PHYSICAL;
}

export function cancelReasonsForCardType(type: string): SelectOption[] {
  return type === CardType.Virtual
    ? CANCEL_REASONS_VIRTUAL
    : CANCEL_REASONS_PHYSICAL;
}
