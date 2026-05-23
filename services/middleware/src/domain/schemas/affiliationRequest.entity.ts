import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { Address } from './address.entity';

@Entity()
export class AffiliationRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  parent_id!: string;

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

  @Column()
  status!: 'pending' | 'approved' | 'rejected';
}
