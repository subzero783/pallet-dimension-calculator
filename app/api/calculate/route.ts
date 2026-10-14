import { NextRequest, NextResponse } from "next/server";
import { calculatePallet, PalletInputParams } from "@/lib/palletEngine";

export async function POST(req: NextRequest) {
  try {
    const body: PalletInputParams = await req.json();

    if (!body.productLength || !body.productWidth || !body.productHeight || !body.productWeight) {
      return NextResponse.json(
        { error: "productLength, productWidth, productHeight, and productWeight are required" },
        { status: 400 }
      );
    }

    if (
      body.productLength <= 0 ||
      body.productWidth <= 0 ||
      body.productHeight <= 0 ||
      body.productWeight <= 0
    ) {
      return NextResponse.json(
        { error: "Dimensions and weight must be greater than zero" },
        { status: 400 }
      );
    }

    const result = calculatePallet(body);
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("Calculate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate pallet specification" },
      { status: 500 }
    );
  }
}
