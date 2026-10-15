import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../auth/login/route";
import { NextRequest } from "next/server";

vi.mock("@/lib/database", () => {
  return {
    default: vi.fn().mockRejectedValue(new Error("Database offline for unit test")),
  };
});

describe("Supervisor Login API Route Handler", () => {
  beforeEach(() => {
    process.env.SUPERVISOR_USERNAME = "oliver";
    process.env.SUPERVISOR_PASSWORD = "supervisor2026!";
    process.env.SUPERVISOR_NAME = "Oliver";
  });

  it("authenticates supervisor 'oliver' case-insensitively with correct password", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: "Oliver",
        password: "supervisor2026!",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user).toBeDefined();
    expect(data.user.username).toBe("oliver");
    expect(data.user.role).toBe("supervisor");
    expect(data.user.name).toBe("Oliver");
  });

  it("fails login with incorrect supervisor password", async () => {
    const req = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: "oliver",
        password: "wrong-password",
      }),
    });

    const res = await POST(req);
    // Not matching env credentials, will attempt DB and return 401 or 503
    expect([401, 503]).toContain(res.status);
  });
});
