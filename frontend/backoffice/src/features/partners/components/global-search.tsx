import { useQuery } from "@tanstack/react-query";
import { Building2, CreditCard, Search, Users, Wallet } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchEntities } from "@/features/partners/partners-api";
import {
  customerAccountsPath,
  movementsPath,
  partnerAccountsPath,
  partnerCustomersPath,
  walletAccountsPath,
} from "@/features/partners/hierarchy";
import { getDisplayName } from "@/lib/format";
import type { AccountSearchResult } from "@/types/partners";

export function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const enabled = query.trim().length >= 4;

  const { data, isFetching } = useQuery({
    queryKey: ["searcher", query],
    queryFn: () => searchEntities(query.trim()),
    enabled,
    staleTime: 30_000,
  });

  const goToAccount = (item: AccountSearchResult) => {
    if (item.Wallet?.Partner?.id && item.Wallet.Customer?.id && item.Wallet.id) {
      navigate(
        walletAccountsPath(
          item.Wallet.Partner.id,
          item.Wallet.Customer.id,
          item.Wallet.id,
        ),
      );
      return;
    }
    if (item.Customer?.Partner?.id && item.Customer.id) {
      navigate(customerAccountsPath(item.Customer.Partner.id, item.Customer.id));
      return;
    }
    if (item.Partner?.id) {
      navigate(partnerAccountsPath(item.Partner.id));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className="w-full max-w-sm justify-start gap-2">
            <Search className="size-4 shrink-0 opacity-60" />
            <span className="text-muted-foreground truncate">
              Buscar partners, clientes, wallets…
            </span>
          </Button>
        }
      />
      <PopoverContent className="w-[min(100vw-2rem,420px)] p-0" align="end">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Mínimo 4 caracteres"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {!enabled ? (
              <CommandEmpty>Escribe al menos 4 caracteres</CommandEmpty>
            ) : isFetching ? (
              <CommandEmpty>Buscando…</CommandEmpty>
            ) : (
              <>
                {!data?.partners.length &&
                !data?.customers.length &&
                !data?.wallets.length &&
                !data?.accounts.length ? (
                  <CommandEmpty>Sin resultados</CommandEmpty>
                ) : null}

                {data?.partners && data.partners.length > 0 ? (
                  <CommandGroup heading="Partners">
                    {data.partners.map((p) => (
                      <CommandItem
                        key={`p-${p.id}`}
                        onSelect={() => {
                          navigate(partnerCustomersPath(p.id));
                          setOpen(false);
                        }}
                      >
                        <Building2 className="mr-2 size-4" />
                        <span>{getDisplayName(p)}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}

                {data?.customers && data.customers.length > 0 ? (
                  <CommandGroup heading="Clientes">
                    {data.customers.map((c) => (
                      <CommandItem
                        key={`c-${c.id}`}
                        onSelect={() => {
                          if (c.Partner?.id) {
                            navigate(
                              `/home/partners/${c.Partner.id}/${c.id}/accounts`,
                            );
                          }
                          setOpen(false);
                        }}
                      >
                        <Users className="mr-2 size-4" />
                        <span>{getDisplayName(c)}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}

                {data?.wallets && data.wallets.length > 0 ? (
                  <CommandGroup heading="Wallets">
                    {data.wallets.map((w) => (
                      <CommandItem
                        key={`w-${w.id}`}
                        onSelect={() => {
                          if (w.Partner?.id && w.Customer?.id) {
                            navigate(
                              walletAccountsPath(w.Partner.id, w.Customer.id, w.id),
                            );
                          }
                          setOpen(false);
                        }}
                      >
                        <Wallet className="mr-2 size-4" />
                        <span>{getDisplayName(w)}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}

                {data?.accounts && data.accounts.length > 0 ? (
                  <CommandGroup heading="Cuentas">
                    {data.accounts.map((a) => (
                      <CommandItem
                        key={`a-${a.id}`}
                        onSelect={() => {
                          if (a.clabes?.[0]) {
                            navigate(
                              movementsPath(
                                a.Partner?.id ?? a.Wallet?.Partner?.id ?? "",
                                a.id,
                                a.Customer?.id ?? a.Wallet?.Customer?.id,
                                a.Wallet?.id,
                              ),
                            );
                          } else {
                            goToAccount(a);
                          }
                          setOpen(false);
                        }}
                      >
                        <CreditCard className="mr-2 size-4" />
                        <span>
                          {getDisplayName(
                            a.Customer ??
                              a.Wallet ??
                              a.Partner ?? {
                                name: a.external_id,
                              },
                          )}
                          {a.clabes?.[0]?.clabe
                            ? ` · ${a.clabes[0].clabe}`
                            : ""}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
