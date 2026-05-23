import { User } from '@middleware/domain/entities/user.entity';
import { UserRepository } from '@middleware/domain/repositories/user.interface';
import { User as UserSchema } from '@middleware/domain/schemas/user.entity';
import { Pagination } from '@middleware/domain/interfaces/pagination.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserPostgresRepository extends UserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private userModel: Repository<UserSchema>,
  ) {
    super();
  }

  private transforData(user: UserSchema): User {
    return {
      id: user.id,
      username: user.username,
      image: user.image,
      name: user.name,
    };
  }

  async find(
    params: {
      [key: string]: string | number | boolean;
    },
    pagination?: Pagination,
  ): Promise<{ total: number; data: User[] }> {
    let pagFilters = {};
    if (pagination) {
      pagFilters = {
        skip: pagination.offset,
        take: pagination.limit,
      };
    }
    const [data, total] = await this.userModel.findAndCount({
      where: params,
      ...pagFilters,
    });

    return { total, data };
  }

  async findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<User | null> {
    const data = await this.userModel.findOne({ where: params });
    if (!data) {
      return null;
    }
    return this.transforData(data);
  }

  async get(id: string): Promise<User | null> {
    const data = await this.userModel.findOneBy({ id });
    if (!data) {
      return null;
    }
    return this.transforData(data);
  }

  async getAll(
    pagination?: Pagination,
  ): Promise<{ total: number; data: User[] }> {
    let pagFilters = {};
    if (pagination) {
      pagFilters = {
        skip: pagination.offset,
        take: pagination.limit,
      };
    }
    const [data, total] = await this.userModel.findAndCount({ ...pagFilters });

    return { total, data };
  }

  async save(item: User): Promise<User> {
    const user = await this.userModel.save(item);
    return this.transforData(user);
  }

  async update(id: string, item: Partial<User>): Promise<boolean> {
    const user = await this.userModel.preload({ id, ...item });
    if (!user) {
      return false;
    }
    await this.userModel.save(user);
    return true;
  }

  async delete(id: string): Promise<boolean> {
    await this.userModel.delete({ id });
    return true;
  }

  count(params: { [key: string]: string | number | boolean }): Promise<number> {
    return this.userModel.count({ where: params });
  }
}
