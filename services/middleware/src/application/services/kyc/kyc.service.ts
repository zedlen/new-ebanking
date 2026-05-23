import { Injectable } from '@nestjs/common';
import { KycDiditService } from './didit/kyc.didit.service';
import { KycManualService } from './manual/kyc.manual.service';
import {
  KycProvider,
  KYCStatus,
} from '@middleware/domain/entities/kycReview.entity';

@Injectable()
export class KycService {
  constructor(
    private readonly didit: KycDiditService,
    private readonly manual: KycManualService,
  ) {}

  async requestValidation(provider: KycProvider, data: Record<string, any>) {
    switch (provider) {
      case 'didit':
        return this.didit.requestValidation(data);
      case 'manual':
        return this.manual.requestValidation(data);
      default:
        throw new Error('KYC provider not supported');
    }
  }

  async getValidationStatus(provider: KycProvider, id: string) {
    switch (provider) {
      case 'didit':
        return this.didit.getValidationStatus(id);
      case 'manual':
        return this.manual.getValidationStatus(id);
      default:
        throw new Error('KYC provider not supported');
    }
  }

  async updateValidationStatus(
    provider: KycProvider,
    id: string,
    {
      status,
      metadata,
      providerPayload,
    }: {
      status: KYCStatus;
      metadata?: Record<string, any>;
      providerPayload?: Record<string, any>;
    },
  ) {
    switch (provider) {
      case 'didit':
        return this.didit.updateValidationStatus(
          id,
          status,
          metadata,
          providerPayload,
        );
      case 'manual':
        return this.manual.updateValidationStatus(
          id,
          status,
          metadata,
          providerPayload,
        );
      default:
        throw new Error('KYC provider not supported');
    }
  }

  async findValidationByParams(
    provider: KycProvider,
    params: Record<string, any>,
  ) {
    switch (provider) {
      case 'didit':
        return this.didit.findValidationByParams(params);
      case 'manual':
        return this.manual.findValidationByParams(params);
      default:
        throw new Error('KYC provider not supported');
    }
  }
}
