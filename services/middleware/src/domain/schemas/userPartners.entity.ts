import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserPartners {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ primary: true })
  customerId!: string;

  @Column({ type: 'jsonb', default: [] })
  asignedPartners!: string[];

  @Column()
  allPartners!: boolean;
}
