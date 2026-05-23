import { AppConfig } from '@middleware/domain/entities/appConfig.entity';
import { AppConfigRepository } from '@middleware/domain/repositories/appConfig.interface';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AppsService {
  constructor(private appConfigFieldRepository: AppConfigRepository) {}

  public getAll() {
    return this.appConfigFieldRepository.getAll();
  }

  public async getById(id: string) {
    const result = (await this.appConfigFieldRepository.get(id)) as
      | AppConfig
      | null
      | undefined;

    if (!result)
      throw new NotFoundException(`Config field with id ${id} not found`);

    return result;
  }

  public async updateOne(id: string, configField: Partial<AppConfig>) {
    const result = (await this.appConfigFieldRepository.get(id)) as
      | AppConfig
      | null
      | undefined;

    if (!result)
      throw new NotFoundException(`Config field with id ${id} not found`);
    return await this.appConfigFieldRepository.update(id, {
      ...configField,
      version: result.version + 1,
    });
  }

  public deleteOne(id: string) {
    return this.appConfigFieldRepository.softDelete({ id });
  }

  public create(configField: Omit<AppConfig, 'id'>) {
    return this.appConfigFieldRepository.save(configField);
  }
}
