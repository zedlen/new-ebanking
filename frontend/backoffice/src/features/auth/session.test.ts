import { describe, expect, it, beforeEach } from "vitest";
import {
  clearSession,
  persistSession,
  readStoredSession,
} from "@/features/auth/session";
import {
  SESSION_CUSTOMER_KEY,
  SESSION_PROFILE_KEY,
  SESSION_TOKEN_KEY,
} from "@/lib/constants";

const profile = {
  customer_id: "cust-1",
  customer_type: 1,
  id: 1,
  profile: "admin",
  profile_id: 1,
  role: "admin",
  role_id: 1,
  username: "ops@zeuspay.com",
  name: "Operador ZeusPay",
  email: "ops@zeuspay.com",
  image: "",
};

beforeEach(() => {
  sessionStorage.clear();
});

describe("session", () => {
  it("persists and reads session", () => {
    persistSession({ token: "token-abc", profile });
    const session = readStoredSession();

    expect(session?.token).toBe("token-abc");
    expect(session?.profile.email).toBe("ops@zeuspay.com");
    expect(sessionStorage.getItem(SESSION_TOKEN_KEY)).toBe("token-abc");
    expect(sessionStorage.getItem(SESSION_CUSTOMER_KEY)).toBe("cust-1");
    expect(sessionStorage.getItem(SESSION_PROFILE_KEY)).toContain("Operador");
  });

  it("clears session storage", () => {
    persistSession({ token: "token-abc", profile });
    clearSession();

    expect(readStoredSession()).toBeNull();
    expect(sessionStorage.getItem(SESSION_TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(SESSION_PROFILE_KEY)).toBeNull();
  });
});
