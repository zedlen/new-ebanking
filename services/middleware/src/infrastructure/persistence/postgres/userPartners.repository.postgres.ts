import { UserPartners } from '@middleware/domain/entities/userPartners.entity';
import { UserPartnersRepository } from '@middleware/domain/repositories/userPartners.interface';
import { UserPartners as UserPartnersSchema } from '@middleware/domain/schemas/userPartners.entity';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserPartnersPostgresRepository extends UserPartnersRepository {
  constructor(
    @InjectRepository(UserPartnersSchema)
    private userPartnersModel: Repository<UserPartnersSchema>,
  ) {
    super();
  }

  private transforData(
    results: UserPartnersSchema | UserPartnersSchema[],
  ): UserPartners | UserPartners[] | null {
    if (!results) {
      return null;
    }
    if (results instanceof Array) {
      return results?.map((userPartners) => ({
        id: userPartners.id,
        customerId: userPartners.customerId,
        asignedPartners: userPartners.asignedPartners,
        allPartners: userPartners.allPartners,
      }));
    }

    return {
      id: results.id,
      customerId: results.customerId,
      asignedPartners: results.asignedPartners,
      allPartners: results.allPartners,
    };
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination?: Pagination,
  ): Promise<{ total: number; data: UserPartners[] }> {
    let pagFilters = {};
    if (pagination) {
      pagFilters = {
        skip: pagination.offset,
        take: pagination.limit,
      };
    }
    const [data, total] = await this.userPartnersModel.findAndCount({
      where: params,
      ...pagFilters,
    });

    return { total, data };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<UserPartners | null> {
    return this.userPartnersModel.findOne({ where: params });
  }

  async get(id: string): Promise<UserPartners | null> {
    return this.userPartnersModel.findOneBy({ id });
  }

  async getAll(
    pagination?: Pagination,
  ): Promise<{ total: number; data: UserPartners[] }> {
    let pagFilters = {};
    if (pagination) {
      pagFilters = {
        skip: pagination.offset,
        take: pagination.limit,
      };
    }
    const [data, total] = await this.userPartnersModel.findAndCount({
      ...pagFilters,
    });
    return { total, data };
  }

  async save(item: UserPartners): Promise<UserPartners> {
    const userPartners = await this.userPartnersModel.save(item);
    return {
      id: userPartners.id,
      customerId: userPartners.customerId,
      asignedPartners: userPartners.asignedPartners,
      allPartners: userPartners.allPartners,
    };
  }

  async update(id: string, item: Partial<UserPartners>): Promise<boolean> {
    await this.userPartnersModel.update({ id }, item);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.userPartnersModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.userPartnersModel.count({ where: params });
  }
}
