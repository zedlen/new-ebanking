import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { Address } from './address.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ primary: true })
  external_id!: string;

  @Column({ nullable: true })
  parent_id?: string;

  @Column()
  account_customer_id!: string;

  @Column()
  level!: number;

  @Column()
  rfc!: string;

  @Column({ nullable: true })
  company_name?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  ap_paterno?: string;

  @Column({ nullable: true })
  ap_materno?: string;

  @Column()
  taxpayer_type_id!: number;

  @Column({ nullable: false, type: 'jsonb', default: () => "'{}'" })
  address!: Address;

  @Column()
  contact_name!: string;

  @Column()
  contact_email!: string;

  @Column()
  contact_tel!: string;

  @Column()
  creation_date!: string;

  @Column({ default: 'https://cdn.ebanking-service.net/user.png' })
  image!: string;

  @Column({ nullable: true })
  affiliation_code?: string;

  @Column({ default: 'livingrock' })
  app!: string;

  @Column({ nullable: true })
  customer_type?: number;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  blocked?: boolean;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  role_id?: number;

  @Column({ nullable: true })
  otp?: string;
}
