import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'document_types' })
export class DocumentTypeRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column()
  displayName!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ type: 'jsonb', default: [] })
  patterns!: string[];

  @Column({ type: 'jsonb', default: [] })
  identificationKeywords!: string[];

  @Column({ type: 'jsonb', default: [] })
  addressKeywords!: string[];

  @Column({ default: 0 })
  priority!: number;

  @Column({ default: false })
  required!: boolean;

  @Column({ default: 2 })
  maxFiles!: number;
}
