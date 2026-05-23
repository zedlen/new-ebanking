import { ProcessDocument as ProcessDocumentSchema } from '@middleware/domain/schemas/processDocument.entity';
import { ProcessDocument } from '@middleware/domain/entities/processDocument.entity';
import { ProcessDocumentRepository } from '@middleware/domain/repositories/processDocument.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';

@Injectable()
export class ProcessDocumentPostgresRepository extends ProcessDocumentRepository {
  constructor(
    @InjectRepository(ProcessDocumentSchema)
    private processDocumentModel: Repository<ProcessDocumentSchema>,
  ) {
    super();
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination: Pagination,
  ): Promise<{ total: number; data: ProcessDocument[] }> {
    const [data, total] = await this.processDocumentModel.findAndCount({
      where: params,
      skip: pagination.offset,
      take: pagination.limit,
    });
    return { total, data };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<ProcessDocument | null> {
    return await this.processDocumentModel.findOne({ where: params });
  }

  async get(id: string): Promise<ProcessDocument | null> {
    return await this.processDocumentModel.findOneBy({ id });
  }

  async getAll(): Promise<{ total: number; data: ProcessDocument[] }> {
    const [data, total] = await this.processDocumentModel.findAndCount();
    return { total, data };
  }

  async save(item: ProcessDocument): Promise<ProcessDocument> {
    const processDocument = (await this.processDocumentModel.save(
      item,
    )) as ProcessDocumentSchema;
    return {
      id: processDocument.id,
      fileName: processDocument.fileName,
      mimeType: processDocument.mimeType,
      checksum: processDocument.checksum,
      size: processDocument.size,
      url: processDocument.url,
      creation_date: processDocument.creation_date,
      parent_id: processDocument.parent_id,
      status: processDocument.status,
      totalRecords: processDocument.totalRecords,
      successfulRecords: processDocument.successfulRecords,
      failedRecords: processDocument.failedRecords,
      errorFileUrl: processDocument.errorFileUrl,
    };
  }

  async update(id: string, item: Partial<ProcessDocument>): Promise<boolean> {
    const document = await this.processDocumentModel.preload({ id, ...item });
    if (!document) {
      return false;
    }
    await this.processDocumentModel.save(document);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.processDocumentModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.processDocumentModel.count({ where: params });
  }
}
