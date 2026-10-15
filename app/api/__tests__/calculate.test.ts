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

  it("successfully returns calculation result with 2-inch default allowances applied to both sides and middleBoardCount", async () => {
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
    // 46 + (2 * 2) = 50, 38 + (2 * 2) = 42
    expect(data.result.palletDimensions.length).toBe(50);
    expect(data.result.palletDimensions.width).toBe(42);
    // 4 outer (2 left + 2 right) + 2 middle = 6
    expect(data.result.stringerCount).toBe(6);
    expect(data.result.middleBoardCount).toBe(2);
    expect(data.result.cutList.length).toBe(3);
    expect(data.result.cutList.map((i: any) => i.name)).toEqual([
      "Top Boards",
      "Middle Wood Pieces / Runners",
      "Bottom Boards",
    ]);
  });

  it("respects custom allowances and middleBoardCount = 1", async () => {
    const req = new NextRequest("http://localhost:3000/api/calculate", {
      method: "POST",
      body: JSON.stringify({
        productLength: 46,
        productWidth: 38,
        productHeight: 30,
        productWeight: 800,
        lengthAllowance: 4.0,
        widthAllowance: 4.0,
        middleBoardCount: 1,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.result).toBeDefined();
    // 46 + (2 * 4) = 54, 38 + (2 * 4) = 46
    expect(data.result.palletDimensions.length).toBe(54);
    expect(data.result.palletDimensions.width).toBe(46);
    expect(data.result.stringerCount).toBe(3);
  });
});
