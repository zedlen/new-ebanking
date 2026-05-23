import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const DEFAULT_PAGE_SIZE = 10;

export function usePagination(pageSize = DEFAULT_PAGE_SIZE) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const size = Math.max(1, Number(searchParams.get("size") ?? pageSize));
  const offset = (page - 1) * size;

  const setPage = useCallback(
    (nextPage: number) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.set("page", String(Math.max(1, nextPage)));
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const totalPages = useCallback(
    (total: number) => Math.max(1, Math.ceil(total / size)),
    [size],
  );

  return useMemo(
    () => ({ page, size, offset, setPage, totalPages }),
    [page, size, offset, setPage, totalPages],
  );
}
