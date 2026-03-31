import { NextResponse } from "next/server";
import { calculateShippingCost } from "@/lib/queries/shipping";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const subtotal = parseInt(searchParams.get("subtotal") || "0", 10);

  if (!region) {
    return NextResponse.json({ error: "Región requerida" }, { status: 400 });
  }

  const result = await calculateShippingCost(region, subtotal);
  return NextResponse.json(result);
}
