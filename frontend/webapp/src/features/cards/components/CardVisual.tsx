import {
  CARD_STATUS,
  CARD_STATUS_LABEL,
  CARD_TYPE,
  CARD_TYPE_LABEL,
  type Card,
  type CardStatus,
  type CardType,
} from '@/shared/types/card'

const TYPE_COLORS: Record<CardType, string> = {
  [CARD_TYPE.VIRTUAL]: 'bg-primary',
  [CARD_TYPE.PHYSICAL]: 'bg-success',
}

const STATUS_DOT: Record<CardStatus, string> = {
  [CARD_STATUS.NORMAL]: 'bg-success',
  [CARD_STATUS.BLOCKED]: 'bg-warning',
  [CARD_STATUS.CANCELLED]: 'bg-neutral',
}

interface CardVisualProps {
  card: Card
}

export function CardVisual({ card }: CardVisualProps) {
  const status = card.status ?? CARD_STATUS.NORMAL
  const typeColor = TYPE_COLORS[card.type] ?? 'bg-primary'

  return (
    <article
      className={`flex h-[200px] w-[290px] flex-col justify-between rounded-xl p-5 text-primary-foreground shadow-lg ${typeColor}`}
    >
      <p className="text-right text-xs uppercase opacity-80">{card.brand ?? 'ZeusPay'}</p>
      <p className="font-mono text-lg tracking-widest">
        {card.masked_pan?.replace(/(.{4})/g, '$1 ').trim() ?? '•••• •••• •••• ••••'}
      </p>
      <footer className="flex items-center justify-between text-sm">
        <span className="rounded bg-black/20 px-2 py-0.5">
          {CARD_TYPE_LABEL[card.type] ?? card.type}
        </span>
        <span className="flex items-center gap-2">
          {CARD_STATUS_LABEL[status]}
          <span className={`size-2.5 rounded-full ${STATUS_DOT[status]}`} />
        </span>
      </footer>
    </article>
  )
}
