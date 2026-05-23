export enum MovementStatus {
  Send = "sent",
  Stopped = "stoped",
  Canceled = "canceled",
  Liquidated = "scattered",
  Applied = "applied",
  Pending = "pending",
  InTransit = "in_transit",
  Created = "created",
  Returned = "returned",
}

export const MOVEMENT_STATUS_LABELS: Record<string, string> = {
  [MovementStatus.Send]: "Enviado",
  [MovementStatus.Stopped]: "Detenido",
  [MovementStatus.Canceled]: "Cancelado",
  [MovementStatus.Liquidated]: "Liquidado",
  [MovementStatus.Applied]: "Aplicado",
  [MovementStatus.Pending]: "Pendiente",
  [MovementStatus.InTransit]: "En tránsito",
  [MovementStatus.Created]: "Creado",
  [MovementStatus.Returned]: "Devuelto",
};

export const TRANSACTION_TYPE_LABELS: Record<number, string> = {
  1: "SPEI salida",
  2: "SPEI entrada",
  3: "Traspaso",
  4: "Compra",
  5: "Retiro",
  6: "Comisión por consulta de saldo",
  7: "Comisión por operación",
};

export interface MovementListItem {
  id: string;
  external_id: string;
  account_id: string;
  type: number;
  amount: number;
  folio: string;
  status: MovementStatus | string;
  operation_date: string;
  application_date?: string;
  payment_purpose?: string;
  reference?: number | string;
  tracking_key?: string;
}

export interface MovementsInfo {
  image: string;
  name: string;
  balance: number;
}

export interface MovementsResponse {
  total: number;
  data: MovementListItem[];
  info: MovementsInfo;
}

export interface MovementDetail extends MovementListItem {
  origin_bank_id?: string;
  payer_name?: string;
  payer_account?: string;
  payer_rfc?: string;
  destination_bank_id?: string;
  beneficiary_name?: string;
  beneficiary_account?: string;
  beneficiary_rfc?: string;
  detail?: Array<{
    id: number;
    movement_id: string;
    ts: string;
    status: string;
    message?: string;
  }>;
}

export interface MovementContext {
  partnerId: string;
  accountId: string;
  customerId?: string;
  walletId?: string;
}
