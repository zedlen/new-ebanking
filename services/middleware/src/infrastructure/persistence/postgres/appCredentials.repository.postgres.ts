import { AppCredential } from '@middleware/domain/schemas/appCredentials.entity';
import { AppCredentialsRepository } from '@middleware/domain/repositories/appCredentials.interface';
import { AppCredential as AppCredentialModel } from '@middleware/domain/schemas/appCredentials.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';

@Injectable()
export class AppCredentialsPostgresRepository extends AppCredentialsRepository {
  constructor(
    @InjectRepository(AppCredentialModel)
    private appCredentialRepository: Repository<AppCredentialModel>,
  ) {
    super();
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination: Pagination,
  ): Promise<{ total: number; data: AppCredential[] }> {
    const [total, data] = await Promise.all([
      this.count(params),
      this.appCredentialRepository.find({
        where: params,
        skip: pagination.offset,
        take: pagination.limit,
      }),
    ]);
    return { total, data };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<AppCredential | null> {
    return await this.appCredentialRepository.findOne({ where: params });
  }

  async get(id: string): Promise<AppCredential | null> {
    return await this.appCredentialRepository.findOneBy({ id });
  }

  async getAll(): Promise<{ total: number; data: AppCredential[] }> {
    const [total, data] = await Promise.all([
      this.count({}),
      this.appCredentialRepository.find(),
    ]);
    return { total, data };
  }

  async save(item: AppCredential): Promise<AppCredential> {
    const session = await this.appCredentialRepository.save(item);
    return session;
  }

  async update(id: string, item: Partial<AppCredential>): Promise<boolean> {
    const credential = await this.appCredentialRepository.preload({
      id,
      ...item,
    });
    if (!credential) {
      return false;
    }
    await this.appCredentialRepository.save(credential);
    return true;
  }

  async softDelete(item: Partial<AppCredential>): Promise<boolean> {
    await this.appCredentialRepository.update(item, { active: false });
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.appCredentialRepository.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.appCredentialRepository.count({ where: params });
  }
}
