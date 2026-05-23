import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class FeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ primary: true, nullable: false })
  slug!: string;

  @Column()
  description!: string;

  @Column()
  status!: 'alpha' | 'beta' | 'released' | 'obsolet' | 'rollback';

  @Column()
  releaseDate!: Date;

  @Column({ type: 'jsonb', default: [] })
  activeUsers!: string[];

  @Column({ type: 'jsonb', default: [] })
  excludeUsers!: string[];

  @Column()
  enableAll!: boolean;
}
