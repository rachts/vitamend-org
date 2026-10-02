import { NextResponse } from "next/server";
import { getTransparencyMetrics } from "@/lib/transparency";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const metrics = await getTransparencyMetrics();
    return NextResponse.json({ success: true, metrics }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.error("Transparency metrics error:", error);
    return NextResponse.json({ success: false, error: "Transparency data is temporarily unavailable." }, { status: 503 });
  }
}
