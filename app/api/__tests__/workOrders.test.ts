import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "../work-orders/route";
import { NextRequest } from "next/server";

// Mock database to ensure fast and reliable tests using memory store fallback
vi.mock("@/lib/database", () => {
  return {
    default: vi.fn().mockRejectedValue(new Error("Database offline for unit test")),
  };
});

describe("Work Orders API Route Handler", () => {
  it("saves a job with jobId, employeeId, employeeFirstName, and returns 201", async () => {
    const req = new NextRequest("http://localhost:3000/api/work-orders", {
      method: "POST",
      body: JSON.stringify({
        jobId: "JOB-TEST-402",
        employeeId: "EMP-900",
        employeeFirstName: "Sarah",
        productName: "Marine Propulsion Assembly",
        customer: "Pacific Maritime Industries Corp.",
        cadDimensions: {
          width: 38,
          length: 46,
          height: 32,
          weight: 850,
        },
        palletConfig: {
          palletStyle: "2-Way Stringer (Flush)",
          lengthAllowance: 4,
          widthAllowance: 4,
          deckboardNominal: "1x4",
          stringerNominal: "2x4",
          targetMaxGap: 3,
          boardGap: 3,
          middleBoardCount: 2,
        },
      }),
    });

    const res = await POST(req);
    expect([201, 200]).toContain(res.status);
    const data = await res.json();
    expect(data.workOrder).toBeDefined();
    expect(data.workOrder.jobId).toBe("JOB-TEST-402");
    expect(data.workOrder.employeeId).toBe("EMP-900");
    expect(data.workOrder.employeeFirstName).toBe("Sarah");
    expect(data.workOrder.palletConfig.middleBoardCount).toBe(2);
  });

  it("retrieves work orders list including search filtering", async () => {
    const req = new NextRequest("http://localhost:3000/api/work-orders?q=JOB-TEST-402");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.workOrders)).toBe(true);
    expect(data.workOrders.length).toBeGreaterThan(0);
    expect(data.workOrders[0].jobId).toBe("JOB-TEST-402");
  });
});
