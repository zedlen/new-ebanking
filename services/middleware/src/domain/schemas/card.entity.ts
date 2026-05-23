import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

@Entity()
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ primary: true })
  account_id!: string;

  @Column()
  type!: CardType;

  @Column()
  active_function!: string;

  @Column()
  masked_pan!: string;

  @Column({ nullable: true })
  cardholder_name?: string;

  @Column({ nullable: true })
  product_type?: string;

  @Column()
  status!: CardStatus;

  @Column({ type: 'varchar', nullable: true })
  status_reason?: CardStatusReason;

  @Column({ nullable: true })
  embossing_setup_id?: string;

  @Column({ nullable: true })
  embossing_status?: string;

  @Column({ nullable: true })
  profile_id?: string;

  @Column()
  brand!: string;

  @Column({ nullable: true })
  alias?: string;

  @Column({ type: 'jsonb', nullable: true })
  address?: Record<string, unknown> | null;

  @Column()
  issuing_country!: string;

  @Column()
  is_multiapp!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, unknown> | null;

  @Column()
  creation_date!: string;

  @Column()
  update_date!: string;

  @Column()
  external_id!: string;

  @Column({ nullable: true })
  cancel_date?: string;

  @Column()
  app!: string;
}
