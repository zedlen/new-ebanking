import { describe, expect, it } from "vitest";
import {
  cancelCardPath,
  cardsPath,
  linkCardPath,
} from "@/features/partners/hierarchy";

describe("cards hierarchy paths", () => {
  it("builds customer cards path", () => {
    expect(cardsPath("p1", "c1")).toBe("/home/partners/p1/c1/cards");
  });

  it("builds wallet cards path", () => {
    expect(cardsPath("p1", "c1", "w1")).toBe(
      "/home/partners/p1/c1/w1/cards",
    );
  });

  it("builds link card path", () => {
    expect(linkCardPath("p1", "c1")).toBe("/home/partners/p1/c1/cards/link");
  });

  it("builds cancel card path", () => {
    expect(cancelCardPath("p1", "c1", "card-1", "VIRTUAL")).toBe(
      "/home/partners/p1/c1/cards/card-1/VIRTUAL",
    );
  });
});
