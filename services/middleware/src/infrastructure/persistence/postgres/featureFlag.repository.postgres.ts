import { FeatureFlag } from '@middleware/domain/schemas/featureFlag.entity';
import { FeatureFlagRepository } from '@middleware/domain/repositories/featureFlag.interface';
import { FeatureFlag as FeatureFlagSchema } from '@middleware/domain/schemas/featureFlag.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';

@Injectable()
export class FeatureFlagPostgresRepository extends FeatureFlagRepository {
  constructor(
    @InjectRepository(FeatureFlagSchema)
    private featureFlagModel: Repository<FeatureFlagSchema>,
  ) {
    super();
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination: Pagination,
  ): Promise<{ total: number; data: FeatureFlag[] }> {
    const [data, total] = await this.featureFlagModel.findAndCount({
      where: params,
      skip: pagination.offset,
      take: pagination.limit,
    });
    return { total, data };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<FeatureFlag | null> {
    return await this.featureFlagModel.findOne({ where: params });
  }

  async get(id: string): Promise<FeatureFlag | null> {
    return await this.featureFlagModel.findOneBy({ id });
  }

  async getAll(): Promise<{ total: number; data: FeatureFlag[] }> {
    const [data, total] = await this.featureFlagModel.findAndCount();
    return { total, data };
  }

  async save(item: Omit<FeatureFlag, 'id'>): Promise<FeatureFlag> {
    const featureFlag = await this.featureFlagModel.save(item);
    return {
      id: featureFlag.id,
      slug: featureFlag.slug,
      description: featureFlag.description,
      status: featureFlag.status,
      releaseDate: featureFlag.releaseDate,
      activeUsers: featureFlag.activeUsers,
      excludeUsers: featureFlag.excludeUsers,
      enableAll: featureFlag.enableAll,
    };
  }

  async update(id: string, item: Partial<FeatureFlag>): Promise<boolean> {
    const feature = await this.featureFlagModel.preload({ id, ...item });
    if (!feature) {
      return false;
    }
    await this.featureFlagModel.save(feature);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.featureFlagModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.featureFlagModel.count({ where: params });
  }
}
