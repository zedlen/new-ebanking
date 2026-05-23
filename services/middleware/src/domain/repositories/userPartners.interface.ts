import { UserPartners } from '@middleware/domain/entities/userPartners.entity';
import { Repository } from './repository.interface';

export abstract class UserPartnersRepository extends Repository<UserPartners> {}
