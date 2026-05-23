import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Movement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ primary: true })
  external_id!: string;

  @Column({ primary: true })
  account_id!: string;

  @Column({ nullable: true })
  type!: number;

  @Column({ nullable: true })
  description!: string;

  @Column('numeric', { precision: 18, scale: 4, default: 0 })
  amount!: number;

  @Column({ primary: true })
  folio!: string;

  @Column()
  status!: string;

  @Column()
  operation_date!: string;

  @Column({ nullable: true })
  application_date!: string;

  @Column({ nullable: true })
  origin_bank_id!: string;

  @Column({ nullable: true })
  payer_name!: string;

  @Column({ nullable: true })
  payer_account!: string;

  @Column({ nullable: true })
  destination_bank_id!: string;

  @Column({ nullable: true })
  beneficiary_name!: string;

  @Column({ nullable: true })
  beneficiary_account!: string;

  @Column({ nullable: true })
  payment_purpose!: string;

  @Column({ nullable: true })
  reference!: number;

  @Column({ nullable: true })
  tracking_key!: string;

  @Column()
  app!: string;
}
