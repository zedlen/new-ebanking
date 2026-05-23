import { UserAgent } from '@middleware/domain/schemas/userAgent.entity';
import { UserAgentRepository } from '@middleware/domain/repositories/userAgent.interface';
import { UserAgent as UserAgentSchema } from '@middleware/domain/schemas/userAgent.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';

@Injectable()
export class UserAgentPostgresRepository extends UserAgentRepository {
  constructor(
    @InjectRepository(UserAgentSchema)
    private userAgentModel: Repository<UserAgentSchema>,
  ) {
    super();
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination: Pagination,
  ): Promise<{ total: number; data: UserAgent[] }> {
    const [data, total] = await this.userAgentModel.findAndCount({
      where: params,
      skip: pagination.offset,
      take: pagination.limit,
    });

    return { total, data };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<UserAgent | null> {
    return await this.userAgentModel.findOne({ where: params });
  }

  async get(id: string): Promise<UserAgent | null> {
    return await this.userAgentModel.findOneBy({ id });
  }

  async getAll(): Promise<{ total: number; data: UserAgent[] }> {
    const [data, total] = await this.userAgentModel.findAndCount();
    return { total, data };
  }

  async save(item: UserAgent): Promise<UserAgent> {
    const userAgent = await this.userAgentModel.save(item);
    return userAgent;
  }

  async update(id: string, item: Partial<UserAgent>): Promise<boolean> {
    await this.userAgentModel.update({ id }, item);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.userAgentModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.userAgentModel.count({ where: params });
  }
}
