import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum KYCStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  DECLINED = 3,
}

export enum KycProvider {
  DIDIT = 'didit',
  MANUAL = 'manual',
}

@Entity()
export class KycReview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'enum', enum: KycProvider })
  provider!: KycProvider;

  @Column({ type: 'varchar', nullable: true })
  providerReferenceId?: string | null;

  @Column({ type: 'enum', enum: KYCStatus, default: KYCStatus.PENDING })
  status!: KYCStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  providerPayload?: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date | null;
}
