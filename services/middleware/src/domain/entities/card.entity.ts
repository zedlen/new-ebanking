import { Entity } from '@middleware/domain/repositories/entity.interface';

export type CardType = 'VIRTUAL' | 'PHYSICAL';
export type CardStatus = 'BLOCKED' | 'CANCELED' | 'NORMAL';
export type CardStatusReason =
  | 'INVALID_PASSWORD'
  | 'OTHER'
  | 'OWNER_REQUEST'
  | 'SUSPICION_OF_FRAUD'
  | 'TEMPORARILY'
  | 'INACTIVITY'
  | 'LOST'
  | 'THEFT'
  | 'TERMINATED_CONTRACT'
  | 'MISPLACED_CARD'
  | null;

export const allowedStatuses: Record<
  CardType,
  Record<CardStatus, CardStatusReason[]>
> = {
  VIRTUAL: {
    BLOCKED: [
      'INVALID_PASSWORD',
      'OTHER',
      'OWNER_REQUEST',
      'SUSPICION_OF_FRAUD',
      'TEMPORARILY',
      'INACTIVITY',
    ],
    CANCELED: [
      'THEFT',
      'OTHER',
      'OWNER_REQUEST',
      'TERMINATED_CONTRACT',
      'SUSPICION_OF_FRAUD',
      'INACTIVITY',
    ],
    NORMAL: [null],
  },
  PHYSICAL: {
    BLOCKED: [
      'LOST',
      'INVALID_PASSWORD',
      'OTHER',
      'OWNER_REQUEST',
      'SUSPICION_OF_FRAUD',
      'TEMPORARILY',
      'INACTIVITY',
    ],
    CANCELED: [
      'LOST',
      'THEFT',
      'OTHER',
      'OWNER_REQUEST',
      'TERMINATED_CONTRACT',
      'MISPLACED_CARD',
      'SUSPICION_OF_FRAUD',
      'INACTIVITY',
    ],
    NORMAL: [null],
  },
};

export interface Card extends Entity {
  id?: string;
  type: CardType;
  active_function: string;
  masked_pan: string;
  cardholder_name: string;
  product_type: string;
  status: CardStatus;
  status_reason: CardStatusReason;
  embossing_setup_id: string;
  embossing_status: string;
  profile_id: string;
  account_id: string;

  brand: string;
  alias: string;
  address: object;
  issuing_country: string;
  is_multiapp: boolean;
  metadata: object;
  settings: object;
  creation_date: string;
  update_date: string;
  external_id: string;
  cancel_date?: string;
  app: string;
}
