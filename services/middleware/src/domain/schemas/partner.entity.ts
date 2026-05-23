import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { Address } from './address.entity';

@Entity()
export class Partner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ primary: true })
  external_id!: string;

  @Column()
  rfc!: string;

  @Column()
  company_name!: string;

  @Column()
  taxpayer_type_id!: number;

  @Column({ type: 'json', default: {} })
  company_address!: Address;

  @Column({ type: 'json', default: {} })
  address!: Address;

  @Column()
  contact_name!: string;

  @Column()
  contact_email!: string;

  @Column()
  contact_tel!: string;

  @Column()
  creation_date!: string;

  @Column()
  economic_activity!: string;

  @Column()
  business_activity!: string;

  @Column()
  company_tel!: string;

  @Column()
  status!: string;

  @Column({ nullable: true })
  modification_date!: string;

  @Column({ default: 'https://cdn.ebanking-service.net/user.png' })
  image!: string;

  @Column({ nullable: true })
  affiliation_code?: string;

  @Column({ nullable: true })
  review_date?: string;

  @Column({ nullable: true })
  process_date?: string;

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
