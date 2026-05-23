import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'economic_activities' })
export class EconomicActivity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  subcategory?: string;
}
