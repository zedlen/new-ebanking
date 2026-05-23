import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

type Clabe = {
  id: string;
  account_id: string;
  payment_provider_id: string;
  clabe: string;
  cc: string;
};

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column()
  external_id!: string;

  @Column()
  customer_id!: string;

  @Column({ nullable: true })
  alias?: string;

  @Column()
  type!: number;

  @Column('numeric', { precision: 18, scale: 4, default: 0 })
  amount!: number;

  @Column()
  currency!: string;

  @Column({ nullable: true })
  linked_cellphone?: string;

  @Column()
  creation_date!: string;

  @Column({
    type: 'jsonb',
    array: false, // Ensure this is false to avoid creating a jsonb[] (array of JSONBs)
    default: () => "'[]'",
    nullable: false,
  })
  clabes!: Clabe[];

  @Column()
  app!: string;
}
