import { NextResponse } from "next/server";
import { CARTS } from "@/lib/carts-data";

export async function GET() {
  return NextResponse.json({ carts: CARTS });
}
