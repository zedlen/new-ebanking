import { formatCurrency } from "@utils/functions/formatCurrency";

describe("formatCurrency()", () => {
  it("should format currency MXN", () => {
    expect(formatCurrency(1000, "MXN")).toBe("$1,000.00 MXN");
  });

  it("debechudl return 0 to empty data", () => {
    expect(formatCurrency(undefined, "USD")).toBe("$0.00 USD");
  });

  it("debechudl return 0 MXN to empty data ", () => {
    expect(formatCurrency(undefined, "BCN")).toBe("$0.00 BCN");
  });
  it("should return 0 MXN to empty data ", () => {
    expect(formatCurrency()).toBe("$0.00 MXN");
  });
});
