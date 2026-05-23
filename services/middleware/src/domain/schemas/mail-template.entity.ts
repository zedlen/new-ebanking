import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'mail_templates' })
export class MailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'jsonb' })
  design!: Record<string, unknown>;

  @Column()
  template_id!: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}
