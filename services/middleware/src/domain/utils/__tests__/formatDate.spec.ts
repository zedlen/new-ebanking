import { formatDate, formatExpirationDate } from "@utils/functions/formatDate";

describe("formatDate", () => {
  it("should format date correctly", () => {
    const emptyDate = formatDate("");
    expect(emptyDate).toBe("-");

    const isoDate = formatDate("2024-12-27T11:34:13.772221Z");
    expect(isoDate).toBe("2024-12-27 11:34");
  });
});

describe("formatExpirationDate", () => {
  it("should format to masked date on empty", () => {
    const expDate = formatExpirationDate();
    expect(expDate).toBe("**/**");
  });

  it("should format to date on data", () => {
    const expDate = formatExpirationDate("2025-03-01");
    expect(expDate).toBe("03/2025");
  });
});
