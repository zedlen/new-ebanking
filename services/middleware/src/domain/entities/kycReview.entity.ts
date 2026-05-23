import { Entity } from '@middleware/domain/repositories/entity.interface';

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

export interface KYCReview extends Entity {
  id?: string;
  userId: string;
  status: KYCStatus;
  provider: KycProvider;
  providerReferenceId: string | null;
  rejectionReason: string | null;
  providerPayload: Record<string, any> | null;
  metadata: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt: Date | null;
}
