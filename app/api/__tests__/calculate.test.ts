import { describe, it, expect } from "vitest";
import { POST } from "../calculate/route";
import { NextRequest } from "next/server";

describe("Calculate API Route Handler", () => {
  it("returns 400 if required dimensions are missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/calculate", {
      method: "POST",
      body: JSON.stringify({ productLength: 40 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("successfully returns calculation result for valid input", async () => {
    const req = new NextRequest("http://localhost:3000/api/calculate", {
      method: "POST",
      body: JSON.stringify({
        productLength: 46,
        productWidth: 38,
        productHeight: 30,
        productWeight: 800,
        lengthAllowance: 2.0,
        widthAllowance: 2.0,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result).toBeDefined();
    expect(data.result.palletDimensions.length).toBe(48);
    expect(data.result.palletDimensions.width).toBe(40);
    expect(data.result.cutList.length).toBeGreaterThan(0);
  });
});
