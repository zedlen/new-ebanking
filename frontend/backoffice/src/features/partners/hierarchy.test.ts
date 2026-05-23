import { describe, expect, it } from "vitest";
import {
  customerAccountsPath,
  movementsPath,
  partnerCustomersPath,
  walletAccountsPath,
} from "@/features/partners/hierarchy";

describe("hierarchy paths", () => {
  it("builds partner customers path", () => {
    expect(partnerCustomersPath("p1")).toBe("/home/partners/p1/customers");
  });

  it("builds customer accounts path", () => {
    expect(customerAccountsPath("p1", "c1")).toBe(
      "/home/partners/p1/c1/accounts",
    );
  });

  it("builds wallet accounts path", () => {
    expect(walletAccountsPath("p1", "c1", "w1")).toBe(
      "/home/partners/p1/c1/w1/accounts",
    );
  });

  it("builds movements path with wallet context", () => {
    expect(movementsPath("p1", "a1", "c1", "w1")).toBe(
      "/home/partners/p1/c1/w1/movements/a1",
    );
  });
});
