import {
  allowedStatuses,
  CardStatus,
  CardStatusReason,
  CardType,
} from '../schemas/card.entity';

export const validateCardStatus = (
  cardType: CardType,
  status: CardStatus,
  reason: CardStatusReason,
): boolean => {
  const validReasons = allowedStatuses[cardType]?.[status];
  if (!validReasons) return false;
  return validReasons.includes(reason);
};
