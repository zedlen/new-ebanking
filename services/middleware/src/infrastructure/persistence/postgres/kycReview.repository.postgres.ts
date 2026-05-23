import { KycReview } from '@middleware/domain/schemas/kycReview.entity';
import { KYCReview as KycReviewEntity } from '@middleware/domain/entities/kycReview.entity';
import { KYCReviewRepository as KycReviewRepository } from '@middleware/domain/repositories/kycReview.interface';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class KYCReviewPostgresRepository extends KycReviewRepository {
  constructor(
    @InjectRepository(KycReview)
    private kycReviewModel: Repository<KycReview>,
  ) {
    super();
  }

  private transforData(kycReview: KycReview): KycReviewEntity {
    return {
      id: kycReview.id,
      userId: kycReview.userId,
      status: kycReview.status,
      provider: kycReview.provider,
      providerReferenceId: kycReview.providerReferenceId ?? '',
      createdAt: kycReview.createdAt,
      updatedAt: kycReview.updatedAt,
      rejectionReason: kycReview.rejectionReason ?? '',
      providerPayload: kycReview.providerPayload ?? {},
      metadata: kycReview.metadata ?? {},
      completedAt: kycReview.completedAt ?? null,
    };
  }

  private mapData(results: KycReview[]): KycReviewEntity[] {
    return results?.map((result) => this.transforData(result)) ?? [];
  }
  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination?: Pagination,
  ): Promise<{ total: number; data: KycReviewEntity[] }> {
    let pagFilters = {};
    if (pagination) {
      pagFilters = {
        skip: pagination.offset,
        take: pagination.limit,
      };
    }
    const [data, total] = await this.kycReviewModel.findAndCount({
      where: params,
      ...pagFilters,
    });

    return { total, data: this.mapData(data) };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<KycReviewEntity | null> {
    const result = await this.kycReviewModel.findOne({ where: params });
    if (!result) {
      return null;
    }
    return this.transforData(result);
  }

  async get(id: string): Promise<KycReviewEntity | null> {
    const result = await this.kycReviewModel.findOne({ where: { id } });
    if (!result) {
      return null;
    }
    return this.transforData(result);
  }

  async getAll(
    pagination?: Pagination,
  ): Promise<{ total: number; data: KycReviewEntity[] }> {
    let pagFilters = {};
    if (pagination) {
      pagFilters = {
        skip: pagination.offset,
        take: pagination.limit,
      };
    }
    const [data, total] = await this.kycReviewModel.findAndCount({
      ...pagFilters,
    });

    return { total, data: this.mapData(data) };
  }

  async save(item: KycReviewEntity): Promise<KycReviewEntity> {
    const kycReview = await this.kycReviewModel.save(item as KycReview);
    return {
      id: kycReview.id,
      userId: kycReview.userId,
      status: kycReview.status,
      provider: kycReview.provider,
      providerReferenceId: kycReview.providerReferenceId ?? '',
      createdAt: kycReview.createdAt,
      updatedAt: kycReview.updatedAt,
      rejectionReason: kycReview.rejectionReason ?? '',
      providerPayload: kycReview.providerPayload ?? {},
      metadata: kycReview.metadata ?? {},
      completedAt: kycReview.completedAt ?? null,
    };
  }

  async update(id: string, item: Partial<KycReview>): Promise<boolean> {
    const review = await this.kycReviewModel.preload({ id, ...item });
    if (!review) {
      return false;
    }
    await this.kycReviewModel.save(review);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.kycReviewModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.kycReviewModel.count({ where: params });
  }
}
