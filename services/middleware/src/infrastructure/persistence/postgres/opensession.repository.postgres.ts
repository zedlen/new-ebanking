import { OpenSession } from '@middleware/domain/schemas/openSessions.entity';
import { OpensessionRepository } from '@middleware/domain/repositories/openSessions.interface';
import { OpenSession as OpenSessionModel } from '@middleware/domain/schemas/openSessions.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';

@Injectable()
export class OpenSessionPostgresRepository extends OpensessionRepository {
  constructor(
    @InjectRepository(OpenSessionModel)
    private openSessionModel: Repository<OpenSessionModel>,
  ) {
    super();
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination: Pagination,
  ): Promise<{ total: number; data: OpenSession[] }> {
    const [data, total] = await this.openSessionModel.findAndCount({
      where: params,
      skip: pagination.offset,
      take: pagination.limit,
    });
    return { total, data };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<OpenSession | null> {
    return await this.openSessionModel.findOne({ where: params });
  }

  async get(id: string): Promise<OpenSession | null> {
    return await this.openSessionModel.findOneBy({ id });
  }

  async getAll(): Promise<{ total: number; data: OpenSession[] }> {
    const [data, total] = await this.openSessionModel.findAndCount();

    return { total, data };
  }

  async save(item: OpenSession): Promise<OpenSession> {
    const session = await this.openSessionModel.save(item);
    console.log(session);
    return session;
  }

  async update(id: string, item: Partial<OpenSession>): Promise<boolean> {
    const session = await this.openSessionModel.preload({ id, ...item });
    if (!session) {
      return false;
    }
    await this.openSessionModel.save(session);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.openSessionModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.openSessionModel.count({ where: params });
  }

  async deleteUnsetSessions(users: string[]): Promise<boolean> {
    await this.openSessionModel.delete({ u: In(users) });
    return true;
  }
}
