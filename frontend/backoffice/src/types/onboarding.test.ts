import { describe, expect, it } from "vitest";
import { canApproveProspect, type Prospect } from "@/types/onboarding";

const baseProspect: Prospect = {
  uuid: "p1",
  company_name: "Acme",
  email: "a@test.com",
  rfc: "ACM010101ABC",
  status: "pending",
  requested_kyc: false,
  documents: [{ uuid: "d1", type: "INE", description: "ID", originalName: "ine.pdf", fileUrl: "https://x.com", status: "approved" }],
};

describe("canApproveProspect", () => {
  it("allows when docs are approved or rejected and no kyc block", () => {
    expect(canApproveProspect(baseProspect)).toBe(true);
  });

  it("blocks when kyc requested but not approved", () => {
    expect(
      canApproveProspect({
        ...baseProspect,
        requested_kyc: true,
        kycStatus: { status: "Pending" },
      }),
    ).toBe(false);
  });

  it("blocks when a document is still pending", () => {
    expect(
      canApproveProspect({
        ...baseProspect,
        documents: [
          {
            ...baseProspect.documents[0],
            status: "pending",
          },
        ],
      }),
    ).toBe(false);
  });
});
