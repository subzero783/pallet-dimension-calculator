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
        { workOrderId: { $regex: query, $options: "i" } },
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
          o.workOrderId.toLowerCase().includes(query) ||
          o.productName.toLowerCase().includes(query) ||
          o.customer.toLowerCase().includes(query)
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
      workOrderId,
      productName,
      customer,
      cadDimensions,
      palletConfig,
      notes,
      status,
    } = body;

    if (!productName || !customer || !cadDimensions) {
      return NextResponse.json(
        { error: "Product name, customer, and CAD dimensions are required" },
        { status: 400 }
      );
    }

    const finalWorkOrderId =
      workOrderId?.trim() ||
      `WO-${Math.floor(10000 + Math.random() * 90000)}`;

    const calculationResult =
      body.calculationResult ||
      calculatePallet({
        productLength: cadDimensions.length,
        productWidth: cadDimensions.width,
        productHeight: cadDimensions.height,
        productWeight: cadDimensions.weight,
        palletStyle: palletConfig?.palletStyle,
        lengthAllowance: palletConfig?.lengthAllowance,
        widthAllowance: palletConfig?.widthAllowance,
        deckboardNominal: palletConfig?.deckboardNominal,
        stringerNominal: palletConfig?.stringerNominal,
        targetMaxGap: palletConfig?.targetMaxGap,
      });

    const orderPayload = {
      _id: `wo-${Date.now()}`,
      workOrderId: finalWorkOrderId,
      productName,
      customer,
      cadDimensions,
      palletConfig: palletConfig || {
        palletStyle: "2-Way Stringer (Flush)",
        lengthAllowance: 2.0,
        widthAllowance: 2.0,
        deckboardNominal: "1x4",
        stringerNominal: "2x4",
        targetMaxGap: 3.0,
      },
      calculationResult,
      notes: notes || "",
      status: status || "READY_FOR_BUILD",
      createdBy: user?.name || user?.username || "Shipping Dept",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await connectToDatabase();
      const existing = await WorkOrder.findOne({ workOrderId: finalWorkOrderId });
      if (existing) {
        return NextResponse.json(
          { error: `Work order ${finalWorkOrderId} already exists` },
          { status: 409 }
        );
      }
      const newOrder = await WorkOrder.create(orderPayload);
      return NextResponse.json(
        { message: "Work order created successfully", workOrder: newOrder },
        { status: 201 }
      );
    } catch {
      // Memory store save
      addMemoryOrder(orderPayload);
      return NextResponse.json(
        { message: "Work order saved to plant register", workOrder: orderPayload },
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
