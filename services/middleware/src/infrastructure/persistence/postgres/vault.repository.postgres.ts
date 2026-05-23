import { Vault } from '@middleware/domain/entities/vault.entity';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaultRepository } from '@middleware/domain/repositories/vault.interface';
import { Vault as VaultSchema } from '@middleware/domain/schemas/vault.entity';

@Injectable()
export class VaultPostgresRepository extends VaultRepository {
  constructor(
    @InjectRepository(VaultSchema)
    private accountModel: Repository<VaultSchema>,
  ) {
    super();
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination?: Pagination,
  ): Promise<{ total: number; data: Vault[] }> {
    const [data, total] = await this.accountModel.findAndCount({
      where: params,
      ...(pagination && { skip: pagination.offset, take: pagination.limit }),
    });
    return { total, data };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<Vault | null> {
    return this.accountModel.findOne({ where: params });
  }

  async get(id: string): Promise<Vault | null> {
    return this.accountModel.findOneBy({ id });
  }

  async getAll(
    pagination?: Pagination,
  ): Promise<{ total: number; data: Vault[] }> {
    const [data, total] = await this.accountModel.findAndCount({
      ...(pagination && {
        skip: pagination.offset,
        take: pagination.limit,
      }),
    });

    return { total, data };
  }

  async save(item: Vault): Promise<Vault> {
    return this.accountModel.save(item);
  }

  async update(id: string, item: Partial<Vault>): Promise<boolean> {
    await this.accountModel.update({ id }, item);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.accountModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.accountModel.count({ where: params });
  }
}
