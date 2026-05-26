import { AffiliationRequest } from '@middleware/domain/entities/affiliationRequest.entity';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { AffiliationRequestRepository } from '@middleware/domain/repositories/affiliationRequest.interface';
import { AffiliationRequest as AffiliationRequestSchema } from '@middleware/domain/schemas/affiliationRequest.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AffiliationRequestPostgresRepository extends AffiliationRequestRepository {
  constructor(
    @InjectRepository(AffiliationRequestSchema)
    private affiliationRequestModel: Repository<AffiliationRequestSchema>,
  ) {
    super();
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination: Pagination,
  ): Promise<{ total: number; data: AffiliationRequest[] }> {
    const [data, total] = await this.affiliationRequestModel.findAndCount({
      where: params,
      skip: pagination.offset,
      take: pagination.limit,
    });
    return { total, data: data as AffiliationRequest[] };
  }

  async findOne(
    query: Partial<AffiliationRequest>,
  ): Promise<AffiliationRequest> {
    return (await this.affiliationRequestModel.findOne({
      where: query,
    })) as AffiliationRequest;
  }

  async get(id: string): Promise<AffiliationRequest | null> {
    return (await this.affiliationRequestModel.findOneBy({
      id,
    })) as AffiliationRequest | null;
  }

  async getAll(): Promise<{ total: number; data: AffiliationRequest[] }> {
    const [data, total] = await this.affiliationRequestModel.findAndCount();
    return { total, data: data as AffiliationRequest[] };
  }

  async save(item: AffiliationRequest): Promise<AffiliationRequest> {
    const affiliationRequest = await this.affiliationRequestModel.save(item);
    return {
      id: affiliationRequest.id,
      parent_id: affiliationRequest.parent_id,
      rfc: affiliationRequest.rfc,
      company_name: affiliationRequest.company_name,
      name: affiliationRequest.name,
      ap_paterno: affiliationRequest.ap_paterno,
      ap_materno: affiliationRequest.ap_materno,
      taxpayer_type_id: affiliationRequest.taxpayer_type_id,
      address: affiliationRequest.address,
      contact_name: affiliationRequest.contact_name,
      contact_email: affiliationRequest.contact_email,
      contact_tel: affiliationRequest.contact_tel,
      status: affiliationRequest.status,
      app: affiliationRequest.app,
      active: affiliationRequest.active,
    };
  }

  async update(
    id: string,
    item: Partial<AffiliationRequest>,
  ): Promise<boolean> {
    const affiliationRequest = await this.affiliationRequestModel.preload({
      id,
      ...item,
    });
    if (!affiliationRequest) {
      return false;
    }
    await this.affiliationRequestModel.save(affiliationRequest);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.affiliationRequestModel.delete({ id });
    return true;
  }

  async softDelete(id: string): Promise<boolean> {
    const affiliationRequest = await this.affiliationRequestModel.preload({
      id,
      active: false,
    });

    if (!affiliationRequest) {
      return false;
    }

    await this.affiliationRequestModel.save(affiliationRequest);
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.affiliationRequestModel.count({ where: params });
  }
}
