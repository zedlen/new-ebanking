import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'onboardings' })
export class OnboardingRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  uuid!: string;

  @Column({ nullable: true })
  rfc?: string;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ type: 'jsonb', nullable: true })
  form_data?: Record<string, unknown>;

  @Column({ type: 'jsonb', default: [] })
  documents!: Record<string, unknown>[];

  @Column({ type: 'jsonb', nullable: true })
  address?: Record<string, unknown>;

  @Column({ nullable: true })
  economic_activity_code?: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}
