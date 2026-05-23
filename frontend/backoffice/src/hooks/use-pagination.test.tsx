import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { usePagination } from "@/hooks/use-pagination";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/?page=2&size=10"]}>
      {children}
    </MemoryRouter>
  );
}

describe("usePagination", () => {
  it("reads page and size from URL", () => {
    const { result } = renderHook(() => usePagination(), { wrapper });
    expect(result.current.page).toBe(2);
    expect(result.current.size).toBe(10);
    expect(result.current.offset).toBe(10);
  });

  it("calculates total pages", () => {
    const { result } = renderHook(() => usePagination(10), { wrapper });
    expect(result.current.totalPages(25)).toBe(3);
  });
});
