import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailTemplate as MailTemplateModel } from '@middleware/domain/schemas/mail-template.entity';
import { MailTemplate } from '@middleware/domain/entities/mailTemplate.entity';
import { MailTemplateRepository } from '@middleware/domain/repositories/mailTemplate.interface';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';

@Injectable()
export class MailTemplatePostgresRepository extends MailTemplateRepository {
  constructor(
    @InjectRepository(MailTemplateModel)
    private readonly repo: Repository<MailTemplateModel>,
  ) {
    super();
  }

  async find(
    params: Record<string, string | number | boolean>,
    pagination?: Pagination,
  ): Promise<{ total: number; data: MailTemplate[] }> {
    const [data, total] = await this.repo.findAndCount({
      where: params,
      skip: pagination?.offset,
      take: pagination?.limit,
    });
    return { total, data: data as unknown as MailTemplate[] };
  }

  async findOne(
    params: Record<string, string | number | boolean>,
  ): Promise<MailTemplate> {
    return (await this.repo.findOne({
      where: params,
    })) as unknown as MailTemplate;
  }

  async get(id: string): Promise<MailTemplate | null> {
    return await this.repo.findOne({ where: { id } });
  }

  async getAll(): Promise<{ total: number; data: MailTemplate[] }> {
    const [data, total] = await this.repo.findAndCount();
    return { total, data: data as unknown as MailTemplate[] };
  }

  async save(item: MailTemplate): Promise<MailTemplate> {
    const created = this.repo.create(item as unknown as MailTemplateModel);
    return await this.repo.save(created);
  }

  async update(id: string, item: Partial<MailTemplate>): Promise<boolean> {
    const existing = await this.repo.preload({ id, ...item });
    if (!existing) {
      return false;
    }
    await this.repo.save(existing);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.repo.delete({ id });
    return true;
  }

  count(params: Record<string, string | number | boolean>): Promise<number> {
    return this.repo.count({ where: params });
  }
}
