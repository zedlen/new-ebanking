import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'card_charges' })
@Index(['customer', 'ts'])
@Index(['customer', 'tsCst'])
export class CardCharge {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamptz' })
  ts!: Date;

  @Column({ name: 'ts_cst', type: 'timestamptz' })
  tsCst!: Date;

  @Column({ type: 'varchar' })
  @Index()
  customer!: string;

  // 🔹 Objetos anidados como JSONB
  @Column({ type: 'jsonb' })
  request_headers!: {
    Uuid: string;
    'Client-Id': string;
    'Legacy-Id': string;
  };

  @Column({ type: 'jsonb' })
  request!: {
    body: {
      authorization_code: string;
      card_id: string;
      card_number: string;
      card_status: string;
      product_id: string;
      external_account_id: string;
      processing: {
        type: string;
      };
      values: {
        billing_value: string;
        billing_currency_code: string;
        billing_conversion_rate: string;
      };
      establishment: string;
    };
    url: string;
  };

  @Column({ type: 'jsonb' })
  response!: {
    status_code: string;
    body: {
      response: string;
      reason: string;
    };
  };

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
