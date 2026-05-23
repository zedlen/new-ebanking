import { Entity } from '@middleware/domain/repositories/entity.interface';

export enum ProcessDocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIAL_COMPLETED = 'PARTIAL_COMPLETED',
}

export interface ProcessDocument extends Entity {
  id?: string;
  fileName: string;
  mimeType: string;
  checksum: string;
  size: number;
  url: string;
  creation_date?: string;
  parent_id: string;
  status: ProcessDocumentStatus;
  totalRecords?: number;
  successfulRecords?: number;
  failedRecords?: number;
  errorFileUrl?: string;
}
