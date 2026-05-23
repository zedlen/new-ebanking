import { AppConfig } from '@middleware/domain/entities/appConfig.entity';
import { Repository } from './repository.interface';

export abstract class AppConfigRepository extends Repository<AppConfig> {
  abstract softDelete(item: Partial<AppConfig>): Promise<boolean>;
}
