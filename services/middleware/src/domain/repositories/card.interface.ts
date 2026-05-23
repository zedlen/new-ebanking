import { Card } from '@middleware/domain/entities/card.entity';

import { Repository } from './repository.interface';

export abstract class CardRepository extends Repository<Card> {}
