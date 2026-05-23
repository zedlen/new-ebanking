import { useMutation } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/features/partners/components/global-search";
import { syncAllPartners } from "@/features/partners/partners-api";

export function AppHeader() {
  const syncMutation = useMutation({
    mutationFn: syncAllPartners,
    onSuccess: () => toast.success("Sincronización iniciada"),
    onError: () => toast.error("No se pudo sincronizar"),
  });

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 flex flex-col gap-3 border-b px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:px-6">
      <p className="text-muted-foreground hidden text-sm md:block">
        Administración de partners y cuentas
      </p>
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <GlobalSearch />
        <Button
          variant="outline"
          size="sm"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="shrink-0"
        >
          <RefreshCw
            className={`mr-2 size-4 ${syncMutation.isPending ? "animate-spin" : ""}`}
          />
          Sync
        </Button>
      </div>
    </header>
  );
}
