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

  it("successfully returns calculation result with 4-inch default allowances and middleBoardCount", async () => {
    const req = new NextRequest("http://localhost:3000/api/calculate", {
      method: "POST",
      body: JSON.stringify({
        productLength: 46,
        productWidth: 38,
        productHeight: 30,
        productWeight: 800,
        middleBoardCount: 2,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result).toBeDefined();
    // 46 + 4 = 50, 38 + 4 = 42
    expect(data.result.palletDimensions.length).toBe(50);
    expect(data.result.palletDimensions.width).toBe(42);
    // 4 outer (2 left + 2 right) + 2 middle = 6
    expect(data.result.stringerCount).toBe(6);
    expect(data.result.middleBoardCount).toBe(2);
    expect(data.result.cutList.length).toBeGreaterThan(0);
  });

  it("respects custom allowances and middleBoardCount = 1", async () => {
    const req = new NextRequest("http://localhost:3000/api/calculate", {
      method: "POST",
      body: JSON.stringify({
        productLength: 46,
        productWidth: 38,
        productHeight: 30,
        productWeight: 800,
        lengthAllowance: 2.0,
        widthAllowance: 2.0,
        middleBoardCount: 1,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result).toBeDefined();
    expect(data.result.palletDimensions.length).toBe(48);
    expect(data.result.palletDimensions.width).toBe(40);
    expect(data.result.stringerCount).toBe(3);
  });
});
