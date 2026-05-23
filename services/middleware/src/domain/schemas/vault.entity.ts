import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Vault {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column()
  external_id!: string;

  @Column({ nullable: true })
  alias?: string;

  @Column('numeric', { precision: 18, scale: 4, default: 0 })
  amount!: number;

  @Column()
  currency!: string;

  @Column()
  app!: string;
}
