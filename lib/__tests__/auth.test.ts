// @vitest-environment node
import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "../auth";

describe("Auth Utilities (jose JWT)", () => {
  it("successfully signs and verifies a valid JWT payload", async () => {
    const payload = {
      userId: "user-12345",
      username: "warehouse_lead",
      name: "Marcus Vance",
      role: "supervisor",
    };

    const token = await signToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const decoded = await verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.username).toBe(payload.username);
    expect(decoded?.role).toBe(payload.role);
    expect(decoded?.name).toBe(payload.name);
  });

  it("returns null for invalid or tampered tokens", async () => {
    const result = await verifyToken("invalid.token.string");
    expect(result).toBeNull();
  });
});
