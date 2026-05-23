import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { cardsService } from '@/api/services/cardsService'
import { movementsService } from '@/api/services/movementsService'
import { BlockCardModal } from '@/features/cards/components/BlockCardModal'
import { CardCarousel } from '@/features/cards/components/CardCarousel'
import { CountdownCode } from '@/features/cards/components/CountdownCode'
import { LinkCardModal } from '@/features/cards/components/LinkCardModal'
import { TransferAlert } from '@/features/transfers/components/TransferAlert'
import { Badge } from '@/shared/components/Badge'
import { Button } from '@/shared/components/Button'
import { CopyButton } from '@/shared/components/CopyButton'
import { DataTable, type DataTableColumn } from '@/shared/components/DataTable'
import { Modal } from '@/shared/components/Modal'
import { CardsPageSkeleton } from '@/features/cards/components/CardsPageSkeleton'
import { RefetchIndicator } from '@/shared/components/RefetchIndicator'
import { MOVEMENTS_TYPE } from '@/shared/constants/banking'
import { useSessionStore } from '@/shared/store/sessionStore'
import {
  CARD_STATUS,
  CARD_STATUS_ACTION,
  CARD_STATUS_LABEL,
  CARD_TYPE,
  type Card,
  type CardSensitiveData,
} from '@/shared/types/card'
import { formatCardExpiry, maskPan, secondsUntil } from '@/shared/utils/card'
import { decryptApiMessage } from '@/shared/utils/crypto'
import { formatCurrency, formatDate } from '@/shared/utils/format'
import type { Movement } from '@/shared/types/movements'

