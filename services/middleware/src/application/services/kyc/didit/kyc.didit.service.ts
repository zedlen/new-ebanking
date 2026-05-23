import {
  KycProvider,
  KYCReview,
  KYCStatus,
} from '@middleware/domain/entities/kycReview.entity';
import { KYCReviewRepository as KycReviewRepository } from '@middleware/domain/repositories/kycReview.interface';
import { KycService } from '@middleware/domain/interfaces/services/kyc.service.interface';
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KycDiditService implements KycService {
  private readonly httpTimeout = 10000; // 10 seconds
  private readonly workflowId: string;
  private readonly apiKey: string;
  constructor(
    private readonly kycRepository: KycReviewRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.workflowId = this.configService.get<string>('DIDIT_WORKFLOW_ID', '');
    this.apiKey = this.configService.get<string>('DIDIT_API_KEY', '');
  }

  async requestValidation(data: Record<string, any>): Promise<KYCReview> {
    /**
     * workflow_id
     * vendor_data: user_id
     * callback: url
     * metadata: {}
     * language: es
     * contact_details: email, send_notification_emails, email_lang, phone */
    if (!data.user_id)
      throw new UnprocessableEntityException('user_id is required');
    if (!this.workflowId)
      throw new UnprocessableEntityException('KYC workflow is not configured');
    if (!this.apiKey)
      throw new UnprocessableEntityException('KYC provider is not configured');
    const response = await this.httpService.axiosRef.post(
      'https://verification.didit.me/v2/session',
      {
        workflow_id: this.workflowId,
        vendor_data: data.user_id,
        metadata: data.metadata || {},
      },
      {
        headers: {
          'x-api-key': this.apiKey,
        },
        timeout: this.httpTimeout,
      },
    );
    if (response.status !== 201)
      throw new UnprocessableEntityException('Error starting KYC process');
    const kycReview: Omit<KYCReview, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: data.user_id as string,
      status: KYCStatus.PENDING,
      provider: KycProvider.DIDIT,
      providerReferenceId: response.data.session_id as string,
      rejectionReason: '',
      providerPayload: null,
      metadata: {
        url: response.data.url as string,
      },
      completedAt: null,
    };
    return this.kycRepository.save(kycReview);
  }

  async getValidationStatus(id: string): Promise<KYCReview> {
    //https://verification.didit.me/v2/session/sessionId/decision
    if (!id) throw new UnprocessableEntityException('user_id is required');
    if (!this.apiKey)
      throw new UnprocessableEntityException('KYC provider is not configured');
    const kycReview = await this.kycRepository.get(id);
    if (!kycReview) throw new NotFoundException('KYC review not found');
    const response = await this.httpService.axiosRef.get(
      `https://verification.didit.me/v2/session/${kycReview.providerReferenceId}/decision`,
      {
        headers: {
          'x-api-key': this.apiKey,
        },
        timeout: this.httpTimeout,
      },
    );
    if (response.status !== 200)
      throw new UnprocessableEntityException('Error getting KYC status');
    let status: KYCStatus = KYCStatus.PENDING;
    if (response.data.status === 'Approved') {
      status = KYCStatus.APPROVED;
    }
    if (response.data.status === 'Declined') {
      status = KYCStatus.REJECTED;
    }
    kycReview.status = status;
    kycReview.providerPayload = response.data as Record<string, any>;
    await this.kycRepository.update(kycReview.id as string, kycReview);
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
    const response = await this.httpService.axiosRef.get(
      `https://verification.didit.me/v2/session/${kycReview.providerReferenceId}/decision`,
      {
        headers: {
          'x-api-key': this.apiKey,
        },
        timeout: this.httpTimeout,
      },
    );
    if (response.status !== 200)
      throw new UnprocessableEntityException('Error getting KYC status');
    let status: KYCStatus = KYCStatus.PENDING;
    if (response.data.status === 'Approved') {
      status = KYCStatus.APPROVED;
    }
    if (response.data.status === 'Declined') {
      status = KYCStatus.REJECTED;
    }
    kycReview.status = status;
    kycReview.providerPayload = response.data as Record<string, any>;
    await this.kycRepository.update(kycReview.id as string, kycReview);
    return kycReview;
  }
}
