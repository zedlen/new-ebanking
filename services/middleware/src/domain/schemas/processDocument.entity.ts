import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ProcessDocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIAL_COMPLETED = 'PARTIAL_COMPLETED',
}

@Entity()
export class ProcessDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ primary: true, nullable: false })
  fileName!: string;

  @Column()
  mimeType!: string;

  @Column({ primary: true, nullable: false })
  checksum!: string;

  @Column()
  size!: number;

  @Column()
  url!: string;

  @Column({ primary: true, nullable: false })
  parent_id!: string;

  @Column({
    enum: ProcessDocumentStatus,
    default: ProcessDocumentStatus.PENDING,
  })
  status!: ProcessDocumentStatus;

  @Column({ nullable: true })
  totalRecords?: number;

  @Column({ nullable: true })
  successfulRecords?: number;

  @Column({ nullable: true })
  failedRecords?: number;

  @Column({ nullable: true })
  errorFileUrl?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creation_date!: string;
}