export function CardsPage() {
  const privateKey = useSessionStore((s) => s.privateKey)
  const encryptionKey = useSessionStore((s) => s.encryptionKey)
  const canDecrypt = Boolean(privateKey && encryptionKey)

  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [cardDetails, setCardDetails] = useState<CardSensitiveData | null>(null)
  const [cvv, setCvv] = useState('')
  const [cvvSeconds, setCvvSeconds] = useState(0)
  const [pin, setPin] = useState('')
  const [linkOpen, setLinkOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [disableMode, setDisableMode] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [alert, setAlert] = useState<{
    type: 'error' | 'success'
    title: string
    message?: string
  } | null>(null)

  const cardsQuery = useQuery({
    queryKey: ['cards'],
    queryFn: () => cardsService.list(),
  })

  const cards = cardsQuery.data ?? []

  useEffect(() => {
    if (cards.length && !selectedCard) {
      setSelectedCard(cards[0])
    }
  }, [cards, selectedCard])

  const movementsQuery = useQuery({
    queryKey: ['card-movements', selectedCard?.account_id],
    queryFn: () => movementsService.getLatest(selectedCard!.account_id),
    enabled: Boolean(selectedCard?.account_id),
  })

  const isCancelled = selectedCard?.status === CARD_STATUS.CANCELLED

  const cryptoKeys = { privateKey, encryptionKey }

  const clearSensitive = () => {
    setCvv('')
    setPin('')
    setCardDetails(null)
  }

  const selectCard = (card: Card) => {
    setSelectedCard(card)
    clearSensitive()
  }

  const showCvv = async () => {
    if (!selectedCard || !canDecrypt) {
      setAlert({
        type: 'error',
        title: 'Sesión sin claves de cifrado',
        message: 'Cierra sesión e inicia de nuevo para ver el CVV dinámico.',
      })
      return
    }

    let payload = await cardsService.getDynamicCvv(selectedCard.id)
    if (!payload?.message) {
      payload = await cardsService.generateDynamicCvv(selectedCard.id)
    }

    const data = await decryptApiMessage<CardSensitiveData>(payload ?? {}, cryptoKeys)
    if (!data || typeof data === 'string' || !data.cvv) {
      setAlert({
        type: 'error',
        title: 'CVV no disponible',
        message: 'No se pudo obtener el código de seguridad.',
      })
      return
    }

    setCvv(data.cvv)
    if (data.expiration_date) {
      setCvvSeconds(secondsUntil(data.expiration_date))
    } else {
      setCvvSeconds(300)
    }
  }

  const showPin = async () => {
    if (!selectedCard || !canDecrypt) {
      setAlert({
        type: 'error',
        title: 'Sesión sin claves de cifrado',
        message: 'Cierra sesión e inicia de nuevo para ver el PIN.',
      })
      return
    }

    const payload = await cardsService.getPin(selectedCard.id)
    const data = await decryptApiMessage<CardSensitiveData>(payload, cryptoKeys)
    if (!data || typeof data === 'string' || !data.pin) {
      setAlert({
        type: 'error',
        title: 'PIN no disponible',
        message: 'No se pudo obtener el PIN.',
      })
      return
    }
    setPin(data.pin)
  }

  const loadCardDetails = async () => {
    if (!selectedCard || !canDecrypt) {
      setAlert({
        type: 'error',
        title: 'Sesión sin claves de cifrado',
        message: 'Cierra sesión e inicia de nuevo para ver los detalles.',
      })
      return
    }

    const payload = await cardsService.getCardData(selectedCard.id)
    const data = await decryptApiMessage<CardSensitiveData>(payload, cryptoKeys)
    if (!data || typeof data === 'string') {
      setAlert({
        type: 'error',
        title: 'Detalle no disponible',
        message: 'No se pudo descifrar la información de la tarjeta.',
      })
      return
    }
    setCardDetails(data)
  }

  const reloadCards = () => void cardsQuery.refetch()

  const handleBlockConfirm = async (reason: string, otp?: string) => {
    if (!selectedCard) return
    setStatusLoading(true)

    const ok =
      disableMode && otp
        ? await cardsService.cancel(
            selectedCard.id,
            { status: CARD_STATUS.CANCELLED, statusReason: reason },
            otp,
          )
        : await cardsService.changeStatus(selectedCard.id, {
            status: CARD_STATUS.BLOCKED,
            statusReason: reason,
          })

    setStatusLoading(false)
    setBlockOpen(false)
    setDisableMode(false)

    if (ok) {
      setAlert({
        type: 'success',
        title: disableMode
          ? 'Tarjeta deshabilitada'
          : 'Tarjeta bloqueada correctamente',
      })
      reloadCards()
      return
    }

    setAlert({
      type: 'error',
      title: 'Error en la operación',
      message: 'No se pudo actualizar el estatus. Intenta de nuevo.',
    })
  }

  const unblockCard = async () => {
    if (!selectedCard) return
    setStatusLoading(true)
    const ok = await cardsService.changeStatus(selectedCard.id, {
      status: CARD_STATUS.NORMAL,
      statusReason: null,
    })
    setStatusLoading(false)

    if (ok) {
      setAlert({ type: 'success', title: 'Tarjeta desbloqueada' })
      reloadCards()
    } else {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo desbloquear la tarjeta.',
      })
    }
  }

  const movementColumns: DataTableColumn<Movement>[] = [
    {
      id: 'tracking_key',
      header: 'Clave rastreo',
      cell: (row) => row.tracking_key ?? row.folio ?? '—',
    },
    { id: 'account_id', header: 'Cuenta', cell: (row) => row.account_id },
    {
      id: 'type',
      header: 'Medio pago',
      cell: (row) => MOVEMENTS_TYPE[row.type] ?? String(row.type),
    },
    {
      id: 'operation_date',
      header: 'Fecha',
      cell: (row) => formatDate(row.operation_date),
    },
    { id: 'concept', header: 'Concepto', cell: (row) => row.payment_purpose ?? row.description },
    {
      id: 'amount',
      header: 'Monto',
      cell: (row) => formatCurrency(row.amount),
    },
  ]

  const status = selectedCard?.status ?? CARD_STATUS.NORMAL

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Mis tarjetas</h1>
        <RefetchIndicator active={cardsQuery.isFetching && !cardsQuery.isLoading} />
      </header>

      {!canDecrypt && (
        <TransferAlert
          type="error"
          title="Funciones sensibles limitadas"
          message="Para CVV, PIN y número completo debes iniciar sesión de nuevo (las claves de cifrado no persisten al recargar)."
        />
      )}

      {alert ? (
        <TransferAlert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onDismiss={() => setAlert(null)}
        />
      ) : null}

      {cardsQuery.isLoading ? (
        <CardsPageSkeleton />
      ) : cards.length === 0 ? (
        <section className="rounded-lg border border-border bg-surface-muted/40 px-6 py-12 text-center">
          <p className="mb-4 text-neutral">
            Aún no tienes tarjetas vinculadas. Agrega una tarjeta virtual para comenzar.
          </p>
          <Button type="button" onClick={() => setLinkOpen(true)}>
            Agregar tarjeta
          </Button>
        </section>
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-2">
            <CardCarousel cards={cards} onChange={selectCard} />

            {!isCancelled && selectedCard && (
              <section className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-muted/40 p-6">
                <p className="mb-3 text-sm font-medium text-foreground">CVV dinámico</p>
                {!cvv ? (
                  <Button type="button" variant="secondary" onClick={() => void showCvv()}>
                    Ver CVV
                  </Button>
                ) : (
                  <>
                    <CountdownCode
                      code={cvv}
                      totalSeconds={cvvSeconds || 300}
                      onFinish={() => setCvv('')}
                    />
                    <p className="mt-3 text-center text-xs text-neutral">
                      Tu CVV tiene una validez limitada (aprox. 5 minutos).
                    </p>
                  </>
                )}
              </section>
            )}
          </section>

          {selectedCard && (
            <section className="space-y-4 rounded-lg border border-border p-6">
              <header className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">Living Free</h2>
                <Badge
                  label={CARD_STATUS_LABEL[status]}
                  tone={
                    status === CARD_STATUS.NORMAL
                      ? 'success'
                      : status === CARD_STATUS.BLOCKED
                        ? 'warning'
                        : 'neutral'
                  }
                />
              </header>

              <section className="grid gap-6 lg:grid-cols-2">
                <ul className="grid gap-4 sm:grid-cols-2">
                  <li>
                    <p className="text-xs text-neutral">Número de tarjeta</p>
                    <p className="font-mono text-sm">
                      {maskPan(selectedCard.masked_pan, 6, 12, 4)}
                      {cardDetails?.pan ? (
                        <span className="ml-2">
                          <CopyButton value={cardDetails.pan} />
                        </span>
                      ) : null}
                    </p>
                  </li>
                  <li>
                    <p className="text-xs text-neutral">Fecha de creación</p>
                    <p className="text-sm">{formatCardExpiry(selectedCard.creation_date)}</p>
                  </li>
                  <li>
                    <p className="text-xs text-neutral">País de emisión</p>
                    <p className="text-sm">{selectedCard.issuing_country ?? '—'}</p>
                  </li>
                  <li>
                    <p className="text-xs text-neutral">Cuenta asociada</p>
                    <p className="text-sm">{selectedCard.account_id}</p>
                  </li>
                  {cardDetails?.expiration_date ? (
                    <li>
                      <p className="text-xs text-neutral">Fecha de expiración</p>
                      <p className="text-sm">
                        {formatCardExpiry(cardDetails.expiration_date)}
                      </p>
                    </li>
                  ) : null}
                </ul>

                <section className="flex flex-col gap-3">
                  <p className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" onClick={() => setLinkOpen(true)}>
                      Vincular tarjeta
                    </Button>
                    {!isCancelled && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setDisableMode(true)
                          setBlockOpen(true)
                        }}
                      >
                        Deshabilitar
                      </Button>
                    )}
                  </p>

                  {!isCancelled && (
                    <p className="flex flex-wrap items-center gap-2">
                      {status === CARD_STATUS.BLOCKED ? (
                        <Button
                          type="button"
                          disabled={statusLoading}
                          onClick={() => void unblockCard()}
                        >
                          Desbloquear tarjeta
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={statusLoading}
                          onClick={() => {
                            setDisableMode(false)
                            setBlockOpen(true)
                          }}
                        >
                          {CARD_STATUS_ACTION[status]}
                        </Button>
                      )}
                    </p>
                  )}

                  {!cardDetails && (
                    <button
                      type="button"
                      className="text-left text-sm text-primary hover:underline"
                      onClick={() => void loadCardDetails()}
                    >
                      Ver más detalles
                    </button>
                  )}

                  {cardDetails &&
                    !isCancelled &&
                    selectedCard.type === CARD_TYPE.PHYSICAL && (
                      <section className="rounded-lg border border-border bg-surface-muted/40 p-4">
                        <p className="mb-2 text-sm font-medium">PIN</p>
                        {!pin ? (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => void showPin()}
                          >
                            Ver PIN
                          </Button>
                        ) : (
                          <>
                            <CountdownCode
                              code={pin}
                              totalSeconds={60}
                              onFinish={() => setPin('')}
                            />
                            <p className="mt-2 text-xs text-neutral">
                              El PIN será visible durante 1 minuto.
                            </p>
                          </>
                        )}
                      </section>
                    )}
                </section>
              </section>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Últimos movimientos</h2>
            <DataTable
              columns={movementColumns}
              data={movementsQuery.data ?? []}
              getRowKey={(row) => row.id}
              emptyMessage="No tienes últimos movimientos"
              isLoading={movementsQuery.isLoading}
              skeletonRows={4}
            />
          </section>
        </>
      )}

      <Modal
        open={linkOpen}
        title="Vincular tarjeta"
        onClose={() => setLinkOpen(false)}
      >
        <LinkCardModal
          onClose={() => setLinkOpen(false)}
          onSuccess={() => {
            setLinkOpen(false)
            setAlert({ type: 'success', title: 'Tarjeta vinculada correctamente' })
            reloadCards()
          }}
        />
      </Modal>

      <Modal
        open={blockOpen}
        title={disableMode ? 'Deshabilitar tarjeta' : 'Bloquear tarjeta'}
        onClose={() => {
          setBlockOpen(false)
          setDisableMode(false)
        }}
      >
        {selectedCard && (
          <BlockCardModal
            cardType={selectedCard.type}
            disableCard={disableMode}
            loading={statusLoading}
            onClose={() => {
              setBlockOpen(false)
              setDisableMode(false)
            }}
            onConfirm={(reason, otp) => void handleBlockConfirm(reason, otp)}
          />
        )}
      </Modal>
    </section>
  )
}
