import { FavoriteAccount } from '@middleware/domain/schemas/favoriteAccount.entity';
import { FavoriteAccountRepository } from '@middleware/domain/repositories/favoriteAccount.interface';
import { FavoriteAccount as FavoriteAccountSchema } from '@middleware/domain/schemas/favoriteAccount.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';

@Injectable()
export class FavoriteAccountPostgresRepository extends FavoriteAccountRepository {
  constructor(
    @InjectRepository(FavoriteAccountSchema)
    private favoriteAccountModel: Repository<FavoriteAccountSchema>,
  ) {
    super();
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination: Pagination,
  ): Promise<{ total: number; data: FavoriteAccount[] }> {
    const [total, data] = await Promise.all([
      this.count(params),
      this.favoriteAccountModel.find({
        where: params,
        skip: pagination.offset,
        take: pagination.limit,
      }),
    ]);
    return { total, data };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<FavoriteAccount | null> {
    return await this.favoriteAccountModel.findOne({ where: params });
  }

  async get(id: string): Promise<FavoriteAccount | null> {
    return await this.favoriteAccountModel.findOneBy({ id });
  }

  async getAll(): Promise<{ total: number; data: FavoriteAccount[] }> {
    const [total, data] = await Promise.all([
      this.count({}),
      this.favoriteAccountModel.find(),
    ]);
    return { total, data };
  }

  async save(item: FavoriteAccount): Promise<FavoriteAccount> {
    const favoriteAccount = await this.favoriteAccountModel.save(item);
    return {
      id: favoriteAccount.id,
      customer_id: favoriteAccount.customer_id,
      account_id: favoriteAccount.account_id,
      account_type: favoriteAccount.account_type,
      account_alias: favoriteAccount.account_alias,
      beneficiary_name: favoriteAccount.beneficiary_name,
      beneficiary_email: favoriteAccount.beneficiary_email,
    };
  }

  async update(id: string, item: Partial<FavoriteAccount>): Promise<boolean> {
    const favorite = await this.favoriteAccountModel.preload({ id, ...item });
    if (!favorite) {
      return false;
    }
    await this.favoriteAccountModel.save(favorite);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.favoriteAccountModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.favoriteAccountModel.count({ where: params });
  }
}
