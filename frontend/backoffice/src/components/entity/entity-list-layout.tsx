import { Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { ListPagination } from "@/components/entity/list-pagination";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { BreadcrumbItem } from "@/features/partners/hierarchy";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";

interface EntityListLayoutProps {
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  searchPlaceholder?: string;
  items: unknown[];
  filterFn?: (item: unknown, query: string) => boolean;
  isLoading: boolean;
  emptyMessage: string;
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel: string;
  renderItem: (item: unknown) => ReactNode;
  headerActions?: ReactNode;
}

export function EntityListLayout({
  title,
  description,
  breadcrumbs,
  searchPlaceholder = "Buscar en esta página…",
  items,
  filterFn,
  isLoading,
  emptyMessage,
  page,
  total,
  pageSize,
  onPageChange,
  itemLabel,
  renderItem,
  headerActions,
}: EntityListLayoutProps) {
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!query.trim() || !filterFn) return items;
    return items.filter((item) => filterFn(item, query.trim().toLowerCase()));
  }, [items, query, filterFn]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <PageBreadcrumbs items={breadcrumbs} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          ) : null}
        </div>
        {headerActions}
      </div>

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="border-muted-foreground/25 rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">{filteredItems.map(renderItem)}</div>
      )}

      {!query && (
        <ListPagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={total}
          itemLabel={itemLabel}
        />
      )}
    </div>
  );
}
