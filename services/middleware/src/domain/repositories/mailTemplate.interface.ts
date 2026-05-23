import { MailTemplate } from '@middleware/domain/entities/mailTemplate.entity';
import { Repository } from './repository.interface';

export abstract class MailTemplateRepository extends Repository<MailTemplate> {}
