// @ts-nocheck — ported from legacy shared config-field service.
import { AppConfigField } from '@middleware/domain/entities/appConfigField.entity';
import { AppConfigFieldRepository } from '@middleware/domain/repositories/appConfigField.interface';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ConfigFieldService {
  constructor(private appConfigFieldRepository: AppConfigFieldRepository) {}

  public getAll() {
    return this.appConfigFieldRepository.getAll();
  }

  public async getById(id: string) {
    const result = await this.appConfigFieldRepository.get(id);

    if (!result) throw new NotFoundException(`Config field with id ${id} not found`);

    return result;
  }

  public async updateOne(id: string, configField: Partial<AppConfigField>) {
    const result = await this.appConfigFieldRepository.get(id);

    if (!result) throw new NotFoundException(`Config field with id ${id} not found`);
    return await this.appConfigFieldRepository.update(id, {
      ...configField,
      version: result.version + 1,
    });
  }

  public deleteOne(id: string) {
    return this.appConfigFieldRepository.softDelete({ id });
  }

  public create(configField: Omit<AppConfigField, 'id'>) {
    return this.appConfigFieldRepository.save(configField);
  }
}
