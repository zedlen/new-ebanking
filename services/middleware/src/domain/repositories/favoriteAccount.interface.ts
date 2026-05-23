import { FavoriteAccount } from '@middleware/domain/entities/favoriteAccount.entity';
import { Repository } from './repository.interface';

export abstract class FavoriteAccountRepository extends Repository<FavoriteAccount> {}
