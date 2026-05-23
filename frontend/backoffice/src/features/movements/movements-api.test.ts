import { describe, expect, it } from "vitest";
import { buildMovementBasePath } from "@/features/movements/movements-api";

describe("buildMovementBasePath", () => {
  it("builds partner account path", () => {
    expect(
      buildMovementBasePath({
        partnerId: "p1",
        accountId: "a1",
      }),
    ).toContain("/partners/p1/accounts/a1");
  });

  it("builds wallet account path", () => {
    const path = buildMovementBasePath({
      partnerId: "p1",
      customerId: "c1",
      walletId: "w1",
      accountId: "a1",
    });
    expect(path).toContain("/customers/c1/wallets/w1/accounts/a1");
  });
});
