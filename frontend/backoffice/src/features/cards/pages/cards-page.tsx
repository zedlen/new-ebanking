import { useMutation, useQuery } from "@tanstack/react-query";
import { CreditCard, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { BlockCardDialog } from "@/components/cards/block-card-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { changeCardStatus, fetchCards } from "@/features/cards/cards-api";
import {
  buildBreadcrumbs,
  cancelCardPath,
  linkCardPath,
} from "@/features/partners/hierarchy";
import {
  CARD_STATUS_ACTION,
  CARD_STATUS_LABELS,
  CARD_TYPE_LABELS,
  CardStatus,
} from "@/types/cards";

export function CardsPage() {
  const navigate = useNavigate();
  const { partnerId, customerId, walletId } = useParams();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [blockOpen, setBlockOpen] = useState(false);

  const cardsCtx = {
    partnerId: partnerId!,
    customerId: customerId!,
    walletId,
  };

  const { data: cards = [], isLoading, refetch } = useQuery({
    queryKey: ["cards", cardsCtx],
    queryFn: () => fetchCards(cardsCtx),
    enabled: Boolean(partnerId && customerId),
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
        toast.error("No se pudo cambiar el estado de la tarjeta");
      }
    },
  });

  const backHref = walletId
    ? `/home/partners/${partnerId}/${customerId}/wallets`
    : `/home/partners/${partnerId}/customers`;

  return (
    <div className="space-y-6">
      <PageBreadcrumbs
        items={buildBreadcrumbs({ partnerId, customerId, walletId }, {}, "Tarjetas")}
      />

      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Tarjetas</h1>
        <Button
          onClick={() =>
            navigate(linkCardPath(partnerId!, customerId!, walletId))
          }
        >
          <Plus className="mr-2 size-4" />
          Vincular tarjeta
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed p-12 text-center">
          <CreditCard className="text-muted-foreground size-14" />
          <p className="text-muted-foreground max-w-md text-sm">
            Aún no hay tarjetas vinculadas. Una vez vinculada la tarjeta no se
            puede desvincular.
          </p>
          <Button
            onClick={() =>
              navigate(linkCardPath(partnerId!, customerId!, walletId))
            }
          >
            Vincular tarjeta
          </Button>
        </div>
      ) : (
        <div className="space-y-6 rounded-2xl border bg-muted/20 p-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {cards.map((item, index) => (
              <Button
                key={item.id}
                size="sm"
                variant={index === selectedIndex ? "default" : "outline"}
                onClick={() => setSelectedIndex(index)}
              >
                {item.card.masked_pan?.slice(-4) ?? item.external_id}
              </Button>
            ))}
          </div>

          {card ? (
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xl tracking-wider">
                    {card.masked_pan}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {card.cardholder_name}
                  </p>
                </div>
                <Badge variant="outline">
                  {CARD_STATUS_LABELS[card.status] ?? card.status}
                </Badge>
              </div>

              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Tipo: </span>
                  {CARD_TYPE_LABELS[card.type] ?? card.type}
                  {card.brand ? ` · ${card.brand}` : ""}
                </p>
                {selected.amount != null ? (
                  <p>
                    <span className="text-muted-foreground">Saldo: </span>
                    {selected.amount.toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    })}
                  </p>
                ) : null}
                {card.account_id ? (
                  <p>
                    <span className="text-muted-foreground">Cuenta: </span>
                    {card.account_id}
                  </p>
                ) : null}
                {card.status_reason ? (
                  <p className="text-destructive sm:col-span-2">
                    {card.status_reason}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={card.status === CardStatus.Blocked ? "default" : "destructive"}
                  size="sm"
                  disabled={
                    card.status === CardStatus.Cancelled ||
                    statusMutation.isPending
                  }
                  onClick={() => {
                    if (card.status === CardStatus.Blocked) {
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
                {card.status !== CardStatus.Cancelled ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      navigate(
                        cancelCardPath(
                          partnerId!,
                          customerId!,
                          card.id,
                          card.type,
                          walletId,
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
        </div>
      )}

      <div className="flex justify-start">
        <Button variant="ghost" onClick={() => navigate(backHref)}>
          Volver
        </Button>
      </div>

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
