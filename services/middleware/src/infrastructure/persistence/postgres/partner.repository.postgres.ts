import { Partner } from '@middleware/domain/entities/partners.entity';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { PartnerRepository } from '@middleware/domain/repositories/partner.interface';
import { Partner as PartnerSchema } from '@middleware/domain/schemas/partner.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class PartnerPostgresRepository extends PartnerRepository {
  constructor(
    @InjectRepository(PartnerSchema)
    private partnerModel: Repository<PartnerSchema>,
  ) {
    super();
  }

  mapToEntity(partner: PartnerSchema): Partner {
    return {
      id: partner.id,
      external_id: partner.external_id,
      rfc: partner.rfc,
      company_name: partner.company_name,
      economic_activity: partner.economic_activity,
      business_activity: partner.business_activity,
      taxpayer_type_id: partner.taxpayer_type_id,
      company_address: partner.company_address,
      address: partner.address,
      contact_name: partner.contact_name,
      contact_email: partner.contact_email,
      contact_tel: partner.contact_tel,
      company_tel: partner.company_tel,
      status: partner.status,
      creation_date: partner.creation_date,
      modification_date: partner.modification_date,
      image: partner.image,
      review_date: partner.review_date ?? '',
      process_date: partner.process_date ?? '',
      affiliation_code: partner.affiliation_code,
      app: partner.app,
      company_address_id: 0,
    };
  }
  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination: Pagination,
  ): Promise<{ total: number; data: Partner[] }> {
    const [data, total] = await this.partnerModel.findAndCount({
      where: params,
      skip: pagination.offset,
      take: pagination.limit,
    });

    return { total, data: data.map((partner) => this.mapToEntity(partner)) };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<Partner | null> {
    const partner = await this.partnerModel.findOne({ where: params });
    return partner ? this.mapToEntity(partner) : null;
  }

  async get(id: string): Promise<Partner | null> {
    const partner = await this.partnerModel.findOneBy({ id });
    return partner ? this.mapToEntity(partner) : null;
  }

  async getAll(): Promise<{ total: number; data: Partner[] }> {
    const [data, total] = await this.partnerModel.findAndCount();
    return { total, data: data.map((partner) => this.mapToEntity(partner)) };
  }

  async save(item: Partner): Promise<Partner> {
    const partner = await this.partnerModel.save(item);
    return this.mapToEntity(partner);
  }

  async update(id: string, item: Partial<Partner>): Promise<boolean> {
    const partner = await this.partnerModel.preload({ id, ...item });
    if (!partner) {
      return false;
    }
    await this.partnerModel.save(partner);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.partnerModel.delete({ id });
    return true;
  }

  async findByExternalIds(
    ids: [string],
  ): Promise<{ total: number; data: Partner[] }> {
    const [data, total] = await this.partnerModel.findAndCount({
      where: { external_id: In(ids) },
    });

    return { total, data: data.map((partner) => this.mapToEntity(partner)) };
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.partnerModel.count({ where: params });
  }

  async searchByQuery(query: string): Promise<Partner[]> {
    const partners = await this.partnerModel
      .createQueryBuilder('partner')
      .where('partner.company_name ILIKE :query', { query: `%${query}%` })
      .orWhere('partner.rfc ILIKE :query', { query: `%${query}%` })
      .orWhere('partner.contact_name ILIKE :query', { query: `%${query}%` })
      .getMany();

    return partners.map((partner) => this.mapToEntity(partner));
  }
}
