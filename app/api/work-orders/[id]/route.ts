import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/database";
import WorkOrder from "@/models/WorkOrder";
import { calculatePallet } from "@/lib/palletEngine";
import {
  getMemoryOrders,
  updateMemoryOrder,
  deleteMemoryOrder,
} from "@/lib/memoryStore";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    try {
      await connectToDatabase();
      const isMongoId = mongoose.Types.ObjectId.isValid(id);
      const order = await WorkOrder.findOne(
        isMongoId ? { $or: [{ _id: id }, { workOrderId: id }] } : { workOrderId: id }
      ).lean();

      if (order) {
        return NextResponse.json({ workOrder: order });
      }
    } catch {
      // Fallback to memory store
    }

    const memOrder = getMemoryOrders().find(
      (o) => o._id === id || o.workOrderId === id
    );
    if (!memOrder) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }

    return NextResponse.json({ workOrder: memOrder });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch work order" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    try {
      await connectToDatabase();
      const isMongoId = mongoose.Types.ObjectId.isValid(id);
      const existing = await WorkOrder.findOne(
        isMongoId ? { $or: [{ _id: id }, { workOrderId: id }] } : { workOrderId: id }
      );

      if (existing) {
        if (body.productName) existing.productName = body.productName;
        if (body.customer) existing.customer = body.customer;
        if (body.status) existing.status = body.status;
        if (body.notes !== undefined) existing.notes = body.notes;

        if (body.cadDimensions || body.palletConfig) {
          if (body.cadDimensions) existing.cadDimensions = body.cadDimensions;
          if (body.palletConfig) existing.palletConfig = body.palletConfig;

          existing.calculationResult = calculatePallet({
            productLength: existing.cadDimensions.length,
            productWidth: existing.cadDimensions.width,
            productHeight: existing.cadDimensions.height,
            productWeight: existing.cadDimensions.weight,
            palletStyle: existing.palletConfig.palletStyle as any,
            lengthAllowance: existing.palletConfig.lengthAllowance,
            widthAllowance: existing.palletConfig.widthAllowance,
            deckboardNominal: existing.palletConfig.deckboardNominal as any,
            stringerNominal: existing.palletConfig.stringerNominal as any,
            targetMaxGap: existing.palletConfig.targetMaxGap,
          });
        }

        await existing.save();

        return NextResponse.json({
          message: "Work order updated successfully",
          workOrder: existing,
        });
      }
    } catch {
      // Memory store fallback
    }

    const updated = updateMemoryOrder(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Work order updated successfully",
      workOrder: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update work order" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    try {
      await connectToDatabase();
      const isMongoId = mongoose.Types.ObjectId.isValid(id);
      const deleted = await WorkOrder.findOneAndDelete(
        isMongoId ? { $or: [{ _id: id }, { workOrderId: id }] } : { workOrderId: id }
      );

      if (deleted) {
        return NextResponse.json({
          message: `Work order ${deleted.workOrderId} deleted successfully`,
        });
      }
    } catch {
      // Memory fallback
    }

    const deletedFromMem = deleteMemoryOrder(id);
    if (!deletedFromMem) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Work order ${id} deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete work order" },
      { status: 500 }
    );
  }
}
