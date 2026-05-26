import {
  PaginatedResult,
  Pagination,
} from '@middleware/domain/interfaces/pagination.interface';

export abstract class Repository<T> {
  abstract find(
    params: {
      [key: string]: string | number | boolean | string[] | null;
    },
    pagination?: Pagination,
  ): Promise<PaginatedResult<T>>;
  abstract findOne(params: {
    [key: string]: string | number | boolean;
  }): Promise<T | null>;
  abstract get(id: string): Promise<T | null>;
  abstract getAll(): Promise<PaginatedResult<T>>;
  abstract save(item: T): Promise<T>;
  abstract update(id: string, item: Partial<T>): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
  abstract count(params: {
    [key: string]: string | number | boolean;
  }): Promise<number>;
}
