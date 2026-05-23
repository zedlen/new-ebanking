import { AppConfigField } from '@middleware/domain/entities/appConfigField.entity';
import { Repository } from './repository.interface';

export abstract class AppConfigFieldRepository extends Repository<AppConfigField> {
  abstract softDelete(item: Partial<AppConfigField>): Promise<boolean>;
}
