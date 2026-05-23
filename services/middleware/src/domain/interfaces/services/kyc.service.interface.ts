import {
  KYCReview,
  KYCStatus,
} from '@middleware/domain/entities/kycReview.entity';

export abstract class KycService {
  abstract requestValidation(data: Record<string, any>): Promise<KYCReview>;
  abstract getValidationStatus(id: string): Promise<KYCReview>;
  abstract updateValidationStatus(
    id: string,
    status: KYCStatus,
    metadata?: Record<string, any>,
    providerPayload?: Record<string, any>,
  ): Promise<KYCReview>;
  abstract findValidationByParams(
    params: Record<string, any>,
  ): Promise<KYCReview>;
}
