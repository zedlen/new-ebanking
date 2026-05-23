import { AppConfigField } from '@middleware/domain/schemas/appConfigField.entity';
import { AppConfigFieldRepository } from '@middleware/domain/repositories/appConfigField.interface';
import { AppConfigField as AppConfigFieldModel } from '@middleware/domain/schemas/appConfigField.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';

@Injectable()
export class AppConfigFieldPostgresRepository extends AppConfigFieldRepository {
  constructor(
    @InjectRepository(AppConfigFieldModel)
    private appConfigFieldModel: Repository<AppConfigFieldModel>,
  ) {
    super();
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination: Pagination,
  ): Promise<{ total: number; data: AppConfigField[] }> {
    const [total, data] = await Promise.all([
      this.count(params),
      this.appConfigFieldModel.find({
        where: params,
        skip: pagination.offset,
        take: pagination.limit,
      }),
    ]);
    return { total, data };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<AppConfigField | null> {
    return await this.appConfigFieldModel.findOne({ where: params });
  }

  async get(id: string): Promise<AppConfigField | null> {
    return await this.appConfigFieldModel.findOneBy({ id });
  }

  async getAll(): Promise<{ total: number; data: AppConfigField[] }> {
    const [total, data] = await Promise.all([
      this.count({}),
      this.appConfigFieldModel.find(),
    ]);
    return { total, data };
  }

  async save(item: AppConfigField): Promise<AppConfigField> {
    const appConfigField = await this.appConfigFieldModel.save(item);
    return {
      id: appConfigField.id,
      name: appConfigField.name,
      description: appConfigField.description,
      active: appConfigField.active,
      type: appConfigField.type,
      slug: appConfigField.slug,
      required: appConfigField.required,
    };
  }

  async update(id: string, item: Partial<AppConfigField>): Promise<boolean> {
    const field = await this.appConfigFieldModel.preload({ id, ...item });
    if (!field) {
      return false;
    }
    await this.appConfigFieldModel.save(field);
    return true;
  }

  async softDelete(item: Partial<AppConfigField>): Promise<boolean> {
    await this.appConfigFieldModel.update(item, { active: false });
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.appConfigFieldModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.appConfigFieldModel.count({ where: params });
  }
}
