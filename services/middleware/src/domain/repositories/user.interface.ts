import { User } from '@middleware/domain/entities/user.entity';
import { Repository } from './repository.interface';

export abstract class UserRepository extends Repository<User> {}
