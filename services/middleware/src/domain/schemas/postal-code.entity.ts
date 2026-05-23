import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'postal_codes' })
export class PostalCode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  postal_code!: string;

  @Column()
  colony!: string;

  @Column()
  municipality!: string;

  @Column()
  state!: string;

  @Column()
  city!: string;

  @Column()
  state_code!: string;

  @Column()
  municipality_code!: string;

  @Column()
  settlement_type!: string;

  @Column()
  zone_type!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ default: 0 })
  usage_count!: number;
}
