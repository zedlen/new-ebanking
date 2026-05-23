import { useMutation, useQuery } from "@tanstack/react-query";
import { CreditCard, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BlockCardDialog } from "@/components/cards/block-card-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { changeCardStatus, fetchCards } from "@/features/cards/cards-api";
import {
  cancelCardPath,
  cardsPath,
  linkCardPath,
} from "@/features/partners/hierarchy";
import type { HierarchyIds } from "@/features/partners/hierarchy";
import {
  CARD_STATUS_ACTION,
  CARD_STATUS_LABELS,
  CardStatus,
} from "@/types/cards";

interface CreditCardsDrawerProps {
  context: HierarchyIds;
}

export function CreditCardsDrawer({ context }: CreditCardsDrawerProps) {
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [blockOpen, setBlockOpen] = useState(false);

  const cardsCtx = {
    partnerId: context.partnerId!,
    customerId: context.customerId!,
    walletId: context.walletId,
  };

  const { data: cards = [], isLoading, refetch } = useQuery({
    queryKey: ["cards", cardsCtx],
    queryFn: () => fetchCards(cardsCtx),
    enabled: Boolean(cardsCtx.partnerId && cardsCtx.customerId),
  });

  const selected = cards[selectedIndex];
  const card = selected?.card;

  const statusMutation = useMutation({
    mutationFn: async ({
      status,
      reason,
    }: {
      status: string;
      reason: string | null;
    }) => {
      if (!card) return false;
      return changeCardStatus(cardsCtx, card.id, {
        status,
        statusReason: reason,
      });
    },
    onSuccess: (ok, vars) => {
      if (ok) {
        toast.success(
          vars.status === CardStatus.Blocked
            ? "Tarjeta bloqueada correctamente"
            : "Tarjeta desbloqueada correctamente",
        );
        refetch();
        setBlockOpen(false);
      } else {
        toast.error("No se pudo cambiar el estado");
      }
    },
  });

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  if (cards.length === 0) {
    return (
      <div className="space-y-4 text-center">
        <CreditCard className="text-muted-foreground mx-auto size-12" />
        <p>No hay tarjetas vinculadas</p>
        <Button
          onClick={() =>
            navigate(
              linkCardPath(
                context.partnerId!,
                context.customerId!,
                context.walletId,
              ),
            )
          }
        >
          <Plus className="mr-2 size-4" />
          Vincular tarjeta
        </Button>
      </div>
    );
  }

  const isBlocked = card?.status === CardStatus.Blocked;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {cards.map((item, index) => (
          <Button
            key={item.id}
            size="sm"
            variant={index === selectedIndex ? "default" : "outline"}
            onClick={() => setSelectedIndex(index)}
          >
            {item.card.masked_pan?.slice(-4) ?? item.id}
          </Button>
        ))}
      </div>

      {card ? (
        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-lg">{card.masked_pan}</p>
            <Badge variant="outline">
              {CARD_STATUS_LABELS[card.status] ?? card.status}
            </Badge>
          </div>
          <p className="text-sm">
            <span className="text-muted-foreground">Titular: </span>
            {card.cardholder_name}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Tipo: </span>
            {card.type} · {card.brand}
          </p>
          {card.status_reason ? (
            <p className="text-destructive text-sm">{card.status_reason}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              variant={isBlocked ? "default" : "destructive"}
              size="sm"
              disabled={
                card.status === CardStatus.Cancelled || statusMutation.isPending
              }
              onClick={() => {
                if (isBlocked) {
                  statusMutation.mutate({
                    status: CardStatus.Normal,
                    reason: null,
                  });
                } else {
                  setBlockOpen(true);
                }
              }}
            >
              {CARD_STATUS_ACTION[card.status] ?? "Cambiar estado"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                navigate(
                  cardsPath(
                    context.partnerId!,
                    context.customerId!,
                    context.walletId,
                  ),
                )
              }
            >
              Ver todas
            </Button>
            {card.status !== CardStatus.Cancelled ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  navigate(
                    cancelCardPath(
                      context.partnerId!,
                      context.customerId!,
                      card.id,
                      card.type,
                      context.walletId,
                    ),
                  )
                }
              >
                Deshabilitar
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          navigate(
            linkCardPath(
              context.partnerId!,
              context.customerId!,
              context.walletId,
            ),
          )
        }
      >
        <Plus className="mr-2 size-4" />
        Vincular otra tarjeta
      </Button>

      {card ? (
        <BlockCardDialog
          open={blockOpen}
          cardType={card.type}
          loading={statusMutation.isPending}
          onOpenChange={setBlockOpen}
          onConfirm={(reason) =>
            statusMutation.mutate({
              status: CardStatus.Blocked,
              reason,
            })
          }
        />
      ) : null}
    </div>
  );
}
