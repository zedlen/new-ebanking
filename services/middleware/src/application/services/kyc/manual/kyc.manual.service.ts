import {
  KycProvider,
  KYCReview,
  KYCStatus,
} from '@middleware/domain/entities/kycReview.entity';
import { KYCReviewRepository as KycReviewRepository } from '@middleware/domain/repositories/kycReview.interface';
import { KycService } from '@middleware/domain/interfaces/services/kyc.service.interface';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

@Injectable()
export class KycManualService implements KycService {
  constructor(private readonly kycRepository: KycReviewRepository) {}

  async requestValidation(data: Record<string, any>): Promise<KYCReview> {
    /**
     * workflow_id
     * vendor_data: user_id
     * callback: url
     * metadata: {}
     * language: es
     * contact_details: email, send_notification_emails, email_lang, phone */
    const kycReview: Omit<KYCReview, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: data.user_id as string,
      status: KYCStatus.PENDING,
      provider: KycProvider.MANUAL,
      providerReferenceId: null,
      rejectionReason: '',
      providerPayload: {},
      metadata: {},
      completedAt: null,
    };
    return this.kycRepository.save(kycReview);
  }

  async getValidationStatus(id: string): Promise<KYCReview> {
    //https://verification.didit.me/v2/session/sessionId/decision
    if (!id) throw new UnprocessableEntityException('user_id is required');
    const kycReview = await this.kycRepository.get(id);
    if (!kycReview) throw new NotFoundException('KYC review not found');
    return kycReview;
  }

  async updateValidationStatus(
    id: string,
    status: KYCStatus,
    metadata?: Record<string, any>,
    providerPayload?: Record<string, any>,
  ): Promise<KYCReview> {
    if (!id) throw new UnprocessableEntityException('user_id is required');
    const kycReview = await this.kycRepository.get(id);
    if (!kycReview) throw new NotFoundException('KYC review not found');
    kycReview.status = status;
    kycReview.metadata = metadata as Record<string, any>;
    kycReview.providerPayload = providerPayload as Record<string, any>;
    await this.kycRepository.update(kycReview.id as string, kycReview);
    return kycReview;
  }

  async findValidationByParams(
    params: Record<string, any>,
  ): Promise<KYCReview> {
    const kycReview = await this.kycRepository.findOne(params);
    if (!kycReview) throw new NotFoundException('KYC review not found');
    return kycReview;
  }
}
