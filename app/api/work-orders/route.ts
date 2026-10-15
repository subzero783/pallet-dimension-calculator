import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import WorkOrder from "@/models/WorkOrder";
import { getCurrentUser } from "@/lib/auth";
import { calculatePallet } from "@/lib/palletEngine";
import { getMemoryOrders, addMemoryOrder } from "@/lib/memoryStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").toLowerCase().trim();
  const status = searchParams.get("status");

  try {
    await connectToDatabase();

    const filter: any = {};
    if (query) {
      filter.$or = [
        { jobId: { $regex: query, $options: "i" } },
        { workOrderId: { $regex: query, $options: "i" } },
        { employeeId: { $regex: query, $options: "i" } },
        { employeeFirstName: { $regex: query, $options: "i" } },
        { productName: { $regex: query, $options: "i" } },
        { customer: { $regex: query, $options: "i" } },
      ];
    }

    if (status && status !== "ALL") {
      filter.status = status;
    }

    const workOrders = await WorkOrder.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ workOrders });
  } catch (error: any) {
    // Graceful fallback to memory store if MongoDB is offline
    let orders = getMemoryOrders();

    if (query) {
      orders = orders.filter(
        (o) =>
          (o.jobId && o.jobId.toLowerCase().includes(query)) ||
          (o.workOrderId && o.workOrderId.toLowerCase().includes(query)) ||
          (o.employeeId && o.employeeId.toLowerCase().includes(query)) ||
          (o.employeeFirstName && o.employeeFirstName.toLowerCase().includes(query)) ||
          (o.productName && o.productName.toLowerCase().includes(query)) ||
          (o.customer && o.customer.toLowerCase().includes(query))
      );
    }

    if (status && status !== "ALL") {
      orders = orders.filter((o) => o.status === status);
    }

    return NextResponse.json({ workOrders: orders });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      jobId,
      workOrderId,
      employeeId,
      employeeFirstName,
      productName,
      customer,
      cadDimensions,
      palletConfig,
      notes,
      status,
    } = body;

    if (!cadDimensions) {
      return NextResponse.json(
        { error: "CAD dimensions are required" },
        { status: 400 }
      );
    }

    const finalJobId =
      jobId?.trim() ||
      workOrderId?.trim() ||
      `JOB-${Math.floor(10000 + Math.random() * 90000)}`;

    const finalProductName = productName?.trim() || "Pallet Assembly";
    const finalCustomer = customer?.trim() || "Pacific Maritime Industries";

    const calculationResult =
      body.calculationResult ||
      calculatePallet({
        productLength: cadDimensions.length,
        productWidth: cadDimensions.width,
        productHeight: cadDimensions.height,
        productWeight: cadDimensions.weight,
        palletStyle: palletConfig?.palletStyle,
        lengthAllowance: palletConfig?.lengthAllowance ?? 4.0,
        widthAllowance: palletConfig?.widthAllowance ?? 4.0,
        deckboardNominal: palletConfig?.deckboardNominal,
        stringerNominal: palletConfig?.stringerNominal,
        targetMaxGap: palletConfig?.targetMaxGap ?? 3.0,
        boardGap: palletConfig?.boardGap ?? palletConfig?.targetMaxGap ?? 3.0,
        middleBoardCount: palletConfig?.middleBoardCount ?? 1,
      });

    const orderPayload = {
      _id: `wo-${Date.now()}`,
      jobId: finalJobId,
      workOrderId: finalJobId,
      employeeId: employeeId?.trim() || "",
      employeeFirstName: employeeFirstName?.trim() || "",
      productName: finalProductName,
      customer: finalCustomer,
      cadDimensions,
      palletConfig: palletConfig || {
        palletStyle: "2-Way Stringer (Flush)",
        lengthAllowance: 4.0,
        widthAllowance: 4.0,
        deckboardNominal: "1x4",
        stringerNominal: "2x4",
        targetMaxGap: 3.0,
        boardGap: 3.0,
        middleBoardCount: 1,
      },
      calculationResult,
      notes: notes || "",
      status: status || "READY_FOR_BUILD",
      createdBy: employeeFirstName
        ? `${employeeFirstName} (${employeeId || "Staff"})`
        : user?.name || user?.username || "Shipping Dept",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await connectToDatabase();
      const existing = await WorkOrder.findOne({
        $or: [{ workOrderId: finalJobId }, { jobId: finalJobId }],
      });
      if (existing) {
        return NextResponse.json(
          { error: `Job ${finalJobId} already exists` },
          { status: 409 }
        );
      }
      const newOrder = await WorkOrder.create(orderPayload);
      return NextResponse.json(
        { message: "Job created successfully", workOrder: newOrder },
        { status: 201 }
      );
    } catch {
      // Memory store save
      addMemoryOrder(orderPayload);
      return NextResponse.json(
        { message: "Job saved to plant register", workOrder: orderPayload },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Create work order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create work order" },
      { status: 500 }
    );
  }
}
