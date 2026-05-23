import { useState } from 'react'
import { CardVisual } from '@/features/cards/components/CardVisual'
import { Button } from '@/shared/components/Button'
import type { Card } from '@/shared/types/card'

interface CardCarouselProps {
  cards: Card[]
  onChange: (card: Card) => void
}

export function CardCarousel({ cards, onChange }: CardCarouselProps) {
  const [index, setIndex] = useState(0)
  const current = cards[index]

  if (!current) return null

  const goTo = (next: number) => {
    const bounded = Math.max(0, Math.min(cards.length - 1, next))
    setIndex(bounded)
    onChange(cards[bounded])
  }

  return (
    <section className="flex w-full items-center justify-center gap-2 sm:gap-3">
      <Button
        type="button"
        variant="ghost"
        disabled={index === 0}
        onClick={() => goTo(index - 1)}
        aria-label="Tarjeta anterior"
      >
        ‹
      </Button>
      <CardVisual card={current} />
      <Button
        type="button"
        variant="ghost"
        disabled={index >= cards.length - 1}
        onClick={() => goTo(index + 1)}
        aria-label="Tarjeta siguiente"
      >
        ›
      </Button>
    </section>
  )
}
