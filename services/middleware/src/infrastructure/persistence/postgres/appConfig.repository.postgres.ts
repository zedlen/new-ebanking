import { AppConfig } from '@middleware/domain/schemas/appConfig.entity';
import { AppConfigRepository } from '@middleware/domain/repositories/appConfig.interface';
import { AppConfig as AppConfigSchema } from '@middleware/domain/schemas/appConfig.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';

@Injectable()
export class AppConfigPostgresRepository extends AppConfigRepository {
  constructor(
    @InjectRepository(AppConfigSchema)
    private appConfigModel: Repository<AppConfigSchema>,
  ) {
    super();
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination: Pagination,
  ): Promise<{ total: number; data: AppConfig[] }> {
    const [total, data] = await Promise.all([
      this.count(params),
      this.appConfigModel.find({
        where: params,
        skip: pagination.offset,
        take: pagination.limit,
      }),
    ]);
    return { total, data: data };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<AppConfig> {
    return (await this.appConfigModel.findOne({
      where: params,
    })) as AppConfig;
  }

  async get(id: string): Promise<AppConfig | null> {
    return await this.appConfigModel.findOneBy({
      id,
    });
  }

  async getAll(): Promise<{ total: number; data: AppConfig[] }> {
    const [total, data] = await Promise.all([
      this.count({}),
      this.appConfigModel.find(),
    ]);
    return { total, data };
  }

  async save(item: AppConfig): Promise<AppConfig> {
    const appConfig = await this.appConfigModel.save(item);
    return {
      id: appConfig.id,
      appName: appConfig.appName,
      config: appConfig.config as Record<string, any>,
      active: appConfig.active,
      version: appConfig.version,
    };
  }

  async update(id: string, item: Partial<AppConfig>): Promise<boolean> {
    const config = await this.appConfigModel.preload({ id, ...item });
    if (!config) {
      return false;
    }
    await this.appConfigModel.save(config);
    return true;
  }

  async softDelete(item: Partial<AppConfig>): Promise<boolean> {
    const config = await this.appConfigModel.preload({
      id: item.id,
      active: false,
    });
    if (!config) {
      return false;
    }
    await this.appConfigModel.save(config);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.appConfigModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.appConfigModel.count({ where: params });
  }
}
